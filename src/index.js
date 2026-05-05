export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors() });
    }

    try {
      if (url.pathname.startsWith("/api/")) {
        return await api(request, env, url);
      }

      let p = url.pathname;
      if (p.endsWith("/")) p += "index.html";
      if (!p.includes(".") && p !== "/") p += "/index.html";

      const assetUrl = new URL(request.url);
      assetUrl.pathname = p;

      const res = await env.ASSETS.fetch(new Request(assetUrl, request));
      if (res.status !== 404) return res;

      assetUrl.pathname = "/index.html";
      return env.ASSETS.fetch(new Request(assetUrl, request));
    } catch (e) {
      return json({ ok: false, error: e.message || String(e) }, e.status || 500);
    }
  }
};

async function api(req, env, url) {
  const parts = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  const admin = parts[0] === "admin";

  if (admin) auth(req, env);

  if (admin && parts[1] === "diagnostics") return diagnostics(env);
  if (admin && parts[1] === "save-draft" && req.method === "POST") return saveDraft(req, env);
  if (admin && parts[1] === "publish" && req.method === "POST") return publishContent(req, env);
  if (admin && parts[1] === "history" && req.method === "GET") return listHistory(env);
  if (admin && parts[1] === "restore-version" && req.method === "POST") return restoreVersion(req, env);
  if (admin && parts[1] === "reset-defaults" && req.method === "POST") return resetDefaults(env);
  if (admin && parts[1] === "media" && parts[2] === "list" && req.method === "GET") return listMedia(env, url);
  if (admin && parts[1] === "media" && req.method === "POST") return upload(req, env);
  if (admin && parts[1] === "media" && req.method === "DELETE") return deleteMedia(env, url);

  if (parts[0] === "content") {
    return getContent(env, safe(parts[1] || "site-content"));
  }

  if (admin && parts[1] === "content") {
    const key = safe(parts[2] || "site-content");
    if (req.method === "GET") return getContent(env, key);
    if (req.method === "PUT") return putContent(req, env, key);
  }

  return json({ ok: false, error: "Rota não encontrada" }, 404);
}

function hasBucket(env) {
  return !!(env.R2_BUCKET || env.CONNECTPIXEL_R2 || env.MEDIA_BUCKET);
}

function bucket(env) {
  const b = env.R2_BUCKET || env.CONNECTPIXEL_R2 || env.MEDIA_BUCKET;
  if (!b) {
    throw new E("R2_BUCKET não configurado em Settings > Bindings ou no wrangler.toml. Sem isso, o painel carrega, mas não consegue salvar.", 500);
  }
  return b;
}

function diagnostics(env) {
  return json({
    ok: true,
    hasAdminToken: !!env.ADMIN_TOKEN,
    hasR2Bucket: hasBucket(env),
    hasPublicR2BaseUrl: !!env.PUBLIC_R2_BASE_URL,
    publicR2BaseUrl: env.PUBLIC_R2_BASE_URL || "",
    mode: "worker-assets-cms-v10"
  });
}

async function assetText(env, key) {
  const u = new URL("https://assets.local/content/" + key + ".json");
  const f = await env.ASSETS.fetch(new Request(u));
  if (!f.ok) throw new E("Arquivo padrão não encontrado: public/content/" + key + ".json", 500);
  const text = await f.text();
  JSON.parse(text);
  return text;
}

async function getContent(env, key) {
  if (hasBucket(env)) {
    const obj = await bucket(env).get(`content/${key}.json`);
    if (obj) {
      return new Response(await obj.text(), {
        headers: { "Content-Type": "application/json; charset=utf-8", ...cors() }
      });
    }
  }

  try {
    const text = await assetText(env, key);
    return new Response(text, {
      headers: { "Content-Type": "application/json; charset=utf-8", ...cors() }
    });
  } catch (e) {
    return json({ meta: { fallback: true }, site: {}, bio: {} });
  }
}

async function putContent(req, env, key) {
  const body = await req.text();
  JSON.parse(body);
  await bucket(env).put(`content/${key}.json`, body, {
    httpMetadata: { contentType: "application/json; charset=utf-8" }
  });
  return json({ ok: true, key, savedAt: new Date().toISOString() });
}

async function saveDraft(req, env) {
  const data = await req.json();
  const siteText = JSON.stringify(data.siteContent || data.site || {}, null, 2);
  const bioText = JSON.stringify(data.bioContent || data.bio || {}, null, 2);

  await bucket(env).put("content/draft-site-content.json", siteText, {
    httpMetadata: { contentType: "application/json; charset=utf-8" }
  });
  await bucket(env).put("content/draft-bio-content.json", bioText, {
    httpMetadata: { contentType: "application/json; charset=utf-8" }
  });

  await appendLog(env, {
    action: "Rascunho salvo",
    summary: data.summary || "Conteúdo salvo como rascunho.",
    tab: data.tab || "geral"
  });

  return json({ ok: true, savedAt: new Date().toISOString() });
}

async function publishContent(req, env) {
  const data = await req.json();
  const b = bucket(env);
  const now = new Date().toISOString();
  const versionId = now.replace(/[:.]/g, "-");

  const liveSite = await readCurrentOrDefaultText(env, "site-content");
  const liveBio = await readCurrentOrDefaultText(env, "bio-content");

  await b.put(`content/versions/${versionId}/site-content.json`, liveSite, {
    httpMetadata: { contentType: "application/json; charset=utf-8" }
  });
  await b.put(`content/versions/${versionId}/bio-content.json`, liveBio, {
    httpMetadata: { contentType: "application/json; charset=utf-8" }
  });
  await b.put(`content/versions/${versionId}/meta.json`, JSON.stringify({
    versionId,
    createdAt: now,
    reason: "Backup automático antes de publicar"
  }, null, 2), {
    httpMetadata: { contentType: "application/json; charset=utf-8" }
  });

  const siteText = JSON.stringify(data.siteContent || data.site || {}, null, 2);
  const bioText = JSON.stringify(data.bioContent || data.bio || {}, null, 2);

  await b.put("content/site-content.json", siteText, {
    httpMetadata: { contentType: "application/json; charset=utf-8" }
  });
  await b.put("content/bio-content.json", bioText, {
    httpMetadata: { contentType: "application/json; charset=utf-8" }
  });

  await appendLog(env, {
    action: "Publicação realizada",
    summary: data.summary || "Alterações publicadas no site.",
    tab: data.tab || "geral",
    backupVersionId: versionId
  });

  return json({ ok: true, publishedAt: now, backupVersionId: versionId });
}

async function readCurrentOrDefaultText(env, key) {
  if (hasBucket(env)) {
    const obj = await bucket(env).get(`content/${key}.json`);
    if (obj) return await obj.text();
  }
  return await assetText(env, key);
}

async function listHistory(env) {
  const res = await bucket(env).list({ prefix: "content/versions/", limit: 1000 });
  const map = {};
  for (const obj of res.objects || []) {
    const m = obj.key.match(/^content\/versions\/([^/]+)\/(.+)$/);
    if (!m) continue;
    const id = m[1];
    map[id] ||= { versionId: id, createdAt: id, keys: [], size: 0 };
    map[id].keys.push(obj.key);
    map[id].size += obj.size || 0;
    if (!map[id].uploaded || obj.uploaded > map[id].uploaded) map[id].uploaded = obj.uploaded;
  }
  const versions = Object.values(map)
    .filter(v => v.keys.some(k => k.endsWith("site-content.json")) && v.keys.some(k => k.endsWith("bio-content.json")))
    .sort((a, b) => String(b.versionId).localeCompare(String(a.versionId)))
    .slice(0, 100);
  return json({ ok: true, versions });
}

async function restoreVersion(req, env) {
  const data = await req.json();
  const versionId = safeVersion(data.versionId || "");
  const target = data.target === "live" ? "live" : "draft";
  const b = bucket(env);

  const site = await b.get(`content/versions/${versionId}/site-content.json`);
  const bio = await b.get(`content/versions/${versionId}/bio-content.json`);
  if (!site || !bio) throw new E("Versão não encontrada no histórico.", 404);

  const siteText = await site.text();
  const bioText = await bio.text();

  const siteKey = target === "live" ? "content/site-content.json" : "content/draft-site-content.json";
  const bioKey = target === "live" ? "content/bio-content.json" : "content/draft-bio-content.json";

  await b.put(siteKey, siteText, { httpMetadata: { contentType: "application/json; charset=utf-8" } });
  await b.put(bioKey, bioText, { httpMetadata: { contentType: "application/json; charset=utf-8" } });

  await appendLog(env, {
    action: target === "live" ? "Versão restaurada no site publicado" : "Versão restaurada como rascunho",
    summary: `Versão ${versionId} restaurada em ${target}.`,
    tab: "histórico",
    versionId
  });

  return json({
    ok: true,
    restoredAt: new Date().toISOString(),
    target,
    siteContent: JSON.parse(siteText),
    bioContent: JSON.parse(bioText)
  });
}

async function resetDefaults(env) {
  const b = bucket(env);
  const now = new Date().toISOString();
  const versionId = "before-reset-" + now.replace(/[:.]/g, "-");

  const liveSite = await readCurrentOrDefaultText(env, "site-content");
  const liveBio = await readCurrentOrDefaultText(env, "bio-content");

  await b.put(`content/versions/${versionId}/site-content.json`, liveSite, {
    httpMetadata: { contentType: "application/json; charset=utf-8" }
  });
  await b.put(`content/versions/${versionId}/bio-content.json`, liveBio, {
    httpMetadata: { contentType: "application/json; charset=utf-8" }
  });

  const siteText = await assetText(env, "site-content");
  const bioText = await assetText(env, "bio-content");

  await b.put("content/site-content.json", siteText, { httpMetadata: { contentType: "application/json; charset=utf-8" } });
  await b.put("content/bio-content.json", bioText, { httpMetadata: { contentType: "application/json; charset=utf-8" } });
  await b.put("content/draft-site-content.json", siteText, { httpMetadata: { contentType: "application/json; charset=utf-8" } });
  await b.put("content/draft-bio-content.json", bioText, { httpMetadata: { contentType: "application/json; charset=utf-8" } });

  await appendLog(env, {
    action: "Padrão original restaurado",
    summary: "Conteúdo original do pacote restaurado.",
    tab: "publicação",
    backupVersionId: versionId
  });

  return json({
    ok: true,
    restoredAt: now,
    backupVersionId: versionId,
    siteContent: JSON.parse(siteText),
    bioContent: JSON.parse(bioText)
  });
}

async function appendLog(env, entry) {
  let logs = [];
  try {
    const obj = await bucket(env).get("content/change-log.json");
    if (obj) {
      const parsed = JSON.parse(await obj.text());
      logs = Array.isArray(parsed.logs) ? parsed.logs : [];
    }
  } catch (e) {}

  logs.unshift({
    date: new Date().toLocaleString("pt-BR"),
    iso: new Date().toISOString(),
    ...entry
  });

  logs = logs.slice(0, 250);
  await bucket(env).put("content/change-log.json", JSON.stringify({ logs }, null, 2), {
    httpMetadata: { contentType: "application/json; charset=utf-8" }
  });
}

async function listMedia(env, url) {
  const prefix = url.searchParams.get("prefix") || "media/";
  const listed = await bucket(env).list({ prefix, limit: 1000 });
  const base = (env.PUBLIC_R2_BASE_URL || "").replace(/\/$/, "");
  const objects = (listed.objects || [])
    .filter(o => !o.key.endsWith("/"))
    .map(o => ({
      key: o.key,
      url: base ? `${base}/${o.key}` : o.key,
      size: o.size || 0,
      uploaded: o.uploaded || null
    }))
    .sort((a, b) => String(b.uploaded || "").localeCompare(String(a.uploaded || "")));
  return json({ ok: true, objects });
}

async function deleteMedia(env, url) {
  const key = url.searchParams.get("key");
  if (!key) throw new E("Informe a key da mídia para excluir.", 400);
  if (!key.startsWith("media/")) throw new E("Só é permitido excluir arquivos dentro da pasta media/.", 400);
  await bucket(env).delete(key);
  await appendLog(env, { action: "Mídia excluída", summary: key, tab: "mídias" });
  return json({ ok: true, deleted: key });
}

async function upload(req, env) {
  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") return json({ ok: false, error: "Arquivo obrigatório" }, 400);

  const folder = clean(String(form.get("folder") || "uploads"));
  const name = clean(String(form.get("name") || file.name.replace(/\.[^.]+$/, "")));
  const ext = (file.name.match(/\.[a-z0-9]+$/i) || [""])[0].toLowerCase();
  const key = `media/${folder}/${new Date().toISOString().slice(0, 10)}/${name}-${crypto.randomUUID()}${ext}`;

  await bucket(env).put(key, file.stream(), {
    httpMetadata: { contentType: file.type || "application/octet-stream" }
  });

  const base = (env.PUBLIC_R2_BASE_URL || "").replace(/\/$/, "");
  await appendLog(env, { action: "Mídia enviada", summary: key, tab: "mídias" });
  return json({ ok: true, key, url: base ? `${base}/${key}` : key });
}

function auth(req, env) {
  if (!env.ADMIN_TOKEN) throw new E("ADMIN_TOKEN não configurado em Settings > Variables and Secrets.", 500);
  if ((req.headers.get("Authorization") || "") !== `Bearer ${env.ADMIN_TOKEN}`) {
    throw new E("Não autorizado.", 401);
  }
}

function safe(k) {
  if (!/^[a-z0-9_-]+$/i.test(k)) throw new E("Chave inválida.", 400);
  return k;
}

function safeVersion(k) {
  if (!/^[a-z0-9T._:-]+$/i.test(k)) throw new E("Versão inválida.", 400);
  return k;
}

function clean(s) {
  return s
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "arquivo";
}

function json(d, status = 200) {
  return new Response(JSON.stringify(d, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...cors() }
  });
}

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization"
  };
}

class E extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
