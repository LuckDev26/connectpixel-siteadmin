PAINEL ADMINISTRATIVO CONNECTPIXEL

Rotas:
- /admin/  Painel administrativo
- /api/admin/content/site-content
- /api/admin/content/bio-content
- /api/admin/media

Configuração no Cloudflare Pages:
1. Suba este pacote.
2. Em Settings > Environment variables, crie:
   ADMIN_TOKEN = uma senha/token forte
   PUBLIC_R2_BASE_URL = domínio público do R2, se tiver
3. Em Settings > Functions > R2 bucket bindings:
   Nome do binding: R2_BUCKET
   Bucket: seu bucket R2

Observação:
Esta versão cria o painel personalizado com a identidade visual da ConnectPixel, API para salvar JSON no R2 e upload de mídia.
A próxima etapa será conectar cada seção pública do HTML para consumir automaticamente os JSONs salvos pelo painel.
