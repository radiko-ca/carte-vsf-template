# carte-vsf-template

Template Astro statique pour cartes d'affaires virtuelles. Style noir/blanc Apple, vCard téléchargeable, QR code, modal iOS pour vraiment enregistrer le contact.

Bâti par [Radiko](https://radiko.ca) — Mont-Saint-Hilaire, QC.

## Aperçu

- 1 page, 100% statique (pas d'API, pas de JS framework, pas de build complexe)
- Photo + nom + titre + bio + bouton "Ajouter à mes contacts" + boutons sociaux + QR code
- Fichier `.vcf` v3.0 standard généré automatiquement au build (avec photo base64)
- Modal d'instructions iOS pour contourner le bug Quick Look où le bouton Done n'enregistre rien
- Web Share API + fallback clipboard
- Schema.org Person, Open Graph, Twitter Card
- Theme `light` (blanc/noir) ou `dark` (noir/blanc) — toggle via `src/config.ts`
- Build Lighthouse ~100/100/100/100 attendu

## Stack

| | |
|---|---|
| Framework | Astro 6 (SSG) |
| CSS | Vanilla scoped — variables CSS, pas de Tailwind |
| Fonts | SF Pro stack système + Inter Variable fallback (Fontsource) |
| QR Code | `qrcode` (généré au build, SVG inline, zéro JS runtime) |
| vCard | Script Node natif (`scripts/generate-vcf.mjs`) lit `src/config.ts`, écrit `public/contact.vcf` |
| Hosting | Cloudflare Pages (build: `npm run build`, output: `dist/`) |

## Démarrage rapide pour un nouveau client

**Tout se fait dans le browser** — pas de terminal, pas de `git clone`, pas de `npm install`. Le fork garde le lien vers le template source, ce qui permet de récupérer les futures améliorations.

### 1. Forker le template sur GitHub

1. Aller sur https://github.com/radiko-ca/carte-vsf-template
2. Cliquer **Fork** (en haut à droite)
3. **Owner** : `radiko-ca` · **Repository name** : `nom-du-client` (ex: `gabrieldupras-card`)
4. **Decoche** "Copy the `main` branch only" si tu veux toutes les branches (sinon laisse coché)
5. Cliquer **Create fork**

Le fork est instantané. Tu te retrouves sur `https://github.com/radiko-ca/nom-du-client`.

### 2. Modifier `src/config.ts` directement dans GitHub

1. Dans le repo forké, naviguer à `src/config.ts`
2. Cliquer l'icône **crayon** (Edit this file) en haut à droite du fichier
3. Modifier les champs :
   - **Identité** : `fullName`, `firstName`, `lastName`, `title`, `organization`, `bio`
   - **Contacts** : `phone`, `email`, `website`, `address` (rue, ville, région, code postal, pays)
   - **Liens sociaux** : tableau `socials[]` avec `label`, `url`, `icon`
   - **SEO** : `metaTitle`, `metaDescription`, `canonicalUrl`
   - **Branding** : `theme` (`'light'` blanc/noir ou `'dark'` noir/blanc)
4. **Commit changes** : message court (ex: "config: infos client") → **Commit directly to main**

Icônes sociales supportées : `linkedin`, `instagram`, `facebook`, `twitter`, `github`, `youtube`, `tiktok`, `whatsapp`, `telegram`, `website`.

### 3. Remplacer la photo dans GitHub

1. Naviguer à `src/assets/photo.jpg` dans le repo forké
2. Cliquer l'icône **poubelle** (Delete this file) → **Commit changes**
3. Retour à `src/assets/` → bouton **Add file** → **Upload files**
4. Glisser la nouvelle photo (`.jpg`, `.jpeg`, `.png`, ou `.webp`)
5. **Renommer** le fichier en `photo.jpg` (ou autre extension supportée)
6. **Commit changes**

Photo idéale : carrée, ~800×800 px, fond neutre, cadrage tête + épaules.
Le script de build redimensionne automatiquement à 400×400 si elle dépasse 100 KB.

### 4. (Optionnel) Remplacer `public/og-image.jpg`

Image 1200×630 utilisée pour les partages Facebook / LinkedIn / iMessage. Même processus que la photo.

### 5. Connecter Cloudflare Pages au repo forké

1. Cloudflare Dashboard → **Workers & Pages** → **Create application** → onglet **Pages** → **Connect to Git**
2. Autoriser GitHub si demandé → choisir l'organisation `radiko-ca`
3. Sélectionner le repo forké (`radiko-ca/nom-du-client`) → **Begin setup**
4. Remplir le formulaire de build :

   | Champ | Valeur |
   |---|---|
   | **Project name** | `nom-du-client` (sera le sous-domaine `nom-du-client.pages.dev`) |
   | **Production branch** | `main` |
   | **Framework preset** | Astro |
   | **Build command** | `npm run build` |
   | **Build output directory** | `dist` |
   | **Root directory** | (laisser vide) |

5. Sous **Environment variables (advanced)**, ajouter :
   - `NODE_VERSION` = `22`

6. **Save and Deploy** — premier build ~1 minute. Une fois fini, le site est accessible à `https://nom-du-client.pages.dev`.

Chaque commit futur sur `main` (via GitHub web UI ou autrement) **redéploie automatiquement**.

### 6. Pointer le domaine du client

Cloudflare Pages → projet créé → onglet **Custom domains** → **Set up a custom domain** → entrer `nomduclient.com`.

- Si le domaine est déjà sur **Cloudflare DNS** : configuration automatique en 1-2 minutes
- Si le domaine est ailleurs : Cloudflare donne un `CNAME` à pointer vers `nom-du-client.pages.dev`

SSL Let's Encrypt provisionné automatiquement (~5 min).

### 7. Récupérer les améliorations du template (plus tard)

Quand le template Radiko est mis à jour, sync le fork via GitHub web :

1. Aller sur le repo forké `radiko-ca/nom-du-client`
2. Bouton **Sync fork** (en haut, sous le nom du repo)
3. **Update branch**

Si conflits (rare, normalement juste `src/config.ts`), GitHub guide la résolution en ligne.

---

## Workflow alternatif : dev local

Pour tester en local avant de pousser, ou pour modifier plus de choses que `config.ts` + photo :

```sh
gh repo clone radiko-ca/nom-du-client
cd nom-du-client
npm install
npm run dev
```

Ouvrir `http://localhost:4321`. Vérifier :

- [ ] Photo, nom, titre, bio s'affichent correctement
- [ ] Bouton "Ajouter à mes contacts" → télécharge `contact.vcf`
- [ ] Ouvrir le `.vcf` dans Contacts.app (macOS) → photo, phone, email, address présents
- [ ] Bouton "Partager" → Web Share API (mobile) ou copie URL (desktop)
- [ ] QR code scannable → ouvre le `canonicalUrl`
- [ ] Sur iPhone Safari : bouton "Ajouter" → modal d'instructions s'affiche

Build de production : `npm run build` → `dist/` contient `index.html` (~15 KB) + `contact.vcf` + assets optimisés.

Push : `git add -A && git commit -m "..." && git push`. Cloudflare Pages redéploie automatiquement.

## Architecture

```
carte-vsf-template/
├── src/
│   ├── config.ts              ← LE FICHIER À MODIFIER PAR CLIENT
│   ├── pages/
│   │   └── index.astro        ← La carte (page unique)
│   ├── layouts/
│   │   └── Layout.astro       ← Shell HTML, meta, Schema.org Person
│   ├── components/
│   │   ├── Card.astro         ← Photo + nom + titre + bio
│   │   ├── ActionButtons.astro ← Boutons "Ajouter contact" + "Partager"
│   │   ├── ContactList.astro  ← Rangées tel/email/web/adresse/socials
│   │   ├── QRBlock.astro      ← QR code SVG (build-time)
│   │   ├── IOSModal.astro     ← Modal instructions iOS
│   │   └── SocialIcon.astro   ← Icônes SVG inline (LinkedIn, IG, etc.)
│   ├── styles/
│   │   └── global.css         ← Variables CSS, theme light/dark, reset
│   └── assets/
│       └── photo.jpg          ← Photo du client (optimisée auto par astro:assets)
├── public/
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   ├── og-image.jpg           ← 1200×630 pour partages sociaux
│   └── contact.vcf            ← GÉNÉRÉ au build (gitignored)
├── scripts/
│   └── generate-vcf.mjs       ← Lit config.ts, génère contact.vcf
├── astro.config.mjs
├── wrangler.jsonc             ← Config Cloudflare Pages
├── package.json
└── tsconfig.json
```

## Modifications avancées

### Changer la couleur d'accent (boutons CTA)

Dans `src/styles/global.css`, modifier les variables `--accent` et `--accent-hover` du thème actif :

```css
:root {
  --accent: #000000;        /* Noir Apple — défaut */
  --accent-hover: #1d1d1f;
  --accent-on: #ffffff;     /* Couleur du texte sur l'accent */
}
```

### Ajouter une nouvelle icône sociale

1. Ajouter le slug dans le type `SocialIcon` (`src/config.ts`)
2. Ajouter le `<svg>` correspondant dans `src/components/SocialIcon.astro`

### Désactiver le modal iOS

Si l'aperçu Quick Look natif d'iOS te suffit, supprimer le composant `<IOSModal />` de `src/pages/index.astro` et le bloc de détection iOS dans le `<script>`.

## FAQ

**Pourquoi un modal iOS pour le vCard?**
Quand on tape sur un `.vcf` sur iPhone, iOS ouvre un panneau "Quick Look" qui ressemble à une fiche contact. Le bouton "Done" en haut **ferme la fiche sans enregistrer**. Pour vraiment enregistrer, il faut scroller jusqu'au bas et taper "Create New Contact". Le modal explique cette étape avant l'ouverture.

**Pourquoi pas de framework JS / Tailwind?**
Une carte d'affaires statique n'a aucun besoin de React, Vue, ou Tailwind. Vanilla CSS + Astro suffit largement. Bundle final < 50 KB hors photo.

**Le `.vcf` ne s'ouvre pas correctement sur Android?**
Android préfère parfois le format vCard 4.0. Pour adapter, modifier `scripts/generate-vcf.mjs` ligne 1 : `lines.push('VERSION:4.0');` (et adapter quelques champs selon la spec).

## Licence

MIT — utilisable librement par les clients de Radiko et au-delà.
