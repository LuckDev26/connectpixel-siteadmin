/* ══════════════════════════════════════════════════════════════
   📋 COMO EDITAR OS PROJETOS:
   
   Cada item tem:
   - nicho: categoria do filtro (tem que existir em NICHOS abaixo)
   - tipo: "video" ou "post"
   - titulo: título do card
   - desc: descrição curta
   - Para VÍDEO: url com link do YouTube ou Vimeo
   - Para POST: img com URL da imagem (pode ser link do Drive, Instagram, etc.)
   
   Para ADICIONAR: copie um bloco { ... } e cole no array
   Para REMOVER: apague o bloco { ... } correspondente
══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════ CLOUDFLARE R2 ══════════════════════════════
   Edite o arquivo /config.js e coloque a URL pública do seu bucket R2.
   Exemplo: window.CP_CONFIG.mediaBaseUrl = "https://media.seudominio.com.br";
   Mantendo vazio, o site usa arquivos locais nas pastas videos/, imagens/, clientes/ e feedbacks/.
══════════════════════════════════════════════════════════════ */
const CP_CONFIG = window.CP_CONFIG || {};
const MEDIA_BASE_URL = String(CP_CONFIG.mediaBaseUrl || "").replace(/\/+$/, "");
function mediaUrl(path) {
  if (!path) return path;
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:")) return path;
  const cleanPath = String(path).replace(/^\/+/, "");
  if (MEDIA_BASE_URL && /^(videos|imagens|clientes|feedbacks)\//i.test(cleanPath)) {
    return `${MEDIA_BASE_URL}/${cleanPath}`;
  }
  return path;
}
function rewriteStaticMediaPaths() {
  if (!MEDIA_BASE_URL) return;
  document.querySelectorAll('img[src]').forEach((el) => {
    const src = el.getAttribute('src') || '';
    if (/^(clientes|feedbacks|imagens|videos)\//i.test(src)) el.setAttribute('src', mediaUrl(src));
  });
}
document.addEventListener('DOMContentLoaded', rewriteStaticMediaPaths);
function normalizeProjetoMedia(item) {
  if (item.url) item.url = mediaUrl(item.url);
  if (item.img) item.img = mediaUrl(item.img);
  if (item.thumb) item.thumb = mediaUrl(item.thumb);
  if (Array.isArray(item.imgs)) item.imgs = item.imgs.map(mediaUrl);
  return item;
}

const NICHOS = [
  "Advocacia", "Varejo", "Hotelaria", "Construção", "Clínica",
  "Ótica", "Açougue", "Provedor de Internet", "Financeiro",
  "Nichos Diversos"
];

const PROJETOS = [

  // ── AÇOUGUE ──────────────────────────────────
  { nicho:"Açougue", tipo:"video", titulo:"Açougue 1", url:"videos/acougue/acougue1.mp4" },
  { nicho:"Açougue", tipo:"video", titulo:"Açougue 2", url:"videos/acougue/acougue2.mp4" },
  { nicho:"Açougue", tipo:"video", titulo:"Açougue 3", url:"videos/acougue/acougue3.mp4" },
  { nicho:"Açougue", tipo:"video", titulo:"Açougue 4", url:"videos/acougue/acougue4.mp4" },

  // ── ADVOCACIA ──────────────────────────────────
  { nicho:"Advocacia", tipo:"video", titulo:"Advocacia 1", url:"videos/advocacia/advocacia1.mp4" },
  { nicho:"Advocacia", tipo:"video", titulo:"Advocacia 10", url:"videos/advocacia/advocacia10.mp4" },
  { nicho:"Advocacia", tipo:"video", titulo:"Advocacia 11", url:"videos/advocacia/advocacia11.mp4" },
  { nicho:"Advocacia", tipo:"video", titulo:"Advocacia 12", url:"videos/advocacia/advocacia12.mp4" },
  { nicho:"Advocacia", tipo:"video", titulo:"Advocacia 13", url:"videos/advocacia/advocacia13.mov" },
  { nicho:"Advocacia", tipo:"video", titulo:"Advocacia 13", url:"videos/advocacia/advocacia13.mp4" },
  { nicho:"Advocacia", tipo:"video", titulo:"Advocacia 2", url:"videos/advocacia/advocacia2.mp4" },
  { nicho:"Advocacia", tipo:"video", titulo:"Advocacia 3", url:"videos/advocacia/advocacia3.mp4" },
  { nicho:"Advocacia", tipo:"video", titulo:"Advocacia 4", url:"videos/advocacia/advocacia4.mp4" },
  { nicho:"Advocacia", tipo:"video", titulo:"Advocacia 5", url:"videos/advocacia/advocacia5.mp4" },
  { nicho:"Advocacia", tipo:"video", titulo:"Advocacia 6", url:"videos/advocacia/advocacia6.mp4" },
  { nicho:"Advocacia", tipo:"video", titulo:"Advocacia 7", url:"videos/advocacia/advocacia7.mp4" },
  { nicho:"Advocacia", tipo:"video", titulo:"Advocacia 8", url:"videos/advocacia/advocacia8.mp4" },
  { nicho:"Advocacia", tipo:"video", titulo:"Advocacia 9", url:"videos/advocacia/advocacia9.mp4" },

  // ── CLÍNICA ──────────────────────────────────
  { nicho:"Clínica", tipo:"video", titulo:"Clínica 1", url:"videos/clinica/clinica1.mp4" },
  { nicho:"Clínica", tipo:"video", titulo:"Clínica 2", url:"videos/clinica/clinica2.mp4" },

  // ── CONSTRUÇÃO ──────────────────────────────────
  { nicho:"Construção", tipo:"video", titulo:"Construção 1", url:"videos/construcao/construcao1.mp4" },
  { nicho:"Construção", tipo:"video", titulo:"Construção 2", url:"videos/construcao/construcao2.mp4" },

  // ── NICHOS DIVERSOS — ACADEMIA ──────────────────────────────────
  { nicho:"Nichos Diversos", subcategoria:"Academia", tipo:"video", titulo:"Academia 1", url:"videos/diversos/academia/academia1.mp4" },
  { nicho:"Nichos Diversos", subcategoria:"Academia", tipo:"video", titulo:"Academia 2", url:"videos/diversos/academia/Academia2.mp4" },

  // ── NICHOS DIVERSOS — AUTO CENTER ──────────────────────────────────
  { nicho:"Nichos Diversos", subcategoria:"Auto Center", tipo:"video", titulo:"Auto Center 10", url:"videos/diversos/autocenter/autocenter10.mp4" },
  { nicho:"Nichos Diversos", subcategoria:"Auto Center", tipo:"video", titulo:"Auto Center 2", url:"videos/diversos/autocenter/autocenter2.mp4" },
  { nicho:"Nichos Diversos", subcategoria:"Auto Center", tipo:"video", titulo:"Auto Center 3", url:"videos/diversos/autocenter/autocenter3.mp4" },
  { nicho:"Nichos Diversos", subcategoria:"Auto Center", tipo:"video", titulo:"Auto Center 4", url:"videos/diversos/autocenter/autocenter4.mp4" },
  { nicho:"Nichos Diversos", subcategoria:"Auto Center", tipo:"video", titulo:"Auto Center 5", url:"videos/diversos/autocenter/autocenter5.mp4" },
  { nicho:"Nichos Diversos", subcategoria:"Auto Center", tipo:"video", titulo:"Auto Center 6", url:"videos/diversos/autocenter/autocenter6.mp4" },
  { nicho:"Nichos Diversos", subcategoria:"Auto Center", tipo:"video", titulo:"Auto Center 7", url:"videos/diversos/autocenter/autocenter7.mp4" },
  { nicho:"Nichos Diversos", subcategoria:"Auto Center", tipo:"video", titulo:"Auto Center 8", url:"videos/diversos/autocenter/autocenter8.mp4" },
  { nicho:"Nichos Diversos", subcategoria:"Auto Center", tipo:"video", titulo:"Auto Center 9", url:"videos/diversos/autocenter/autocenter9.mp4" },

  // ── NICHOS DIVERSOS — DISTRIBUIDORA ──────────────────────────────────
  { nicho:"Nichos Diversos", subcategoria:"Distribuidora", tipo:"video", titulo:"Distribuidora 1", url:"videos/diversos/distribuidora/distribuidora1.mp4" },

  // ── NICHOS DIVERSOS — EMPÓRIO ──────────────────────────────────
  { nicho:"Nichos Diversos", subcategoria:"Empório", tipo:"video", titulo:"Empório 1", url:"videos/diversos/emporio/emporio1.mp4" },

  // ── NICHOS DIVERSOS — ESTAMPARIA ──────────────────────────────────
  { nicho:"Nichos Diversos", subcategoria:"Estamparia", tipo:"video", titulo:"Estamparia 1", url:"videos/diversos/estamparia/Estamparia1.mp4" },

  // ── NICHOS DIVERSOS — MARMITARIA ──────────────────────────────────
  { nicho:"Nichos Diversos", subcategoria:"Marmitaria", tipo:"video", titulo:"Marmitaria 2", url:"videos/diversos/marmitaria/marmitaria2.mp4" },
  { nicho:"Nichos Diversos", subcategoria:"Marmitaria", tipo:"video", titulo:"Marmitaria 3", url:"videos/diversos/marmitaria/marmitaria3.mp4" },

  // ── NICHOS DIVERSOS — PADARIA ──────────────────────────────────
  { nicho:"Nichos Diversos", subcategoria:"Padaria", tipo:"video", titulo:"Padaria 1", url:"videos/diversos/padaria/padaria1.mp4" },

  // ── NICHOS DIVERSOS — PETSHOP ──────────────────────────────────
  { nicho:"Nichos Diversos", subcategoria:"Petshop", tipo:"video", titulo:"Petshop 1", url:"videos/diversos/petshop/petshop1.mp4" },

  // ── FINANCEIRO ──────────────────────────────────
  { nicho:"Financeiro", tipo:"video", titulo:"Financeiro 1", url:"videos/financeiro/financeiro1.mp4" },
  { nicho:"Financeiro", tipo:"video", titulo:"Financeiro 10", url:"videos/financeiro/financeiro10.mp4" },
  { nicho:"Financeiro", tipo:"video", titulo:"Financeiro 11", url:"videos/financeiro/financeiro11.mp4" },
  { nicho:"Financeiro", tipo:"video", titulo:"Financeiro 12", url:"videos/financeiro/financeiro12.mp4" },
  { nicho:"Financeiro", tipo:"video", titulo:"Financeiro 13", url:"videos/financeiro/financeiro13.mp4" },
  { nicho:"Financeiro", tipo:"video", titulo:"Financeiro 14", url:"videos/financeiro/Financeiro14.mp4" },
  { nicho:"Financeiro", tipo:"video", titulo:"Financeiro 15", url:"videos/financeiro/financeiro15.mp4" },
  { nicho:"Financeiro", tipo:"video", titulo:"Financeiro 16", url:"videos/financeiro/financeiro16.mp4" },
  { nicho:"Financeiro", tipo:"video", titulo:"Financeiro 2", url:"videos/financeiro/financeiro2.mp4" },
  { nicho:"Financeiro", tipo:"video", titulo:"Financeiro 3", url:"videos/financeiro/financeiro3.mp4" },
  { nicho:"Financeiro", tipo:"video", titulo:"Financeiro 4", url:"videos/financeiro/financeiro4.mp4" },
  { nicho:"Financeiro", tipo:"video", titulo:"Financeiro 5", url:"videos/financeiro/financeiro5.mp4" },
  { nicho:"Financeiro", tipo:"video", titulo:"Financeiro 6", url:"videos/financeiro/financeiro6.mp4" },
  { nicho:"Financeiro", tipo:"video", titulo:"Financeiro 8", url:"videos/financeiro/financeiro8.mp4" },
  { nicho:"Financeiro", tipo:"video", titulo:"Financeiro 9", url:"videos/financeiro/financeiro9.mp4" },

  // ── HOTELARIA ──────────────────────────────────
  { nicho:"Hotelaria", tipo:"video", titulo:"Hotelaria 1", url:"videos/hotelaria/hotelaria1.mp4" },
  { nicho:"Hotelaria", tipo:"video", titulo:"Hotelaria 10", url:"videos/hotelaria/hotelaria10.mp4" },
  { nicho:"Hotelaria", tipo:"video", titulo:"Hotelaria 11", url:"videos/hotelaria/hotelaria11.mp4" },
  { nicho:"Hotelaria", tipo:"video", titulo:"Hotelaria 12", url:"videos/hotelaria/hotelaria12.mp4" },
  { nicho:"Hotelaria", tipo:"video", titulo:"Hotelaria 13", url:"videos/hotelaria/hotelaria13.mp4" },
  { nicho:"Hotelaria", tipo:"video", titulo:"Hotelaria 14", url:"videos/hotelaria/hotelaria14.mp4" },
  { nicho:"Hotelaria", tipo:"video", titulo:"Hotelaria 15", url:"videos/hotelaria/hotelaria15.mov" },
  { nicho:"Hotelaria", tipo:"video", titulo:"Hotelaria 16", url:"videos/hotelaria/Hotelaria16.mp4" },
  { nicho:"Hotelaria", tipo:"video", titulo:"Hotelaria 17", url:"videos/hotelaria/hotelaria17.mp4" },
  { nicho:"Hotelaria", tipo:"video", titulo:"Hotelaria 18", url:"videos/hotelaria/hotelaria18.mp4" },
  { nicho:"Hotelaria", tipo:"video", titulo:"Hotelaria 19", url:"videos/hotelaria/Hotelaria19.mp4" },
  { nicho:"Hotelaria", tipo:"video", titulo:"Hotelaria 2", url:"videos/hotelaria/hotelaria2.mp4" },
  { nicho:"Hotelaria", tipo:"video", titulo:"Hotelaria 20", url:"videos/hotelaria/Hotelaria20.mp4" },
  { nicho:"Hotelaria", tipo:"video", titulo:"Hotelaria 3", url:"videos/hotelaria/hotelaria3.mp4" },
  { nicho:"Hotelaria", tipo:"video", titulo:"Hotelaria 4", url:"videos/hotelaria/hotelaria4.mp4" },
  { nicho:"Hotelaria", tipo:"video", titulo:"Hotelaria 5", url:"videos/hotelaria/hotelaria5.mp4" },
  { nicho:"Hotelaria", tipo:"video", titulo:"Hotelaria 7", url:"videos/hotelaria/hotelaria7.mp4" },
  { nicho:"Hotelaria", tipo:"video", titulo:"Hotelaria 8", url:"videos/hotelaria/hotelaria8.mp4" },
  { nicho:"Hotelaria", tipo:"video", titulo:"Hotelaria 9", url:"videos/hotelaria/hotelaria9.mp4" },

  // ── ÓTICA ──────────────────────────────────
  { nicho:"Ótica", tipo:"video", titulo:"Ótica 1", url:"videos/otica/otica1.mp4" },
  { nicho:"Ótica", tipo:"video", titulo:"Ótica 10", url:"videos/otica/otica10.mp4" },
  { nicho:"Ótica", tipo:"video", titulo:"Ótica 11", url:"videos/otica/otica11.mp4" },
  { nicho:"Ótica", tipo:"video", titulo:"Ótica 12", url:"videos/otica/otica12.mp4" },
  { nicho:"Ótica", tipo:"video", titulo:"Ótica 13", url:"videos/otica/otica13.mp4" },
  { nicho:"Ótica", tipo:"video", titulo:"Ótica 14", url:"videos/otica/otica14.mp4" },
  { nicho:"Ótica", tipo:"video", titulo:"Ótica 2", url:"videos/otica/otica2.mp4" },
  { nicho:"Ótica", tipo:"video", titulo:"Ótica 3", url:"videos/otica/otica3.mp4" },
  { nicho:"Ótica", tipo:"video", titulo:"Ótica 4", url:"videos/otica/otica4.mp4" },
  { nicho:"Ótica", tipo:"video", titulo:"Ótica 5", url:"videos/otica/otica5.mp4" },
  { nicho:"Ótica", tipo:"video", titulo:"Ótica 6", url:"videos/otica/otica6.mp4" },
  { nicho:"Ótica", tipo:"video", titulo:"Ótica 7", url:"videos/otica/otica7.mp4" },
  { nicho:"Ótica", tipo:"video", titulo:"Ótica 8", url:"videos/otica/otica8.mp4" },

  // ── PROVEDOR DE INTERNET ──────────────────────────────────
  { nicho:"Provedor de Internet", tipo:"video", titulo:"Provedor 1", url:"videos/provedor/provedor1.mp4" },
  { nicho:"Provedor de Internet", tipo:"video", titulo:"Provedor 10", url:"videos/provedor/provedor10.mp4" },
  { nicho:"Provedor de Internet", tipo:"video", titulo:"Provedor 11", url:"videos/provedor/provedor11.mp4" },
  { nicho:"Provedor de Internet", tipo:"video", titulo:"Provedor 12", url:"videos/provedor/provedor12.mp4" },
  { nicho:"Provedor de Internet", tipo:"video", titulo:"Provedor 13", url:"videos/provedor/provedor13.mp4" },
  { nicho:"Provedor de Internet", tipo:"video", titulo:"Provedor 14", url:"videos/provedor/provedor14.mp4" },
  { nicho:"Provedor de Internet", tipo:"video", titulo:"Provedor 15", url:"videos/provedor/provedor15.mp4" },
  { nicho:"Provedor de Internet", tipo:"video", titulo:"Provedor 16", url:"videos/provedor/provedor16.mp4" },
  { nicho:"Provedor de Internet", tipo:"video", titulo:"Provedor 17", url:"videos/provedor/provedor17.mp4" },
  { nicho:"Provedor de Internet", tipo:"video", titulo:"Provedor 18", url:"videos/provedor/provedor18.mp4" },
  { nicho:"Provedor de Internet", tipo:"video", titulo:"Provedor 19", url:"videos/provedor/provedor19.mp4" },
  { nicho:"Provedor de Internet", tipo:"video", titulo:"Provedor 2", url:"videos/provedor/provedor2.mp4" },
  { nicho:"Provedor de Internet", tipo:"video", titulo:"Provedor 20", url:"videos/provedor/provedor20.mp4" },
  { nicho:"Provedor de Internet", tipo:"video", titulo:"Provedor 3", url:"videos/provedor/provedor3.mp4" },
  { nicho:"Provedor de Internet", tipo:"video", titulo:"Provedor 4", url:"videos/provedor/provedor4.mp4" },
  { nicho:"Provedor de Internet", tipo:"video", titulo:"Provedor 5", url:"videos/provedor/provedor5.mp4" },
  { nicho:"Provedor de Internet", tipo:"video", titulo:"Provedor 6", url:"videos/provedor/provedor6.mp4" },
  { nicho:"Provedor de Internet", tipo:"video", titulo:"Provedor 7", url:"videos/provedor/provedor7.mp4" },
  { nicho:"Provedor de Internet", tipo:"video", titulo:"Provedor 8", url:"videos/provedor/provedor8.mp4" },

  // ── VAREJO — CELULARES ──────────────────────────────────
  { nicho:"Varejo", subcategoria:"Celulares", tipo:"video", titulo:"Celulares 10", url:"videos/varejo/celulares/celulares10.mp4" },
  { nicho:"Varejo", subcategoria:"Celulares", tipo:"video", titulo:"Celulares 11", url:"videos/varejo/celulares/celulares11.mp4" },
  { nicho:"Varejo", subcategoria:"Celulares", tipo:"video", titulo:"Celulares 12", url:"videos/varejo/celulares/celulares12.mp4" },
  { nicho:"Varejo", subcategoria:"Celulares", tipo:"video", titulo:"Celulares 13", url:"videos/varejo/celulares/celulares13.mp4" },
  { nicho:"Varejo", subcategoria:"Celulares", tipo:"video", titulo:"Celulares 14", url:"videos/varejo/celulares/celulares14.mp4" },
  { nicho:"Varejo", subcategoria:"Celulares", tipo:"video", titulo:"Celulares 15", url:"videos/varejo/celulares/celulares15.mp4" },
  { nicho:"Varejo", subcategoria:"Celulares", tipo:"video", titulo:"Celulares 16", url:"videos/varejo/celulares/celulares16.mp4" },
  { nicho:"Varejo", subcategoria:"Celulares", tipo:"video", titulo:"Celulares 17", url:"videos/varejo/celulares/celulares17.mp4" },
  { nicho:"Varejo", subcategoria:"Celulares", tipo:"video", titulo:"Celulares 18", url:"videos/varejo/celulares/celulares18.mp4" },
  { nicho:"Varejo", subcategoria:"Celulares", tipo:"video", titulo:"Celulares 19", url:"videos/varejo/celulares/celulares19.mp4" },
  { nicho:"Varejo", subcategoria:"Celulares", tipo:"video", titulo:"Celulares 2", url:"videos/varejo/celulares/celulares2.mp4" },
  { nicho:"Varejo", subcategoria:"Celulares", tipo:"video", titulo:"Celulares 20", url:"videos/varejo/celulares/celulares20.mp4" },
  { nicho:"Varejo", subcategoria:"Celulares", tipo:"video", titulo:"Celulares 21", url:"videos/varejo/celulares/celulares21.mp4" },
  { nicho:"Varejo", subcategoria:"Celulares", tipo:"video", titulo:"Celulares 22", url:"videos/varejo/celulares/celulares22.mp4" },
  { nicho:"Varejo", subcategoria:"Celulares", tipo:"video", titulo:"Celulares 23", url:"videos/varejo/celulares/celulares23.mp4" },
  { nicho:"Varejo", subcategoria:"Celulares", tipo:"video", titulo:"Celulares 24", url:"videos/varejo/celulares/Celulares24.mp4" },
  { nicho:"Varejo", subcategoria:"Celulares", tipo:"video", titulo:"Celulares 25", url:"videos/varejo/celulares/celulares25.mov" },
  { nicho:"Varejo", subcategoria:"Celulares", tipo:"video", titulo:"Celulares 26", url:"videos/varejo/celulares/Celulares26.mp4" },
  { nicho:"Varejo", subcategoria:"Celulares", tipo:"video", titulo:"Celulares 28", url:"videos/varejo/celulares/Celulares28.mp4" },
  { nicho:"Varejo", subcategoria:"Celulares", tipo:"video", titulo:"Celulares 29", url:"videos/varejo/celulares/celulares29.mp4" },
  { nicho:"Varejo", subcategoria:"Celulares", tipo:"video", titulo:"Celulares 4", url:"videos/varejo/celulares/celulares4.mp4" },
  { nicho:"Varejo", subcategoria:"Celulares", tipo:"video", titulo:"Celulares 6", url:"videos/varejo/celulares/celulares6.mp4" },
  { nicho:"Varejo", subcategoria:"Celulares", tipo:"video", titulo:"Celulares 7", url:"videos/varejo/celulares/celulares7.mp4" },
  { nicho:"Varejo", subcategoria:"Celulares", tipo:"video", titulo:"Celulares 9", url:"videos/varejo/celulares/celulares9.mp4" },

  // ── VAREJO — INFORMÁTICA ──────────────────────────────────
  { nicho:"Varejo", subcategoria:"Informática", tipo:"video", titulo:"Informática 10", url:"videos/varejo/informatica/informatica10.mp4" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"video", titulo:"Informática 11", url:"videos/varejo/informatica/informatica11.mp4" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"video", titulo:"Informática 12", url:"videos/varejo/informatica/informatica12.mp4" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"video", titulo:"Informática 13", url:"videos/varejo/informatica/informatica13.mp4" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"video", titulo:"Informática 14", url:"videos/varejo/informatica/informatica14.mp4" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"video", titulo:"Informática 15", url:"videos/varejo/informatica/informatica15.mp4" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"video", titulo:"Informática 16", url:"videos/varejo/informatica/informatica16.mp4" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"video", titulo:"Informática 17", url:"videos/varejo/informatica/Informatica17.mp4" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"video", titulo:"Informática 18", url:"videos/varejo/informatica/informatica18.mp4" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"video", titulo:"Informática 19", url:"videos/varejo/informatica/Informatica19.mp4" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"video", titulo:"Informática 20", url:"videos/varejo/informatica/informatica20.mov" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"video", titulo:"Informática 21", url:"videos/varejo/informatica/Informatica21.mp4" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"video", titulo:"Informática 22", url:"videos/varejo/informatica/Informatica22.mp4" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"video", titulo:"Informática 3", url:"videos/varejo/informatica/informatica3.mp4" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"video", titulo:"Informática 4", url:"videos/varejo/informatica/informatica4.mp4" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"video", titulo:"Informática 5", url:"videos/varejo/informatica/informatica5.mp4" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"video", titulo:"Informática 7", url:"videos/varejo/informatica/informatica7.mp4" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"video", titulo:"Informática 8", url:"videos/varejo/informatica/informatica8.mp4" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"video", titulo:"Informática 9", url:"videos/varejo/informatica/informatica9.mp4" },

  // ── CARDS (TODOS) ────────────────────────────────

  { nicho:"Advocacia", tipo:"post", titulo:"Card Advocacia", img:"imagens/advocacia/card1.jpg", emoji:"⚖️" },
  { nicho:"Advocacia", tipo:"post", titulo:"Card Advocacia", img:"imagens/advocacia/card2.jpg", emoji:"⚖️" },
  { nicho:"Advocacia", tipo:"post", titulo:"Card Advocacia", img:"imagens/advocacia/card3.jpg", emoji:"⚖️" },
  { nicho:"Advocacia", tipo:"post", titulo:"Card Advocacia", img:"imagens/advocacia/card4.jpeg", emoji:"⚖️" },
  { nicho:"Açougue", tipo:"post", titulo:"Card Açougue", img:"imagens/açougue/card1.jpg", emoji:"🥩" },
  { nicho:"Açougue", tipo:"post", titulo:"Card Açougue", img:"imagens/açougue/card2.jpg", emoji:"🥩" },
  { nicho:"Açougue", tipo:"post", titulo:"Card Açougue", img:"imagens/açougue/card3.jpg", emoji:"🥩" },
  { nicho:"Açougue", tipo:"post", titulo:"Card Açougue", img:"imagens/açougue/card4.jpg", emoji:"🥩" },
  { nicho:"Açougue", tipo:"post", titulo:"Card Açougue", img:"imagens/açougue/card5.jpg", emoji:"🥩" },
  { nicho:"Açougue", tipo:"post", titulo:"Card Açougue", img:"imagens/açougue/card6.jpg", emoji:"🥩" },
  { nicho:"Açougue", tipo:"post", titulo:"Card Açougue", img:"imagens/açougue/card7.jpeg", emoji:"🥩" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card1.jpg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card2.jpg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card3.jpg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card4.jpg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card5.jpg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card6.jpg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card7.jpg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card8.jpg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card9.jpg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card10.jpg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card11.jpg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card12.jpg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card13.jpg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card14.jpg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card15.jpg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card16.jpg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card17.jpg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card18.jpg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card19.jpg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card20.jpg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card22.jpeg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card23.jpeg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card24.jpeg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card25.jpeg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card26.jpeg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card27.jpeg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card28.jpeg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card29.jpeg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card30.jpeg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card31.jpeg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card32.jpeg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card33.jpeg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card34.jpeg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card35.jpeg", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card36.png", emoji:"🏨" },
  { nicho:"Hotelaria", tipo:"post", titulo:"Card Hotelaria", img:"imagens/hotelaria/card37.png", emoji:"🏨" },
  { nicho:"Ótica", tipo:"post", titulo:"Card Ótica", img:"imagens/otica/card2.jpg", emoji:"👓" },
  { nicho:"Ótica", tipo:"post", titulo:"Card Ótica", img:"imagens/otica/card3.jpg", emoji:"👓" },
  { nicho:"Ótica", tipo:"post", titulo:"Card Ótica", img:"imagens/otica/card4.jpg", emoji:"👓" },
  { nicho:"Ótica", tipo:"post", titulo:"Card Ótica", img:"imagens/otica/card5.jpg", emoji:"👓" },
  { nicho:"Ótica", tipo:"post", titulo:"Card Ótica", img:"imagens/otica/card6.jpg", emoji:"👓" },
  { nicho:"Ótica", tipo:"post", titulo:"Card Ótica", img:"imagens/otica/card7.jpg", emoji:"👓" },
  { nicho:"Ótica", tipo:"post", titulo:"Card Ótica", img:"imagens/otica/card8.jpg", emoji:"👓" },
  { nicho:"Ótica", tipo:"post", titulo:"Card Ótica", img:"imagens/otica/card9.jpg", emoji:"👓" },
  { nicho:"Ótica", tipo:"post", titulo:"Card Ótica", img:"imagens/otica/card10.jpg", emoji:"👓" },
  { nicho:"Ótica", tipo:"post", titulo:"Card Ótica", img:"imagens/otica/card11.jpg", emoji:"👓" },
  { nicho:"Ótica", tipo:"post", titulo:"Card Ótica", img:"imagens/otica/card12.jpeg", emoji:"👓" },
  { nicho:"Ótica", tipo:"post", titulo:"Card Ótica", img:"imagens/otica/card13.jpeg", emoji:"👓" },
  { nicho:"Provedor de Internet", tipo:"post", titulo:"Card Provedor de Internet", img:"imagens/provedor/card2.jpg", emoji:"📡" },
  { nicho:"Provedor de Internet", tipo:"post", titulo:"Card Provedor de Internet", img:"imagens/provedor/card3.jpg", emoji:"📡" },
  { nicho:"Provedor de Internet", tipo:"post", titulo:"Card Provedor de Internet", img:"imagens/provedor/card4.jpg", emoji:"📡" },
  { nicho:"Provedor de Internet", tipo:"post", titulo:"Card Provedor de Internet", img:"imagens/provedor/card5.jpg", emoji:"📡" },
  { nicho:"Provedor de Internet", tipo:"post", titulo:"Card Provedor de Internet", img:"imagens/provedor/card6.jpg", emoji:"📡" },
  { nicho:"Provedor de Internet", tipo:"post", titulo:"Card Provedor de Internet", img:"imagens/provedor/card7.jpg", emoji:"📡" },
  { nicho:"Provedor de Internet", tipo:"post", titulo:"Card Provedor de Internet", img:"imagens/provedor/card9.jpg", emoji:"📡" },
  { nicho:"Provedor de Internet", tipo:"post", titulo:"Card Provedor de Internet", img:"imagens/provedor/card10.jpg", emoji:"📡" },
  { nicho:"Provedor de Internet", tipo:"post", titulo:"Card Provedor de Internet", img:"imagens/provedor/card12.jpg", emoji:"📡" },
  { nicho:"Provedor de Internet", tipo:"post", titulo:"Card Provedor de Internet", img:"imagens/provedor/card13.jpg", emoji:"📡" },
  { nicho:"Provedor de Internet", tipo:"post", titulo:"Card Provedor de Internet", img:"imagens/provedor/card14.jpg", emoji:"📡" },
  { nicho:"Provedor de Internet", tipo:"post", titulo:"Card Provedor de Internet", img:"imagens/provedor/card16.jpeg", emoji:"📡" },
  { nicho:"Provedor de Internet", tipo:"post", titulo:"Card Provedor de Internet", img:"imagens/provedor/card17.png", emoji:"📡" },
  { nicho:"Provedor de Internet", tipo:"post", titulo:"Card Provedor de Internet", img:"imagens/provedor/card18.png", emoji:"📡" },
  { nicho:"Provedor de Internet", tipo:"post", titulo:"Card Provedor de Internet", img:"imagens/provedor/card19.png", emoji:"📡" },
  { nicho:"Provedor de Internet", tipo:"post", titulo:"Card Provedor de Internet", img:"imagens/provedor/card20.png", emoji:"📡" },
  { nicho:"Provedor de Internet", tipo:"post", titulo:"Card Provedor de Internet", img:"imagens/provedor/card21.mp4", emoji:"📡" },
  { nicho:"Financeiro", tipo:"post", titulo:"Card Financeiro", img:"imagens/financeiro/card1.jpg", emoji:"💰" },
  { nicho:"Financeiro", tipo:"post", titulo:"Card Financeiro", img:"imagens/financeiro/card2.jpg", emoji:"💰" },
  { nicho:"Financeiro", tipo:"post", titulo:"Card Financeiro", img:"imagens/financeiro/card3.jpg", emoji:"💰" },
  { nicho:"Financeiro", tipo:"post", titulo:"Card Financeiro", img:"imagens/financeiro/card4.jpg", emoji:"💰" },
  { nicho:"Financeiro", tipo:"post", titulo:"Card Financeiro", img:"imagens/financeiro/card5.jpeg", emoji:"💰" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card2.jpg", emoji:"💻" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card3.jpg", emoji:"💻" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card4.jpg", emoji:"💻" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card5.jpg", emoji:"💻" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card7.jpg", emoji:"💻" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card8.jpg", emoji:"💻" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card9.jpg", emoji:"💻" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card10.jpg", emoji:"💻" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card11.jpg", emoji:"💻" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card12.jpg", emoji:"💻" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card13.jpg", emoji:"💻" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card14.jpg", emoji:"💻" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card15.jpg", emoji:"💻" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card16.jpg", emoji:"💻" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card17.jpg", emoji:"💻" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card18.jpg", emoji:"💻" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card19.jpg", emoji:"💻" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card20.jpg", emoji:"💻" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card21.jpg", emoji:"💻" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card22.jpeg", emoji:"💻" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card23.jpeg", emoji:"💻" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card24.png", emoji:"💻" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card25.png", emoji:"💻" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card26.png", emoji:"💻" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card27.png", emoji:"💻" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card28.png", emoji:"💻" },
  { nicho:"Varejo", subcategoria:"Informática", tipo:"post", titulo:"Card Informática", img:"imagens/varejo/informatica/card29.png", emoji:"💻" },

  // ── CARROSSÉIS ──────────────────────────────────
  { nicho:"Advocacia", tipo:"carrossel", titulo:"Carrossel 1", cor:"#f97316", imgs:["imagens/carrosseis/carrossel1/1.jpg","imagens/carrosseis/carrossel1/2.jpg","imagens/carrosseis/carrossel1/3.jpg","imagens/carrosseis/carrossel1/4.jpg","imagens/carrosseis/carrossel1/5.jpg","imagens/carrosseis/carrossel1/6.jpg"] },
  { nicho:"Hotelaria", tipo:"carrossel", titulo:"Carrossel 2", cor:"#14b8a6", imgs:["imagens/carrosseis/carrossel2/1.jpg","imagens/carrosseis/carrossel2/2.jpg","imagens/carrosseis/carrossel2/3.jpg","imagens/carrosseis/carrossel2/4.jpg","imagens/carrosseis/carrossel2/5.jpg","imagens/carrosseis/carrossel2/6.jpg","imagens/carrosseis/carrossel2/7.jpg","imagens/carrosseis/carrossel2/8.jpg"] },
  { nicho:"Ótica", tipo:"carrossel", titulo:"Carrossel 3", cor:"#4f46e5", imgs:["imagens/carrosseis/carrossel3/1.jpg","imagens/carrosseis/carrossel3/2.jpg","imagens/carrosseis/carrossel3/3.jpg","imagens/carrosseis/carrossel3/4.jpg"] },
  { nicho:"Provedor de Internet", tipo:"carrossel", titulo:"Carrossel 4", cor:"#f59e0b", imgs:["imagens/carrosseis/carrossel4/1.jpg","imagens/carrosseis/carrossel4/2.jpg","imagens/carrosseis/carrossel4/3.jpg","imagens/carrosseis/carrossel4/4.jpg"] },
  { nicho:"Varejo", tipo:"carrossel", titulo:"Carrossel 5", cor:"#f59e0b", imgs:["imagens/carrosseis/carrossel5/1.mp4","imagens/carrosseis/carrossel5/2.png","imagens/carrosseis/carrossel5/3.png","imagens/carrosseis/carrossel5/4.png"] },
  { nicho:"Açougue", tipo:"carrossel", titulo:"Carrossel 6", cor:"#ef4444", imgs:["imagens/carrosseis/carrossel6/1.png","imagens/carrosseis/carrossel6/2.png","imagens/carrosseis/carrossel6/3.png"] },
  { nicho:"Construção", tipo:"carrossel", titulo:"Carrossel 7", imgs:["imagens/carrosseis/carrossel7/1.jpeg","imagens/carrosseis/carrossel7/2.jpeg","imagens/carrosseis/carrossel7/3.jpeg","imagens/carrosseis/carrossel7/4.jpeg"] },
  { nicho:"Financeiro", tipo:"carrossel", titulo:"Carrossel 8", imgs:["imagens/carrosseis/carrossel8/1.jpg","imagens/carrosseis/carrossel8/2.jpg","imagens/carrosseis/carrossel8/3.jpg","imagens/carrosseis/carrossel8/4.jpg"] },
  { nicho:"Hotelaria", tipo:"carrossel", titulo:"Carrossel 9", imgs:["imagens/carrosseis/carrossel9/1.jpg","imagens/carrosseis/carrossel9/2.jpg","imagens/carrosseis/carrossel9/3.jpg","imagens/carrosseis/carrossel9/4.jpg","imagens/carrosseis/carrossel9/5.jpg","imagens/carrosseis/carrossel9/6.jpg"] },
  { nicho:"Ótica", tipo:"carrossel", titulo:"Carrossel 10", imgs:["imagens/carrosseis/carrossel10/1.jpg","imagens/carrosseis/carrossel10/2.jpg","imagens/carrosseis/carrossel10/3.jpg","imagens/carrosseis/carrossel10/4.jpg"] },
  { nicho:"Provedor de Internet", tipo:"carrossel", titulo:"Carrossel 11", imgs:["imagens/carrosseis/carrossel11/1.mp4","imagens/carrosseis/carrossel11/2.jpeg","imagens/carrosseis/carrossel11/3.jpeg","imagens/carrosseis/carrossel11/4.jpeg"] },
];

PROJETOS.forEach(normalizeProjetoMedia);

/* ══════════════════════════════ RENDER ══════════════════════════════ */
let filtroAtivo = "Todos";

// filters removed — using sections instead

function getYTThumb(url) {
  const match = url.match(/embed\/([^?]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

function buildGrid() {
  // Show only FIRST reel per nicho in reels grid
  // Show only FIRST post per nicho in cards grid
  const seenReels = {};
  const seenCards = {};
  const reelItems = [];
  const cardItems = [];

  PROJETOS.forEach(p => {
    if (p.nicho === "Nichos Diversos") return; // handle separately
    // For Varejo, show one reel per subcategoria
    const reelKey = p.subcategoria ? `${p.nicho}-${p.subcategoria}` : p.nicho;
    const cardKey = p.subcategoria ? `${p.nicho}-${p.subcategoria}` : p.nicho;
    if (p.tipo === "video" && !seenReels[reelKey]) {
      seenReels[reelKey] = true;
      reelItems.push(p);
    } else if (p.tipo !== "video" && p.tipo !== "carrossel" && !seenCards[cardKey]) {
      seenCards[cardKey] = true;
      cardItems.push(p);
    }
  });
  // Add Nichos Diversos last with special flag
  const diversosReel = PROJETOS.find(p => p.nicho === "Nichos Diversos" && p.tipo === "video");
  const diversosCard = PROJETOS.find(p => p.nicho === "Nichos Diversos" && p.tipo !== "video");
  if (diversosReel) reelItems.push({...diversosReel, destaque: true});
  if (diversosCard) cardItems.push({...diversosCard, destaque: true});

  const gridReels = document.getElementById("grid-reels");
  const gridCards = document.getElementById("grid-cards");

  // Show ALL carrosséis — mixed, no nicho filter
  const carrosselItems = PROJETOS.filter(p => p.tipo === "carrossel");

  gridReels.innerHTML = reelItems.map((p, i) => buildCard(p, i)).join("");
  gridCards.innerHTML = cardItems.map((p, i) => buildCard(p, i)).join("");

  const gridCarrosseis = document.getElementById("grid-carrosseis");
  if (gridCarrosseis) {
    gridCarrosseis.innerHTML = carrosselItems.map((p, i) => buildCarrossel(p, i)).join("");
    initCarrosseis();
  }
}

function buildCard(p, i) {
    const destaqueClass = p.destaque ? " p-card-destaque" : "";
    const delay = `animation-delay:${(i % 6) * 0.07}s`;

    let media = "";
    if (p.tipo === "video") {
      const ext = p.url.split('.').pop().toLowerCase();
      const videoType = ext === 'mov' ? 'video/quicktime' : 'video/mp4';
      // poster: usa imagem de thumbnail se disponível, senão usa o próprio vídeo como fallback
      const posterAttr = p.thumb ? `poster="${p.thumb}"` : '';
      media = `
        <div class="card-video">
          <video class="video-thumb" preload="metadata" autoplay muted loop playsinline webkit-playsinline
            x-webkit-airplay="deny" disablepictureinpicture controlslist="nofullscreen noremoteplayback nodownload" ${posterAttr}
            style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;"
            src="${p.url}">
          </video>
          <div class="play-overlay" data-url="${p.url}" onclick="openReelLightbox(this.dataset.url)">
            <div class="play-icon">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <span>▶&nbsp; Assistir Reel</span>
          </div>
        </div>`;
    } else {
      if (p.img && p.img.match(/\.(mp4|mov)$/i)) {
        media = `<div class="card-image-wrap"><video src="${p.img}" autoplay muted loop playsinline style="width:100%;aspect-ratio:3/4;object-fit:cover;display:block;"></video></div>`;
      } else if (p.img) {
        media = `<div class="card-image-wrap" onclick="openImgFS('${p.img}')" style="cursor:zoom-in;"><img src="${p.img}" alt="${p.titulo}" loading="lazy" style="pointer-events:none;"/></div>`;
      } else {
        media = `<div class="img-placeholder"><span class="ph-emoji">${p.emoji || ''}</span></div>`;
      }
    }

    // badge overlay no canto superior esquerdo da mídia
    const nichoLabel = p.nicho;
    const badgeHtml = p.tipo === 'carrossel' ? '' : `
      <div class="media-badges">
        <span class="card-tag">${nichoLabel}</span>
        <span class="type-badge ${p.tipo === 'video' ? 'type-reel' : 'type-card'}">${p.tipo === 'video' ? '▶ Reel' : '◼ Card'}</span>
      </div>`;

    // injeta badge dentro do elemento de mídia
    const mediaWithBadge = media.replace(/(<div class="card-video"|<div class="card-image-wrap"|<div class="img-placeholder")/, `<div class="media-wrap">$1`).replace(/(<\/div>)\s*$/, '$1</div>') ;
    
    return `
      <div class="p-card${destaqueClass}" style="${delay}" data-nicho="${p.nicho}">
        <div class="media-wrap" style="position:relative;">
          ${media}
          ${badgeHtml}
        </div>
        <div class="card-body">
          <button class="ver-mais-btn" data-nicho="${p.nicho}" data-tipo="${p.tipo}" data-sub="${p.destaque ? '' : (p.subcategoria || '')}" onclick="openModal(this.dataset.nicho, this.dataset.tipo, this.dataset.sub)">
            ${p.destaque ? '✦ Ver mais nichos' : (p.tipo === 'video' ? 'Ver todos os Reels' : 'Ver todos os Cards')}
            <svg viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>`;
}

function filterGrid() {
  // no-op — filtering handled by sections now
}

function playLocalVideo(videoEl) {
  const wrap = videoEl.parentElement;
  const overlay = wrap.querySelector('.play-overlay');
  if (overlay) overlay.style.display = 'none';
  videoEl.muted = false;
  videoEl.controls = true;
  videoEl.loop = true;
  videoEl.currentTime = 0;
  videoEl.style.pointerEvents = 'auto';
  videoEl.load();
  videoEl.play().catch(e => {
    console.warn('Video play failed:', e);
    if (overlay) overlay.style.display = 'flex';
  });
}


/* ── UI HELPERS ── */
let savedScrollY = 0;
function lockScroll() {
  savedScrollY = window.scrollY || window.pageYOffset || 0;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
}
function unlockScroll() {
  const top = document.body.style.top;
  const restoreY = top ? Math.abs(parseInt(top, 10)) : savedScrollY;

  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';

  requestAnimationFrame(() => {
    window.scrollTo(0, restoreY || 0);
  });
}
function closeModal(e) {
  if (e && e.target && e.target.id !== 'nicho-modal') return;
  const overlay = document.getElementById('nicho-modal');
  if (overlay) overlay.classList.remove('open');
  unlockScroll();
}


/* ── CARROSSÉIS ── */
function buildCarrossel(p, i) {
  const delay = `animation-delay:${(i % 6) * 0.07}s`;
  const imgs = p.imgs || [];
  const slides = imgs.map((src, idx) => {
    const isVideo = /\.(mp4|mov)$/i.test(src);
    return `
      <div class="cs-slide ${idx === 0 ? 'active' : ''}" data-index="${idx}">
        ${isVideo
          ? `<video src="${src}" autoplay muted loop playsinline preload="metadata" style="width:100%;height:100%;object-fit:cover;display:block;"></video>`
          : `<img src="${src}" alt="${p.titulo || 'Carrossel'} — slide ${idx + 1}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;"/>`
        }
      </div>`;
  }).join('');

  const dots = imgs.map((_, idx) => `<span class="cs-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}"></span>`).join('');

  return `
    <article class="p-card cs-card reveal" style="${delay}; --badge-color:${p.cor || '#f59e0b'}" data-nicho="${p.nicho}" data-total="${imgs.length}" data-current="0">
      <div class="media-wrap" style="position:relative;">
        <div class="media-badges">
          <span class="type-badge type-carrossel">Carrossel</span>
        </div>
        <div class="cs-wrap" onclick='openCarrosselGrid(${JSON.stringify(imgs)}, ${JSON.stringify(p.titulo || "Carrossel")})'>
          <div class="cs-track">
            ${slides}
          </div>
          ${imgs.length > 1 ? `
            <button class="cs-btn cs-prev" type="button" aria-label="Slide anterior" onclick="event.stopPropagation(); csNav(this.closest('.cs-card'), -1)">
              <svg viewBox="0 0 16 16" fill="none"><path d="M9.5 3.5 5 8l4.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="cs-btn cs-next" type="button" aria-label="Próximo slide" onclick="event.stopPropagation(); csNav(this.closest('.cs-card'), 1)">
              <svg viewBox="0 0 16 16" fill="none"><path d="M6.5 3.5 11 8l-4.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div class="cs-dots" aria-hidden="true">${dots}</div>
            <div class="cs-counter"><span class="cs-cur">1</span>/<span class="cs-total">${imgs.length}</span></div>
          ` : ''}
        </div>
      </div>
      <div class="card-body">
        <button class="ver-mais-btn" onclick='openCarrosselGrid(${JSON.stringify(imgs)}, ${JSON.stringify(p.titulo || "Carrossel")})'>
          Ver carrossel completo
          <svg viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </article>`;
}

function setCarrosselSlide(card, nextIndex) {
  if (!card) return;
  const slides = Array.from(card.querySelectorAll('.cs-slide'));
  const dots = Array.from(card.querySelectorAll('.cs-dot'));
  if (!slides.length) return;

  const total = slides.length;
  const index = ((nextIndex % total) + total) % total;

  slides.forEach((slide, i) => {
    const isActive = i === index;
    slide.classList.toggle('active', isActive);

    const video = slide.querySelector('video');
    if (video) {
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      if (isActive) {
        try { video.currentTime = 0; } catch (e) {}
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {});
        }
      } else {
        video.pause();
      }
    }
  });

  dots.forEach((dot, i) => dot.classList.toggle('active', i === index));

  const cur = card.querySelector('.cs-cur');
  if (cur) cur.textContent = String(index + 1);
  card.dataset.current = String(index);
}

function csNav(card, direction) {
  if (!card) return;
  const current = Number(card.dataset.current || 0);
  setCarrosselSlide(card, current + direction);
}

function initCarrosseis() {
  document.querySelectorAll('.cs-card').forEach(card => {
    const slides = card.querySelectorAll('.cs-slide');

    slides.forEach(slide => {
      const video = slide.querySelector('video');
      if (video) {
        video.muted = true;
        video.loop = true;
        video.autoplay = true;
        video.playsInline = true;
        video.preload = 'metadata';
      }
    });

    card.querySelectorAll('.cs-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        setCarrosselSlide(card, Number(dot.dataset.index || 0));
      });
    });

    setCarrosselSlide(card, 0);
  });
}


function openCarrosselGrid(imgs, titulo) {
  const overlay = document.getElementById('cs-grid-lightbox');
  const content = document.getElementById('cs-grid-content');
  if (!overlay || !content) return;

  content.innerHTML = `
    <div class="cs-grid-title" style="grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem;">
      <strong style="font-family:'Space Grotesk',sans-serif;font-size:1.05rem;letter-spacing:-.02em;">${titulo || 'Carrossel'}</strong>
      <span style="color:var(--muted);font-size:.9rem;">${(imgs || []).length} slides</span>
    </div>
    ${(imgs || []).map((src, idx) => {
      const isVideo = /\.(mp4|mov)$/i.test(src);
      return `
        <button class="cs-grid-item" onclick='openLightbox(${JSON.stringify(imgs || [])}, ${idx})' style="background:none;border:0;padding:0;cursor:pointer;">
          ${isVideo
            ? `<video src="${src}" autoplay muted loop playsinline preload="metadata" style="width:100%;height:100%;object-fit:cover;display:block;"></video>`
            : `<img src="${src}" alt="${titulo || 'Carrossel'} — slide ${idx + 1}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;"/>`
          }
        </button>`;
    }).join('')}
  `;
  overlay.classList.add('open');
  lockScroll();
}

function closeCarrosselGrid(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();

  if (e && e.target && e.target.id !== 'cs-grid-lightbox' && !e.target.closest('.cs-grid-close')) return;

  const overlay = document.getElementById('cs-grid-lightbox');
  if (overlay) overlay.classList.remove('open');
  unlockScroll();
}


/* ── TYPED HERO ── */
const WORDS = [
  "reels que vendem",
  "cards que convertem",
  "conteúdo que impacta",
  "gestão que cresce",
  "estratégia que funciona",
];
let wi = 0, ci = 0, deleting = false;
const typed = document.querySelector(".hero-typed");
function typeLoop() {
  if (!typed) return;
  const word = WORDS[wi];
  if (!deleting) {
    typed.textContent = word.slice(0, ci + 1);
    ci++;
    if (ci === word.length) { deleting = true; setTimeout(typeLoop, 3200); return; }
    setTimeout(typeLoop, 150);
  } else {
    typed.textContent = word.slice(0, ci - 1);
    ci--;
    if (ci === 0) { deleting = false; wi = (wi + 1) % WORDS.length; setTimeout(typeLoop, 400); return; }
    setTimeout(typeLoop, 40);
  }
}
setTimeout(typeLoop, 1000);

/* ── COUNTER ANIMATION ── */
function animateCounter(el) {
  const target = +el.dataset.target;
  const duration = 2800;
  const startTime = performance.now();
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function update(now) {
    const t = Math.min((now - startTime) / duration, 1);
    el.textContent = Math.floor(easeOut(t) * target);
    if (t < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll(".stat-n").forEach(animateCounter);
      counterObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
const statsEl = document.querySelector(".hero-stats");
if (statsEl) counterObs.observe(statsEl);


function initReelPreviewAutoplay() {
  const videos = Array.from(document.querySelectorAll('.video-thumb'));
  if (!videos.length) return;

  const startVideo = (video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.preload = 'metadata';

    const p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {});
    }
  };

  const stopVideo = (video) => {
    try { video.pause(); } catch (e) {}
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting && entry.intersectionRatio > 0.35) {
          startVideo(video);
        } else {
          stopVideo(video);
        }
      });
    }, { threshold: [0, 0.35, 0.6] });

    videos.forEach((video) => {
      video.addEventListener('loadedmetadata', () => startVideo(video), { once: true });
      io.observe(video);
      startVideo(video);
    });
  } else {
    videos.forEach((video) => {
      video.addEventListener('loadedmetadata', () => startVideo(video), { once: true });
      startVideo(video);
    });
  }

  const wakeAll = () => {
    videos.forEach(startVideo);
  };

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) wakeAll();
  });

  
  
}


// Init
buildGrid();
initReelPreviewAutoplay();

['touchstart','click'].forEach(evt => {
  window.addEventListener(evt, () => initReelPreviewAutoplay(), { once: true, passive: true });
});

// Scroll reveal
const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
}, { threshold: 0.1 });
reveals.forEach(r => observer.observe(r));


/* ── MODAL ── */
function openModal(nicho, tipo, sub) {
  const overlay = document.getElementById('nicho-modal');

  // Title: if subcategoria exists, show it
  const titleEl = document.getElementById('modal-title');
  titleEl.textContent = (sub && sub !== '') ? sub : nicho;
  document.getElementById('modal-tag').textContent = tipo === 'video' ? 'Reels' : tipo === 'post' ? 'Cards' : 'Reels & Cards';

  // Filter by nicho + tipo + subcategoria (if provided)
  let projetos = PROJETOS.filter(p => p.nicho === nicho && (!tipo || p.tipo === tipo));
  if (sub && sub !== '') {
    projetos = projetos.filter(p => p.subcategoria === sub);
  }

  const grid = document.getElementById('modal-grid');
  const filterWrap = document.getElementById('modal-filter-wrap');

  // Clear filter wrap
  if (filterWrap) filterWrap.innerHTML = '';

  if (projetos.length === 0) {
    grid.innerHTML = `<div class="modal-empty"><strong>Em breve!</strong>Estamos preparando os cases deste nicho.</div>`;
  } else if (nicho === 'Nichos Diversos') {
    // Only Nichos Diversos gets filter tabs
    const subs = [...new Set(projetos.filter(p => p.subcategoria).map(p => p.subcategoria))];
    if (filterWrap && subs.length > 0) {
      const subsDiv = document.createElement('div');
      subsDiv.className = 'modal-subs';
      subsDiv.id = 'modal-subs';
      const todosBtn = document.createElement('button');
      todosBtn.className = 'modal-sub-btn active';
      todosBtn.textContent = 'Todos';
      todosBtn.onclick = function() { filterModalSub('todos', this); };
      subsDiv.appendChild(todosBtn);
      subs.forEach(s => {
        const btn = document.createElement('button');
        btn.className = 'modal-sub-btn';
        btn.textContent = s;
        btn.onclick = function() { filterModalSub(s.toLowerCase(), this); };
        subsDiv.appendChild(btn);
      });
      filterWrap.appendChild(subsDiv);
    }
    grid.innerHTML = projetos.map((p,i) => buildModalCard(p,i)).join('');
    setTimeout(initThumbs, 100);
  } else {
    grid.innerHTML = projetos.map((p, i) => buildModalCard(p, i)).join('');
    setTimeout(initThumbs, 100);
  }

  // Lock modal height in px to prevent Android Chrome bounce
  if (window.innerWidth <= 600) {
    const box = overlay.querySelector('.modal-box');
    if (box) box.style.height = Math.floor(window.innerHeight * 0.80) + 'px';
  }
  overlay.classList.add('open');
  lockScroll();
  setTimeout(() => initLazyVideos(document.getElementById('modal-grid')), 100);
}

function buildModalCard(p, i) {
  const label = p.subcategoria || p.nicho;
  let media = '';
  if (p.tipo === 'video') {
    media = `
      <div class="card-video" ondblclick="openReelLightbox('${p.url}')">
        <video class="video-thumb" preload="metadata" muted playsinline style="aspect-ratio:9/16"
          src="${p.url}"
          style="width:100%;height:100%;object-fit:cover;display:block;">
        </video>
        <div class="play-overlay" data-url="${p.url}" onclick="openReelLightbox(this.dataset.url)">
          <div class="play-icon"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
          <span>▶ Reel</span>
        </div>
        <div class="media-badges">
          <span class="card-tag">${label}</span>
          <span class="type-badge type-reel">▶ Reel</span>
        </div>
      </div>`;
  } else {
    if (p.img && p.img.match(/\.(mp4|mov)$/i)) {
      media = `<div class="card-image-wrap">
        <video src="${p.img}" autoplay muted loop playsinline style="width:100%;aspect-ratio:3/4;object-fit:cover;display:block;"></video>
      </div>`;
    } else if (p.img) {
      media = `<div class="card-image-wrap" onclick="openImgFS('${p.img}')" style="cursor:zoom-in;">
        <img src="${p.img}" alt="${p.titulo}" loading="lazy" style="pointer-events:none;"/>
      </div>`;
    } else {
      media = `<div class="img-placeholder"><span class="ph-emoji">${p.emoji || ''}</span></div>`;
    }

  }
  return `
    <div class="modal-card" data-sub="${(p.subcategoria || '').toLowerCase()}">
      ${media}
      <div class="card-body"></div>
    </div>`;
}

function filterModalSub(sub, btn) {
  document.querySelectorAll('.modal-sub-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const grid = document.getElementById('modal-grid');
  if (!grid) return;
  const subNorm = sub.trim().toLowerCase();
  grid.querySelectorAll('.modal-card').forEach(card => {
    const cardSub = (card.dataset.sub || '').trim().toLowerCase();
    const match = subNorm === 'todos' || cardSub === subNorm;
    card.style.display = match ? '' : 'none';
  });
  // Force-load all visible lazy videos immediately
  grid.querySelectorAll('.lazy-video[data-src]').forEach(video => {
    if (video.closest('.modal-card') && video.closest('.modal-card').style.display !== 'none') {
      if (!video.src || video.src === window.location.href) {
        const source = document.createElement('source');
        source.src = video.dataset.src;
        source.type = video.dataset.type || 'video/mp4';
        video.appendChild(source);
        video.load();
        video.removeAttribute('data-src');
      }
    }
  });
}

/* ── REEL LIGHTBOX ── */
function openReelLightbox(url) {
  const overlay = document.getElementById('reel-lightbox');
  const video = document.getElementById('reel-video');
  if (!overlay || !video) return;
  video.src = url;
  video.load();
  video.play().catch(() => {});
  overlay.classList.add('open');
  lockScroll();
}

function closeReelLightbox(e) {
  if (e && e.target.id !== 'reel-lightbox') return;
  const overlay = document.getElementById('reel-lightbox');
  const video = document.getElementById('reel-video');
  if (video) { video.pause(); video.src = ''; }
  if (overlay) overlay.classList.remove('open');
  unlockScroll();
}


function openImgFS(src) {
  if (!src) return;
  const fs = document.getElementById('img-fs');
  document.getElementById('img-fs-el').src = src;
  fs.style.display = 'flex';
  lockScroll();
}
/* ── IMAGE LIGHTBOX for cards ── */
function openImgLightbox(src) {
  if (!src) return;
  openLightbox([src], 0);
}

/* ── LIGHTBOX ── */
let lbImgs = [], lbIdx = 0;

function openLightbox(imgs, startIdx) {
  lbImgs = imgs;
  lbIdx = startIdx || 0;
  const overlay = document.getElementById('lightbox');
  const track = document.getElementById('lightbox-track');
  const dots = document.getElementById('lightbox-dots');
  const total = document.getElementById('lb-total');
  if (!overlay) return;

  track.innerHTML = imgs.map((src, i) => {
    const isVideo = src.match(/\.mp4$/i);
    const media = isVideo
      ? `<video src="${src}" autoplay muted loop playsinline style="width:100%;height:100%;object-fit:cover;border-radius:14px;"></video>`
      : `<img src="${src}" alt="Imagem do carrossel" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:14px;"/>`;
    return `<div class="${i === lbIdx ? 'active' : ''}" style="position:absolute;inset:0;opacity:${i === lbIdx ? 1 : 0};transition:opacity .3s;width:100%;height:100%;">${media}</div>`;
  }).join('');

  if (dots) dots.innerHTML = imgs.map((_, i) =>
    `<span class="${i === lbIdx ? 'active' : ''}" onclick="lbGoTo(${i})"></span>`
  ).join('');

  if (total) total.textContent = imgs.length;
  const curEl = document.getElementById('lb-cur');
  if (curEl) curEl.textContent = lbIdx + 1;

  overlay.classList.add('open');
  lockScroll();
}

function closeLightbox(e) {
  if (e && e.target.id !== 'lightbox') return;
  const overlay = document.getElementById('lightbox');
  if (overlay) overlay.classList.remove('open');
  unlockScroll();
}

function lbMove(dir) {
  lbGoTo((lbIdx + dir + lbImgs.length) % lbImgs.length);
}

function lbGoTo(idx) {
  lbIdx = idx;
  document.querySelectorAll('#lightbox-track > div').forEach((el, i) => {
    el.style.opacity = i === idx ? '1' : '0';
    const vid = el.querySelector('video');
    if (vid) { i === idx ? vid.play() : vid.pause(); }
  });
  document.querySelectorAll('#lightbox-dots span').forEach((d, i) => {
    d.classList.toggle('active', i === idx);
  });
  const curEl = document.getElementById('lb-cur');
  if (curEl) curEl.textContent = idx + 1;
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('lightbox')?.classList.remove('open');
    document.getElementById('reel-lightbox')?.classList.remove('open');
    document.getElementById('cs-grid-lightbox')?.classList.remove('open');
    const v = document.getElementById('reel-video');
    if (v) { v.pause(); v.src = ''; }
    unlockScroll();
  }
  if (!document.getElementById('lightbox')?.classList.contains('open')) return;
  if (e.key === 'ArrowRight') lbMove(1);
  if (e.key === 'ArrowLeft') lbMove(-1);
});

/* ── LAZY VIDEO LOADING ── */
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

function initLazyVideos(container) {
  const videos = (container || document).querySelectorAll('video.lazy-video');
  if (!videos.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const video = entry.target;
        if (video.dataset.src && !video.dataset.loaded) {
          video.dataset.loaded = '1';
          video.src = video.dataset.src;
          video.load();
          video.addEventListener('loadedmetadata', () => {
            try { video.currentTime = 1; } catch(e) {}
          }, { once: true });
        }
        observer.unobserve(video);
      }
    });
  }, { rootMargin: '300px' });

  videos.forEach(v => observer.observe(v));
}

function capturePosterFromVideo(video) {
  return new Promise((resolve) => {
    const src = video.dataset.src || video.getAttribute('src') || '';
    if (!src) return resolve(null);

    const tmpVideo = document.createElement('video');
    tmpVideo.crossOrigin = 'anonymous';
    tmpVideo.muted = true;
    tmpVideo.playsInline = true;
    tmpVideo.preload = 'metadata';
    tmpVideo.src = src;

    const timeout = setTimeout(() => resolve(null), 8000);

    const trySeek = () => {
      tmpVideo.currentTime = 0.5;
    };

    tmpVideo.addEventListener('loadedmetadata', trySeek, { once: true });

    tmpVideo.addEventListener('seeked', () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = tmpVideo.videoWidth || 320;
        canvas.height = tmpVideo.videoHeight || 568;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(tmpVideo, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL('image/jpeg', 0.7);
        clearTimeout(timeout);
        tmpVideo.src = '';
        resolve(dataURL);
      } catch (e) {
        clearTimeout(timeout);
        resolve(null);
      }
    }, { once: true });

    tmpVideo.load();
  });
}

function initVideoThumbs() {
  const videos = document.querySelectorAll('.card-video .video-thumb');

  if (isIOS) {
    videos.forEach(v => {
      const cardVideo = v.closest('.card-video');
      const src = v.dataset.src || v.getAttribute('src') || '';

      // Tenta usar poster já definido
      if (v.getAttribute('poster')) {
        v.style.display = 'block';
        return;
      }

      // Cria imagem de capa via canvas
      if (src) {
        const img = document.createElement('img');
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;position:absolute;inset:0;';
        img.alt = '';

        capturePosterFromVideo(v).then(dataURL => {
          if (dataURL) {
            img.src = dataURL;
            v.style.display = 'none';
            cardVideo.style.position = 'relative';
            cardVideo.insertBefore(img, cardVideo.firstChild);
          } else {
            // Fallback: fundo escuro com ícone
            v.style.display = 'none';
            cardVideo.classList.add('ios-no-frame');
            const overlay = cardVideo.querySelector('.play-overlay');
            if (overlay && !overlay.querySelector('.ios-reel-label')) {
              overlay.insertAdjacentHTML('beforeend', `
                <div class="ios-reel-label">
                  <div class="ios-reel-line"></div>
                  <span>Toque para assistir</span>
                  <div class="ios-reel-line"></div>
                </div>
              `);
            }
          }
        });
      }
    });
    return;
  }

  // Desktop/Android: carrega 1 frame como thumbnail
  videos.forEach(video => {
    const load = () => { try { video.currentTime = 1; } catch(e) {} };
    if (video.readyState >= 1) { load(); }
    else {
      video.addEventListener('loadedmetadata', load, { once: true });
      video.preload = 'metadata';
      video.load();
    }
  });
}

function initThumbs() {}






/* ════ DEPOIMENTOS CARROSSEL ════ */

function initDepCarousel() {
  const track = document.getElementById('dep-track');
  const dotsEl = document.getElementById('dep-dots');
  const prevBtn = document.getElementById('dep-prev');
  const nextBtn = document.getElementById('dep-next');
  if (!track || !dotsEl || !prevBtn || !nextBtn) return;

  const cards = Array.from(track.querySelectorAll('.dep-card'));
  const total = cards.length;
  let current = 0;
  let autoTimer;
  let visibleCount = 1;
  let pageCount = total;
  let startX = 0;

  function getGap() {
    return parseFloat(getComputedStyle(track).gap || '0') || 0;
  }

  function updateVisibleCount() {
    visibleCount = window.innerWidth <= 768 ? 1 : 3;
    pageCount = Math.max(1, total - visibleCount + 1);
    if (current > pageCount - 1) current = pageCount - 1;
  }

  function buildDots() {
    dotsEl.innerHTML = Array.from({ length: pageCount }, (_, i) =>
      `<div class="dep-dot${i === current ? ' active' : ''}" data-i="${i}"></div>`
    ).join('');
    dotsEl.querySelectorAll('.dep-dot').forEach(dot => {
      dot.addEventListener('click', () => goTo(+dot.dataset.i, true));
    });
  }

  function update() {
    updateVisibleCount();
    const gap = getGap();
    const cardWidth = cards[0] ? cards[0].getBoundingClientRect().width : 0;
    track.style.transform = `translateX(-${current * (cardWidth + gap)}px)`;

    cards.forEach((card, index) => {
      const inView = index >= current && index < current + visibleCount;
      card.classList.toggle('active', inView);
      card.setAttribute('aria-hidden', inView ? 'false' : 'true');
    });

    const dots = dotsEl.querySelectorAll('.dep-dot');
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));

    prevBtn.disabled = pageCount <= 1;
    nextBtn.disabled = pageCount <= 1;
  }

  function goTo(index, userAction = false) {
    updateVisibleCount();
    current = ((index % pageCount) + pageCount) % pageCount;
    update();
    if (userAction) resetAuto();
  }

  function resetAuto() {
    clearInterval(autoTimer);
    if (pageCount <= 1) return;
    autoTimer = setInterval(() => goTo(current + 1), 5500);
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1, true); });
  nextBtn.addEventListener('click', () => { goTo(current + 1, true); });

  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1, true);
  }, { passive: true });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const oldPages = pageCount;
      updateVisibleCount();
      if (oldPages !== pageCount) buildDots();
      update();
    }, 120);
  }, { passive: true });

  updateVisibleCount();
  buildDots();
  update();
  resetAuto();
}


/* ════ SCROLL REVEAL & ANIMATIONS ════ */

function initAnimations() {
  document.querySelectorAll('.hero-badge, .hero h1, .hero-sub, .hero-stats, .hero-btns')
    .forEach(el => el.classList.add('hero-visible'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');

      if (e.target.matches('.nichos-grid')) {
        e.target.querySelectorAll('.nicho-card').forEach((card, i) => {
          card.style.transitionDelay = `${i * 0.05}s`;
          requestAnimationFrame(() => card.classList.add('visible'));
        });
      }

      if (e.target.matches('.dep-carousel')) {
        e.target.querySelectorAll('.dep-card').forEach((card, i) => {
          card.classList.add('anim-fade');
          card.style.transitionDelay = `${i * 0.06}s`;
          requestAnimationFrame(() => card.classList.add('visible'));
        });
      }

      observer.unobserve(e.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.section-title, .portfolio-section-title, .nichos-grid, .dep-carousel').forEach(el => observer.observe(el));

  document.querySelectorAll('.p-card').forEach((el, i) => {
    el.classList.add('anim-fade');
    el.style.transitionDelay = `${(i % 4) * 0.07}s`;
    observer.observe(el);
  });

  document.querySelectorAll('.contact-wa, .contact-ig, .sobre-card').forEach((el, i) => {
    el.classList.add('anim-fade');
    el.style.transitionDelay = `${i * 0.08}s`;
    observer.observe(el);
  });
}


function initParallax() {
  const glow = document.querySelector('.hero-glow');
  const glow2 = document.querySelector('.hero-glow2');
  if (!glow) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (glow)  glow.style.transform  = `translateY(${y * .15}px)`;
    if (glow2) glow2.style.transform = `translateY(${y * .1}px)`;
  }, { passive: true });
}


/* ── THEME TOGGLE ── */
function toggleTheme() {
  const root = document.documentElement;
  const isLight = root.classList.toggle('light');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}
(function() {
  if (localStorage.getItem('theme') === 'light') {
    document.documentElement.classList.add('light');
  }
})();



document.addEventListener('DOMContentLoaded', () => {
  // Marca iOS para ajustes visuais via CSS
  if (isIOS) document.body.classList.add('is-ios');

  buildGrid();

  // Defer non-critical inits
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      setTimeout(() => initLazyVideos(), 200);
      setTimeout(() => initVideoThumbs(), 300);
      setTimeout(() => initAnimations(), 150);
      initParallax();
      initDepCarousel();
    });
  } else {
    setTimeout(() => initLazyVideos(), 400);
    setTimeout(() => initVideoThumbs(), 500);
    setTimeout(() => initAnimations(), 150);
    initParallax();
    initDepCarousel();
  }
  // Start hero word animation
  setTimeout(startHeroWords, 500);

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(el => obs.observe(el));
  }

  // Counter animation
  const counterEls = document.querySelectorAll('.stat-n[data-target]');
  if (counterEls.length) {
    const cObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { animateCounter(e.target); cObs.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counterEls.forEach(el => cObs.observe(el));
  }
});
