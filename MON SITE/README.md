# MALTY — Créateur de Sites Web Professionnels

Site web vitrine pour MALTY, freelance développeur web.

**Live :** [maltyshop.vercel.app](https://maltyshop.vercel.app)

## Technologies

- HTML5
- CSS3 (oklch, CSS Grid, Flexbox)
- JavaScript vanilla
- Google Fonts (Inter)

## Structure du projet

```
├── Pages publiques (racine — ne pas déplacer : URLs liées au SEO)
│   ├── index.html              # Page principale (catalogue, devis, FAQ)
│   ├── support / brief / merci / maintenance / ou-acheter.html
│   ├── espace-client / abonnement / admin.html
│   ├── login / signup / forgot-password.html
│   └── brief-nettoyage / email-devis-nettoyage.html  # Offre nettoyage
├── js/                         # Scripts partagés
│   ├── knowledge.js            # Config centralisée (tarifs, FAQ, témoignages)
│   ├── auth-guard.js           # Garde d'authentification
│   └── tracker.js              # Tracking des visites
├── img/                        # Logos & images de marque (logo.svg, réseaux, Stripe)
├── api/                        # Fonctions serverless Vercel (auth, support, stripe…)
├── assets/                     # Images marketing (flyers, pubs, photos)
├── blog/                       # Articles SEO
├── sites/                      # Sites clients (Digital Flow, Mario Consulting, Shop Eco)
├── emails/                     # Templates d'emails de prospection
├── archive/                    # Anciens projets & fichiers hérités
├── vercel.json                 # Config Vercel (routes API, crons)
├── robots.txt                  # Directives crawlers
└── sitemap.xml                 # Sitemap XML
```

**Hors site (confidentiel) :** `~/Documents/MALTY - docs internes/` — listes de prospects,
scripts d'appel et documents internes, sortis volontairement du dossier déployé.

## Fonctionnalités

- Design dark mode (bleu/noir)
- Navigation SPA (single page)
- Catalogue de packs dynamique (de 99€ à 899€)
- Formulaire de devis intégré
- Paiement Stripe & PayPal
- FAQ accordéon
- Animations reveal au scroll
- Trust bar avec compteurs animés
- SEO optimisé (schema.org, Open Graph, sitemap)
- Responsive mobile
- Bouton d'appel mobile
- Espace client avec dashboard

## Déploiement

Le site est déployé sur **Vercel**. Push sur `main` pour déployer automatiquement.

## Contact

- Email : maltyz@outlook.fr
