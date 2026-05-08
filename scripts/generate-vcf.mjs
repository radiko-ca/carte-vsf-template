/**
 * Génère public/contact.vcf à partir de src/config.ts.
 * Lancé automatiquement avant `astro build` (script prebuild dans package.json).
 *
 * Format: vCard v3.0 standard (compatible iOS, macOS, Android, Outlook, etc.)
 * Photo: encodée en base64 directement dans le .vcf (auto-conversion JPG via sharp).
 */

import { readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Ce script doit être lancé via `tsx` (voir package.json scripts)
// pour pouvoir importer le fichier TypeScript src/config.ts.

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const { card } = await import(resolve(root, 'src/config.ts'));

/**
 * Échappe les caractères spéciaux selon RFC 2426 §5
 */
function vcfEscape(value) {
  if (value == null) return '';
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

/**
 * Plie une ligne vCard à 75 octets max selon RFC 2426 §2.6
 */
function fold(line) {
  if (line.length <= 75) return line;
  const out = [];
  let i = 0;
  out.push(line.slice(0, 75));
  i = 75;
  while (i < line.length) {
    out.push(' ' + line.slice(i, i + 74));
    i += 74;
  }
  return out.join('\r\n');
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function getPhotoBase64() {
  const candidates = [
    'src/assets/photo.jpg',
    'src/assets/photo.jpeg',
    'src/assets/photo.png',
    'src/assets/photo.webp',
  ];

  for (const rel of candidates) {
    const abs = resolve(root, rel);
    if (await fileExists(abs)) {
      const buffer = await readFile(abs);
      const ext = rel.split('.').pop().toLowerCase();

      // vCard 3.0 supporte JPEG, PNG. WebP non standard — on le convertit en JPEG via sharp.
      if (ext === 'webp') {
        try {
          const { default: sharp } = await import('sharp');
          const converted = await sharp(buffer)
            .resize(400, 400, { fit: 'cover' })
            .jpeg({ quality: 85 })
            .toBuffer();
          return { type: 'JPEG', data: converted.toString('base64') };
        } catch {
          console.warn('[generate-vcf] sharp non disponible, photo WebP omise.');
          return null;
        }
      }

      // Resize JPEG/PNG si trop gros (vCard >100KB = bug sur certains clients)
      if (buffer.length > 100_000) {
        try {
          const { default: sharp } = await import('sharp');
          const resized = await sharp(buffer)
            .resize(400, 400, { fit: 'cover' })
            .jpeg({ quality: 85 })
            .toBuffer();
          return { type: 'JPEG', data: resized.toString('base64') };
        } catch {
          // Fallback: on garde tel quel
        }
      }

      const type = ext === 'png' ? 'PNG' : 'JPEG';
      return { type, data: buffer.toString('base64') };
    }
  }

  return null;
}

async function buildVCard() {
  const lines = [];
  lines.push('BEGIN:VCARD');
  lines.push('VERSION:3.0');
  lines.push('PRODID:-//radiko//carte-vsf-template//FR');

  // Nom — N: Last;First;Middle;Prefix;Suffix
  lines.push(`N:${vcfEscape(card.lastName)};${vcfEscape(card.firstName)};;;`);
  lines.push(`FN:${vcfEscape(card.fullName)}`);

  if (card.organization) {
    lines.push(`ORG:${vcfEscape(card.organization)}`);
  }
  if (card.title) {
    lines.push(`TITLE:${vcfEscape(card.title)}`);
  }

  if (card.phone) {
    lines.push(`TEL;TYPE=CELL,VOICE:${vcfEscape(card.phone)}`);
  }

  if (card.email) {
    lines.push(`EMAIL;TYPE=INTERNET,WORK:${vcfEscape(card.email)}`);
  }

  if (card.website) {
    lines.push(`URL:${vcfEscape(card.website)}`);
  }

  // Adresse — ADR: PO;Ext;Street;City;Region;Postal;Country
  if (card.address) {
    const a = card.address;
    lines.push(
      'ADR;TYPE=WORK:;;' +
        [
          vcfEscape(a.street ?? ''),
          vcfEscape(a.city ?? ''),
          vcfEscape(a.region ?? ''),
          vcfEscape(a.postalCode ?? ''),
          vcfEscape(a.country ?? ''),
        ].join(';')
    );
  }

  // Liens sociaux — chaque social = une ligne URL
  for (const s of card.socials ?? []) {
    lines.push(`item${lines.length}.URL:${vcfEscape(s.url)}`);
    lines.push(`item${lines.length - 1}.X-ABLabel:${vcfEscape(s.label)}`);
  }

  if (card.bio) {
    lines.push(`NOTE:${vcfEscape(card.bio)}`);
  }

  // Photo — base64 encoded
  const photo = await getPhotoBase64();
  if (photo) {
    const photoLine = `PHOTO;ENCODING=b;TYPE=${photo.type}:${photo.data}`;
    lines.push(photoLine);
  }

  lines.push('REV:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''));
  lines.push('END:VCARD');

  // CRLF + line folding par ligne
  return lines.map(fold).join('\r\n') + '\r\n';
}

async function main() {
  const vcf = await buildVCard();
  const outPath = resolve(root, 'public/contact.vcf');
  await writeFile(outPath, vcf, 'utf8');

  const sizeKB = (Buffer.byteLength(vcf) / 1024).toFixed(1);
  console.log(`[generate-vcf] ✓ public/contact.vcf généré (${sizeKB} KB) pour ${card.fullName}`);
}

main().catch((err) => {
  console.error('[generate-vcf] ✗ Erreur:', err);
  process.exit(1);
});
