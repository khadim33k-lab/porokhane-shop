# Mise à jour Porokhane Shop dans VS Code

## Résultat de la mise à jour

- Design professionnel et responsive de la boutique publique.
- Deux catégories principales : `Mode & Voiles` et `Accessoires`.
- Le Zikr Ring iQibla et les chapelets électroniques sont regroupés dans `Accessoires`.
- Slogan exact : `Élégance, Pudeur et Classe en parfaite symbiose`.
- Logo Porokhane enregistré localement dans le projet.
- Logo officiel WhatsApp intégré dans l’en-tête, l’accueil, le pied de page, le panier, la commande et la version mobile.
- Supabase, le panier, les commandes et l’administration sont conservés.
- PWA corrigée : le manifeste et le Service Worker sont maintenant copiés dans la production Vite.

## 1. Copier les fichiers

1. Fermez le serveur `npm run dev` s’il fonctionne.
2. Décompressez `Porokhane-Design-VSCode-Update.zip`.
3. Copiez son contenu dans le dossier racine de votre projet :

   `C:\Users\user\OneDrive\Desktop\BICHRI GROUPE\pshop2\porokhane-supabase`

4. Lorsque Windows le demande, choisissez **Remplacer les fichiers dans la destination**.
5. Ne supprimez pas et ne remplacez pas votre fichier `.env`. Il n’est pas inclus dans la mise à jour.

## 2. Tester dans VS Code

Ouvrez le terminal de VS Code dans `porokhane-supabase`, puis exécutez :

```powershell
npm install
npm run dev
```

Ouvrez ensuite l’adresse affichée par Vite, généralement :

`http://localhost:5173`

Vérifiez :

1. La page d’accueil sur ordinateur et mobile.
2. Les filtres `Mode & Voiles` et `Accessoires`.
3. L’ouverture du panier.
4. Les boutons WhatsApp vers le numéro `78 536 34 25`.
5. L’espace administrateur et les produits Supabase.

## 3. Vérifier la version de production

Dans le terminal :

```powershell
npm run build
```

La commande doit terminer avec le message `built` sans erreur.

## 4. Envoyer sur GitHub

```powershell
git status
git add index.html manifest.json sw.js public src
git commit -m "Refonte professionnelle Porokhane Shop"
git push origin main
```

Si Git demande de définir la branche distante :

```powershell
git push -u origin main
```

## 5. Déploiement Vercel

Vercel redéploiera automatiquement le site après le `git push` sur `main`.

1. Ouvrez le projet Porokhane Shop dans Vercel.
2. Allez dans `Deployments`.
3. Attendez le statut `Ready`.
4. Ouvrez le site et faites `Ctrl + F5` pour charger le nouveau design.

Le nouveau Service Worker utilise le cache `porokhane-v2`, ce qui supprime l’ancien cache de l’application.

## Fichiers principaux modifiés

- `src/pages/Home.jsx`
- `src/pages/Home.module.css`
- `src/components/Navbar/Navbar.jsx`
- `src/components/Navbar/Navbar.module.css`
- `src/components/Footer.jsx`
- `src/components/Footer.module.css`
- `src/components/Product/ProductCard.jsx`
- `src/components/Product/ProductCard.module.css`
- `src/pages/Products.jsx`
- `src/pages/Products.module.css`
- `src/lib/catalog.js`
- `src/lib/shopConfig.js`
- `src/components/icons/WhatsAppIcon.jsx`
- `public/manifest.json`
- `public/sw.js`
- `public/images/porokhane-logo.webp`
- `public/images/porokhane-campaign.jpg`
