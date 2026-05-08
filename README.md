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

### 1. Forker le template

On **fork** le template plutôt que de cloner-puis-init. Le fork garde un lien vers le repo source, ce qui permet de récupérer plus tard les améliorations du template (`gh repo sync`).

**Via `gh` CLI (recommandé) :**

```sh
gh repo fork radiko-ca/carte-vsf-template \
  --clone=true \
  --fork-name=nom-du-client \
  --org=radiko-ca
cd nom-du-client
```

`--org=radiko-ca` crée le fork dans l'organisation Radiko. Retirer cette option pour forker sur ton compte perso.

**Via interface GitHub :**

1. Aller sur https://github.com/radiko-ca/carte-vsf-template
2. Cliquer **Fork** → choisir l'organisation `radiko-ca` → renommer en `nom-du-client`
3. Cloner localement : `gh repo clone radiko-ca/nom-du-client && cd nom-du-client`

### 2. Installer les deps

```sh
npm install
```

### 3. Modifier `src/config.ts`

C'est le **seul fichier à éditer** pour personnaliser la carte. Renseigne :

- Identité : `fullName`, `firstName`, `lastName`, `title`, `organization`, `bio`
- Contacts : `phone`, `email`, `website`, `address`
- Liens sociaux : tableau `socials[]` avec `label`, `url`, `icon`
- SEO : `metaTitle`, `metaDescription`, `canonicalUrl`
- Branding : `theme` ('light' ou 'dark')

Icônes sociales supportées : `linkedin`, `instagram`, `facebook`, `twitter`, `github`, `youtube`, `tiktok`, `whatsapp`, `telegram`, `website`.

### 4. Remplacer la photo

Mettre la photo du client à `src/assets/photo.jpg` (formats acceptés : `.jpg`, `.jpeg`, `.png`, `.webp`). Idéal : carrée, ~800×800 px minimum, fond neutre, recadrage tête + épaules.

Le script `generate-vcf.mjs` redimensionne automatiquement la photo à 400×400 si elle dépasse 100 KB (limite recommandée pour `.vcf`).

### 5. Remplacer `public/og-image.jpg`

Image 1200×630 utilisée pour les partages Facebook / LinkedIn / iMessage. Optionnel mais recommandé.

### 6. Tester en local

```sh
npm run dev
```

Ouvre `http://localhost:4321`. Vérifier :

- [ ] Photo, nom, titre, bio s'affichent correctement
- [ ] Bouton "Ajouter à mes contacts" → télécharge `contact.vcf`
- [ ] Ouvrir le `.vcf` dans Contacts.app (macOS) → photo, phone, email, address présents
- [ ] Bouton "Partager" → Web Share API (mobile) ou copie URL (desktop)
- [ ] QR code scannable → ouvre le `canonicalUrl`
- [ ] Sur iPhone Safari : bouton "Ajouter" → modal d'instructions s'affiche

### 7. Build de production

```sh
npm run build
```

Le `dist/` contient :
- `index.html` (~15 KB)
- `contact.vcf` (généré, ~50-100 KB selon taille photo)
- Photo optimisée WebP, favicon, og-image
- Tout est statique, déployable n'importe où

### 8. Pousser le fork sur GitHub

Une fois config + photo modifiés, commit + push sur le fork :

```sh
git add -A
git commit -m "feat: configuration carte nom-du-client"
git push origin main
```

### 9. Connecter Cloudflare Pages au repo forké

1. Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
2. Autoriser GitHub si pas déjà fait, choisir l'organisation `radiko-ca`
3. Sélectionner le repo forké (ex. `radiko-ca/nom-du-client`)
4. Configurer le build :
   - **Framework preset** : Astro
   - **Build command** : `npm run build`
   - **Build output directory** : `dist`
   - **Root directory** : (vide)
   - **Environment variables** :
     - `NODE_VERSION` = `22`
5. **Save and Deploy**

Chaque `git push` sur la branche `main` déclenchera automatiquement un nouveau déploiement.

### 10. Pointer le domaine du client

Cloudflare Pages → projet créé → onglet **Custom domains** → **Set up a custom domain** → entrer `nomduclient.com`.

- Si le domaine est déjà sur **Cloudflare DNS** : configuration automatique en 1-2 minutes
- Si le domaine est ailleurs : Cloudflare donne un `CNAME` à pointer vers `nom-du-client.pages.dev`

SSL Let's Encrypt est provisionné automatiquement (~5 min après ajout du domaine).

### 11. Récupérer les améliorations du template (optionnel, plus tard)

Quand le template Radiko est mis à jour, sync le fork pour récupérer les nouveautés sans perdre tes changements client :

```sh
gh repo sync radiko-ca/nom-du-client --source radiko-ca/carte-vsf-template
git pull
```

Résoudre les conflits (généralement seulement dans `src/config.ts`), commit, push.

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
