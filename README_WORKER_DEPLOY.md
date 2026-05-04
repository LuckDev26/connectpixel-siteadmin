# ConnectPixel — versão Worker + Assets

Esta versão foi adaptada para o fluxo novo da Cloudflare que aparece como Worker com deploy via Wrangler.

## Estrutura

- `public/` — site, link da bio, painel e assets estáticos.
- `src/index.js` — Worker que serve o site e a API do painel.
- `wrangler.toml` — configuração do Worker + Static Assets.
- `package.json` — script de deploy.

## Tela do Cloudflare

Na tela que aparece para você:

- Build command: deixe vazio
- Deploy command: `npx wrangler deploy`
- Path: `/`

Se pedir API token, pode deixar em "Create new token" e escolher um nome, por exemplo:
`connectpixel-worker-deploy`

## Depois do deploy

Configure no Cloudflare:

1. `ADMIN_TOKEN` como secret/variable do Worker.
2. Binding R2 com o nome exato: `R2_BUCKET`.
3. Opcional: `PUBLIC_R2_BASE_URL` com o domínio público do R2.

## Rotas

- `/` — site principal
- `/bio/` — link da bio
- `/admin/` — painel administrativo
- `/api/admin/content/site-content` — conteúdo do site
- `/api/admin/content/bio-content` — conteúdo da bio
- `/api/admin/media` — upload para R2
