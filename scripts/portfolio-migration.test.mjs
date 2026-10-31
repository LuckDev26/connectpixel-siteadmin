import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildPortfolioManifest} from './migrate-portfolio.mjs';

const source = await readFile(new URL('../public/main.js', import.meta.url), 'utf8');
const manifest = buildPortfolioManifest(source);
const {portfolio, counts} = manifest;

assert.equal(counts.total, 268);
assert.equal(counts.reels, 149);
assert.equal(counts.cards, 108);
assert.equal(counts.carousels, 11);
assert.equal(portfolio.reels.length + portfolio.cards.length + portfolio.carousels.length, 268);

const ids = [...portfolio.reels, ...portfolio.cards, ...portfolio.carousels].map(item => item.id);
assert.equal(new Set(ids).size, 268, 'IDs únicos para itens com títulos iguais');

const expectedBase = 'https://media.connectpixel.online/';
for (const item of [...portfolio.reels, ...portfolio.cards]) {
  assert.ok((item.video || item.image).startsWith(expectedBase), 'URL de mídia deve usar o R2');
  assert.equal(item.migrationStatus, 'unverified-r2');
}
for (const item of portfolio.carousels) {
  assert.ok(item.slides.length > 0);
  assert.equal(item.image, item.slides[0].url);
  for (const slide of item.slides) assert.ok(slide.url.startsWith(expectedBase));
}
assert.ok(counts.slides >= counts.carousels);
console.log('Migration: 268 itens catalogados, caminhos normalizados, carrosséis preservados; nenhum upload/publicação efetuado.');
