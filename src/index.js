const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".txt": "text/plain; charset=utf-8"
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    try {
      if (url.pathname.startsWith("/api/")) {
        return await handleApi(request, env, url);
      }

      return await serveAsset(request, env, url);
    } catch (err) {
      return json({ error: err.message || String(err) }, err.status || 500);
    }
  }
};

async function handleApi(request, env, url) {
  const parts = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  const isAdmin = parts[0] === "admin";

  if (isAdmin) requireAuth(request, env);

  if (parts[0] === "content") {
    return await getContent(env, safeKey(parts[1] || "site-content"));
  }

  if (isAdmin && parts[1] === "content") {
    const key = safeKey(parts[2] || "site-content");
    if (request.method === "GET") return await getContent(env, key);
    if (request.method === "PUT") return await putContent(request, env, key);
  }

  if (isAdmin && parts[1] === "media" && request.method === "POST") {
    return await uploadMedia(request, env);
  }

  if (isAdmin && parts[1] === "media" && request.method === "DELETE") {
    const key = url.searchParams.get("key");
    if (!key) return json({ error: "key obrigatório" }, 400);
    await bucket(env).delete(key);
    return json({ ok: true, deleted: key });
  }

  return json({ error: "Rota não encontrada" }, 404);
}

async function serveAsset(request, env, url) {
  let pathname = url.pathname;

  // Rotas amigáveis
  if (pathname === "") pathname = "/";
  if (pathname.endsWith("/")) pathname += "index.html";
  if (!pathname.includes(".") && pathname !== "/") pathname = pathname + "/index.html";

  const assetUrl = new URL(request.url);
  assetUrl.pathname = pathname;

  const response = await env.ASSETS.fetch(new Request(assetUrl, request));

  if (response.status !== 404) {
    const headers = new Headers(response.headers);
    applyCacheHeaders(pathname, headers);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  // fallback para SPA/rotas internas
  const fallbackUrl = new URL(request.url);
  fallbackUrl.pathname = "/index.html";
  return env.ASSETS.fetch(new Request(fallbackUrl, request));
}

function applyCacheHeaders(pathname, headers) {
  if (
    pathname.endsWith(".html") ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/content/") ||
    pathname === "/config.js" ||
    pathname === "/sw.js"
  ) {
    headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return;
  }

  if (/\.(png|jpg|jpeg|webp|svg|gif|ico|mp4|woff2?)$/i.test(pathname)) {
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
  }
}

function bucket(env) {
  const b = env.R2_BUCKET || env.CONNECTPIXEL_R2 || env.MEDIA_BUCKET;
  if (!b) throw new HttpError("Configure o binding R2_BUCKET no Cloudflare Worker.", 500);
  return b;
}

async function getContent(env, key) {
  const objectKey = `content/${key}.json`;
  const obj = await bucket(env).get(objectKey);

  if (!obj) {
    // Fallback inicial: tenta servir do assets/public/content
    const fallbackUrl = new URL("https://worker.local/content/" + key + ".json");
    const fallback = await env.ASSETS.fetch(new Request(fallbackUrl));
    if (fallback.ok) {
      return new Response(await fallback.text(), {
        headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders() }
      });
    }
    return json({ meta: { fallback: true }, site: {}, bio: {} });
  }

  return new Response(await obj.text(), {
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders() }
  });
}

async function putContent(request, env, key) {
  const body = await request.text();
  JSON.parse(body);

  await bucket(env).put(`content/${key}.json`, body, {
    httpMetadata: { contentType: "application/json; charset=utf-8" }
  });

  return json({ ok: true, key, savedAt: new Date().toISOString() });
}

async function uploadMedia(request, env) {
  const form = await request.formData();
  const file = form.get("file");
  const folder = sanitize(String(form.get("folder") || "uploads"));
  const customName = sanitize(String(form.get("name") || ""));

  if (!file || typeof file === "string") return json({ error: "Arquivo obrigatório" }, 400);

  const ext = extension(file.name, file.type);
  const stamp = new Date().toISOString().slice(0, 10);
  const id = crypto.randomUUID();
  const base = customName || sanitize(file.name.replace(/\.[^.]+$/, ""));
  const key = `media/${folder}/${stamp}/${base}-${id}${ext}`;

  await bucket(env).put(key, file.stream(), {
    httpMetadata: { contentType: file.type || "application/octet-stream" }
  });

  const publicBase = (env.PUBLIC_R2_BASE_URL || "").replace(/\/$/, "");
  return json({
    ok: true,
    key,
    contentType: file.type,
    size: file.size,
    url: publicBase ? `${publicBase}/${key}` : key
  });
}

function requireAuth(request, env) {
  const expected = env.ADMIN_TOKEN;
  if (!expected) throw new HttpError("ADMIN_TOKEN não configurado.", 500);

  const auth = request.headers.get("Authorization") || "";
  if (auth !== `Bearer ${expected}`) throw new HttpError("Não autorizado.", 401);
}

function safeKey(key) {
  if (!/^[a-z0-9_-]+$/i.test(key)) throw new HttpError("Chave inválida.", 400);
  return key;
}

function sanitize(value) {
  return value
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "arquivo";
}

function extension(name, type) {
  const m = name.match(/\.[a-z0-9]+$/i);
  if (m) return m[0].toLowerCase();
  if (type.includes("png")) return ".png";
  if (type.includes("jpeg")) return ".jpg";
  if (type.includes("webp")) return ".webp";
  if (type.includes("mp4")) return ".mp4";
  return "";
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders() }
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization"
  };
}

class HttpError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}
