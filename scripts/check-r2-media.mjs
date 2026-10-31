/**
 * Validação SOMENTE LEITURA das URLs de mídia migradas.
 * HEAD por padrão (sem baixar vídeos); não acessa painel nem utiliza tokens.
 *
 * node scripts/check-r2-media.mjs --sample=18
 * node scripts/check-r2-media.mjs --all
 * node scripts/check-r2-media.mjs --all --write
 *
 * Saídas: status 200/404/403 etc. Nenhum arquivo é excluído.
 */
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(ROOT, 'migration/portfolio-manifest.json');
const OUTPUT = path.join(ROOT, 'migration/media-audit.json');
const opts = process.argv.slice(2);
const full = opts.includes('--all');
const write = opts.includes('--write');
const sampleArg = opts.find(x => /^--sample=\d+$/.test(x));
const sampleSize = sampleArg ? Number(sampleArg.split('=')[1]) : 18;
const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
const portfolio = manifest.portfolio;
const all = [...portfolio.reels.map(x => x.video), ...portfolio.cards.map(x => x.image), ...portfolio.carousels.flatMap(x => x.slides.map(s => s.url))];
const urls = Array.from(new Set(all));
if (urls.length !== 308) throw new Error('A lista de mídia mudou; reveja o manifesto antes de continuar');
const targets = full || sampleSize >= urls.length ? urls : Array.from({length: Math.max(1, sampleSize)}, (_, i) => urls[Math.floor(i * (urls.length - 1) / Math.max(1, sampleSize - 1))]);

async function inspect(url) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, {method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(7000), headers: {'User-Agent': 'ConnectPixel-Staging-Media-Audit/1.0'}});
      return {url, status: res.status, state: res.ok ? 'present' : res.status === 404 ? 'missing' : (res.status >= 400 && res.status < 500 ? 'blocked' : 'unavailable'), type: res.headers.get('content-type'), bytes: Number(res.headers.get('content-length') || 0)};
    } catch (e) {
      if (attempt === 2) return {url, status: 0, state: 'network-error', reason: String(e.message).slice(0, 120)};
    }
  }
}
const result = [];
let next = 0;
async function worker() {
  while (next < targets.length) {
    const index = next++;
    result[index] = await inspect(targets[index]);
  }
}
await Promise.all(Array.from({length: Math.min(4, targets.length)}, worker));
const counts = result.reduce((acc, x) => (acc[x.state] = (acc[x.state] || 0) + 1, acc), {});
const report = {source: 'migration/portfolio-manifest.json', mode: full ? 'all' : 'sample', checked: targets.length, totalMediaUrls: urls.length, counts, results: result};
if (write) {
  await mkdir(path.dirname(OUTPUT), {recursive: true});
  await writeFile(OUTPUT, JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify(report, null, 2));
// Auditoria não falha build por mídia ausente: relatório informa o risco sem publicar ou apagar.
