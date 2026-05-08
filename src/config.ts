/**
 * Configuration de la carte d'affaires virtuelle.
 * Modifier ce fichier pour chaque client. Tout le reste du template lit d'ici.
 */

export type SocialIcon =
  | 'linkedin'
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'github'
  | 'youtube'
  | 'tiktok'
  | 'whatsapp'
  | 'telegram'
  | 'website';

export interface Social {
  label: string;
  url: string;
  icon: SocialIcon;
}

export interface Address {
  street?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
}

export interface CardConfig {
  fullName: string;
  firstName: string;
  lastName: string;
  title: string;
  organization?: string;
  bio: string;

  phone?: string;
  email: string;
  website: string;
  address?: Address;

  socials: Social[];

  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;

  theme: 'light' | 'dark';

  labels: {
    cardLabel: string;
    addContact: string;
    share: string;
    phone: string;
    email: string;
    website: string;
    address: string;
    qrLabel: string;
    footerNote: string;
    shareTitle: string;
    shareText: string;
    sharedCopied: string;
  };
}

export const card: CardConfig = {
  fullName: 'Prénom Nom',
  firstName: 'Prénom',
  lastName: 'Nom',
  title: 'Titre / Poste',
  organization: '',
  bio: 'Une ou deux phrases courtes qui décrivent ce que la personne fait. Garde ça simple et humain.',

  phone: '+1 514 000 0000',
  email: 'hello@exemple.com',
  website: 'https://exemple.com',
  address: {
    city: 'Montréal',
    region: 'QC',
    country: 'Canada',
  },

  socials: [],

  metaTitle: "Prénom Nom · Carte d'affaires",
  metaDescription: "Carte d'affaires numérique. Ajoute-moi à tes contacts en un clic.",
  canonicalUrl: 'https://exemple.com',

  theme: 'light',

  labels: {
    cardLabel: "Carte d'affaires",
    addContact: 'Ajouter à mes contacts',
    share: 'Partager ma carte',
    phone: 'Téléphone',
    email: 'Courriel',
    website: 'Site web',
    address: 'Adresse',
    qrLabel: 'Scanne pour ouvrir cette carte',
    footerNote:
      "Si ton téléphone supporte NameDrop (iOS 17+), tu peux aussi simplement coller nos deux iPhones ensemble.",
    shareTitle: 'Carte de contact',
    shareText: 'Ajoute-moi à tes contacts.',
    sharedCopied: 'Lien copié!',
  },
};
