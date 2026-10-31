# ConnectPixel Studio v2 — plano técnico de migração (staging)

Levantamento: 30/10/2026 (America/Fortaleza). **Não representa uma migração publicada.**
Base: leitura do Cloudflare autenticado, GitHub e conferência pública de URLs.

## Estado real e fontes

- Domínio do site: https://connectpixel.online/ — **acessível** por consultas HTTP independentes. Não se deve classificar o site como fora do ar com base em erro isolado do navegador.
- Cloudflare identifica o Worker antigo `still-moon-5be3` associado ao domínio; não tem binding R2 visível e seu código publicado não está integrado a este repositório.
- Worker novo `connectpixel-siteadmin`: https://connectpixel-siteadmin.mktdigital663.workers.dev/; código no GitHub `LuckDev26/connectpixel-siteadmin`, branch main. Este Worker possui bindings `ASSETS` e `R2_BUCKET` (= `connectpixel-media`). Seu `/admin/` contém o CMS legado, ainda baseado em `ADMIN_TOKEN`.
- Worker novo **não possui rota/custom domain no domínio oficial**. Publicações nele não equivalem a atualizações da raiz `connectpixel.online`.
- Bucket `connectpixel-media`: 9,38 GB, standard, público por `media.connectpixel.online` e domínio de desenvolvimento `r2.dev`.
- Prefixos vistos no painel: `clientes/`, `feedbacks/`, `imagens/`, `videos/`, `media/`, `content/`.
- `content/`: `site-content.json`, `bio-content.json`, `draft-site-content.json`, `draft-bio-content.json`, `change-log.json`, `versions/`. **Não armazenar backups ou rascunhos sensíveis em bucket publicamente servido sem barreiras de leitura.**
- `clientes/`: arquivos de logos WebP em padrão `cliente-XX.webp`. Site referencia até `cliente-28.webp`; lista da auditoria exibiu 25 na página consultada, portanto **confirmar existência individual antes do lançamento**.
- `feedbacks/`: 8 WebP com nomes de depoimentos.
- `imagens/` e `videos/`: diversas subpastas, não totalmente inventariadas pela UI. Nenhuma conclusão segura sobre duplicação de bytes.

## Catálogo do portfólio

Fonte imutável: `public/main.js`, array `PROJETOS` do site legado.

- 268 itens: 149 vídeos, 108 cards/posts e 11 carrosséis.
- 51 slides totais de carrosséis.
- 308 caminhos únicos de mídia referenciados. **Caminho migrado não significa arquivo validado.**
- Preparado arquivo `migration/portfolio-manifest.json` gerado por `scripts/migrate-portfolio.mjs`.
- Todos os itens têm `migrationStatus: "unverified-r2"` até teste de existência e MIME/codec.
- Não aplicar esse JSON direto no R2 sem validação; mídia e visualização original devem ser preservadas.
- O Worker/site atual não interpreta automaticamente todos os campos do manifesto; o loader CMS precisa de integração completa.


## Verificação completa de mídia (31/10/2026 UTC)

- Verificador de URLs: `scripts/check-r2-media.mjs --all` (308 requisições HTTP HEAD, sem baixar ou modificar objetos).
- Resultado: **306 HTTP 200** e **2 HTTP 404** (99,35% de existência confirmada).
- Ausentes: `videos/acougue/acougue3.mp4` e `videos/acougue/acougue4.mp4`.
- Relatório com 308 URLs, status, tipos MIME e tamanho: `migration/r2-media-audit-20261030.json`.
- Somatório aproximado de `Content-Length` para mídias referenciadas: **9.319.216.768 bytes (9,32 GB decimais)**, próximo ao total de 9,38 GB do bucket.
- Itens grandes identificados: `videos/clinica/clinica1.mp4` (~544 MB), `videos/diversos/padaria/padaria1.mp4` (~305 MB), `videos/diversos/distribuidora/distribuidora1.mp4` (~267 MB). Nenhum arquivo foi recomprimido ou apagado.
- Não eliminar registros de arquivos ausentes sem revisão editorial; marcar como indisponíveis no futuro painel.
- A checagem automática em push permanece como amostra de 18 URLs para não gastar requisições adicionais a cada commit; relatório completo disponível para consulta e novo comando manual.

## Problemas de segurança no CMS legado

1. `/api/content/<qualquer-chave>` é permitido para acesso público pelo código do Worker. Isso inclui chaves de rascunho e de histórico se nomes forem conhecidos.
2. O painel guarda `ADMIN_TOKEN` em `localStorage` por 8 horas (sensível a XSS e acesso local).
3. `/admin/` contém a tela de login no front-end, mas **a visibilidade da tela não é proteção do servidor**. Revisar JWT/sessões/Access no backend.
4. O retorno de APIs e `cors()` incluem `Access-Control-Allow-Origin: *`. Revisar por rota, especialmente conteúdo privado.
5. Upload requer limites de tamanho, tipo MIME, extensão e política de mídia; evitar exposição indevida.
6. Rascunho hoje usa `/?preview=draft` com carregamento pelo mesmo endpoint de conteúdo público. Exige prévia autorizada e expiração curta.
7. A bridge com CRM ConnectPixel existe no Worker; o projeto Supabase `CRM ConnectPixel 2026` possui tabelas/funções CMS, mas **não havia conteúdo publicado para a organização consultada** na auditoria. Não criar duplo editor divergente sem definir fonte canônica.

## Arquitetura proposta (não aplicada)

1. **Congelamento e recuperação**: registrar versão atual do Worker antigo, exportar lista de bindings/rotas e gerar backup **privado** de arquivos críticos. Verificar integridade antes de editar.
2. **Staging isolado**: manter `feat/connectpixel-studio-v2` sem deploy em produção. Testes de código e migração executados por `studio-checks.yml` (sem tokens Cloudflare).
3. **Dados privados**: separar JSON de rascunho, logs e versões do domínio R2 público; preferir bucket privado separado ou dados privados protegidos por Worker sem exposição pública. Nunca apagar mídia existente nessa separação.
4. **Autenticação segura**: substituir token compartilhado por Cloudflare Access ou autenticação de usuários (sessões com autorização no servidor, MFA opcional, papéis). Proteger todos endpoints de gravação e prévias. Bloquear ou proteger a rota workers.dev quando houver domínio próprio.
5. **CMS único**: definir qual sistema é fonte de verdade (R2 privado ou CRM Supabase) e implementar draft/publish/versionamento/rollback sem sobrescritas silenciosas.
6. **Editor visual**: hero, menu, sobre, método ConnectFlow, cases, clientes, nichos, depoimentos, contato, link da bio, SEO, assets e páginas futuras. Prévia fiel com indicação de mudanças não publicadas, autosave de rascunho e histórico.
7. **Biblioteca R2**: listagem paginada, folders, busca, upload guiado, validação de mídia, thumbnails, tamanhos, links em uso, impedir excluir mídia referenciada, upload direto seguro para vídeos grandes.
8. **Validação de URLs**: checar 308 caminhos no R2 e identificar arquivos em falta, nomes com diferenças de caixa, vídeos MOV/MP4 duplicados e thumbnails sem apagar nada.
9. **Staging público protegido**: testar em um endereço de homologação, sem interferir em `connectpixel.online`; validar mobile/PWA, SEO, sitemap, OpenGraph, SW cache, performance, acessibilidade e Cloudflare bindings.
10. **Cutover controlado**: só depois de verificação e rollback documentado associar o Worker novo ao domínio oficial, preservando Worker legado como plano de retorno.

## Gates de aceite para deploy

- Nenhum endpoint público acessa `draft-*`, `versions/`, `change-log` ou logs internos.
- Acesso de admin só por sessão autorizada validada no backend; revisão de privilégio, CSRF/CORS/XSS e acesso pelo workers.dev.
- Editar/publicar funciona sem perder conteúdo legado; preview não aparece sem autorização.
- 268 projetos migrados e 308 referências verificadas (com faltantes sinalizadas).
- Backup e restore testados (sem excluir bucket antigo).
- Roteamento real de `connectpixel.online` conferido, sem inferência a partir de tela do dashboard.
- CI na branch verde; deploy produção apenas após teste manual de staging.

## Comandos de desenvolvimento

```sh
node scripts/portfolio-migration.test.mjs
node scripts/migrate-portfolio.mjs
node scripts/migrate-portfolio.mjs --write
npm test
```

**Esta branch é preparação, não publicação.** O workflow da branch não usa credenciais Cloudflare nem chama Wrangler deploy.

## Painel Studio — melhorias já implementadas em staging

- `public/admin/studio.css`: tratamento visual premium mais limpo, sidebar 264 px e estado recolhido de 78 px, cards responsivos, foco acessível e menu mobile.
- `public/admin/studio.js`: recolher menu, abrir/fechar menu no celular, persistência da aba e da subaba abertas na sessão do navegador, atributos ARIA e tecla Escape.
- `public/admin/index.html`: inclusão dos assets do Studio; correção da versão V12 que continha sequências literais `\\n` entre instruções JavaScript e impedia a interpretação adequada; correção da referência `window.siteData` que ignorava o estado léxico `siteData`.
- `scripts/studio-ui.test.mjs`: valida que os scripts inline do painel compilam, que os assets carregam e que o recurso de navegação está referenciado.
- GitHub Actions `studio-checks.yml` valida testes legado, frontend Studio, catálogo, amostra R2 e consistência do manifesto. **Não faz deploy.**
- Não foi feita inspeção visual do novo layout no navegador. Antes de produção, validar contrastes, menu recolhido, navegação e persistência em staging.
- **Autenticação e separação do R2 privado continuam pendentes**: a melhoria de interface NÃO torna a versão legado segura para produção.
