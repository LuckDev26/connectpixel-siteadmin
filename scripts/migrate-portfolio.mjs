/**
 * Exporta o catálogo LEGADO do site ConnectPixel para um manifesto editável.
 * Operação exclusivamente local: não acessa nem modifica Cloudflare, R2 ou Supabase.
 *
 * Uso:
 *   node scripts/migrate-portfolio.mjs            # só contagens
 *   node scripts/migrate-portfolio.mjs --write    # gera migration/portfolio-manifest.json
 */
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INPUT = path.join(ROOT, 'public/main.js');
const OUTPUT = path.join(ROOT, 'migration/portfolio-manifest.json');
const MEDIA_BASE = 'https://media.connectpixel.online';

function getField(line, field) {
  const match = line.match(new RegExp('\\b' + field + '\\s*:\\s*"([^"]*)"'));
  return match ? match[1] : '';
}

function mediaUrl(value) {
  if (!value) return '';
  const url = String(value).trim();
  if (/^https?:\/\//i.test(url)) return url;
  if (!/^(videos|imagens|clientes|feedbacks)\//i.test(url)) {
    throw new Error('Caminho de mídia inesperado: ' + url);
  }
  return MEDIA_BASE + '/' + url.replace(/^\/+/, '');
}

export function buildPortfolioManifest(source) {
  const match = source.match(/\bconst PROJETOS\s*=\s*\[([\s\S]*?)\n\];/);
  if (!match) throw new Error('Bloco PROJETOS não encontrado no main.js');
  const lines = match[1].split(/\r?\n/).filter(line => /^\s*\{\s*nicho\s*:/.test(line));
  const portfolio = {reels: [], cards: [], carousels: []};
  const seenPaths = new Map();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const tipo = getField(line, 'tipo');
    const title = getField(line, 'titulo');
    const segment = getField(line, 'nicho');
    const subcategory = getField(line, 'subcategoria');
    if (!title || !segment) throw new Error('Projeto legado sem título/nicho na posição ' + (i + 1));
    const common = {
      id: 'legacy-' + String(i + 1).padStart(4, '0'),
      title, segment, subcategory, visible: true,
      legacyIndex: i + 1, migrationStatus: 'unverified-r2'
    };

    if (tipo === 'video') {
      const sourcePath = getField(line, 'url');
      portfolio.reels.push({...common, order: portfolio.reels.length + 1, video: mediaUrl(sourcePath), sourcePath});
      seenPaths.set(sourcePath, (seenPaths.get(sourcePath) || 0) + 1);
    } else if (tipo === 'post') {
      const sourcePath = getField(line, 'img');
      portfolio.cards.push({...common, order: portfolio.cards.length + 1, image: mediaUrl(sourcePath), sourcePath});
      seenPaths.set(sourcePath, (seenPaths.get(sourcePath) || 0) + 1);
    } else if (tipo === 'carrossel') {
      const arrayBody = line.match(/\bimgs\s*:\s*\[([^\]]*)\]/)?.[1];
      const paths = arrayBody ? Array.from(arrayBody.matchAll(/"([^"]+)"/g), m => m[1]) : [];
      if (!paths.length) throw new Error('Carrossel legado sem slides na posição ' + (i + 1));
      const slides = paths.map((sourcePath, index) => ({
        url: mediaUrl(sourcePath), sourcePath, order: index + 1
      }));
      paths.forEach(sourcePath => seenPaths.set(sourcePath, (seenPaths.get(sourcePath) || 0) + 1));
      portfolio.carousels.push({...common, order: portfolio.carousels.length + 1, slides, image: slides[0].url, sourcePaths: paths});
    } else {
      throw new Error('Tipo não mapeado: ' + tipo + ' na posição ' + (i + 1));
    }
  }

  const counts = {
    total: lines.length,
    reels: portfolio.reels.length,
    cards: portfolio.cards.length,
    carousels: portfolio.carousels.length,
    slides: portfolio.carousels.reduce((n, item) => n + item.slides.length, 0),
    repeatedPaths: Array.from(seenPaths.entries()).filter(([,count]) => count > 1).map(([sourcePath,count]) => ({sourcePath,count}))
  };
  return {
    meta: {
      source: 'public/main.js::PROJETOS',
      importMode: 'staging-only',
      note: 'URLs migradas a partir do código; existência no R2 ainda deve ser confirmada antes da publicação.'
    },
    counts,
    portfolio
  };
}

async function main() {
  const source = await readFile(INPUT, 'utf8');
  const manifest = buildPortfolioManifest(source);
  const {total, reels, cards, carousels} = manifest.counts;
  if (total !== 268 || reels !== 149 || cards !== 108 || carousels !== 11) {
    throw new Error('Quantidade inesperada; revise a origem antes de importar: ' + JSON.stringify(manifest.counts));
  }
  if (process.argv.includes('--write')) {
    await mkdir(path.dirname(OUTPUT), {recursive: true});
    await writeFile(OUTPUT, JSON.stringify(manifest, null, 2) + '\n');
    console.log('Manifesto de staging criado em ' + OUTPUT);
  }
  console.log(JSON.stringify(manifest.counts, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {console.error(error); process.exitCode = 1;});
}
