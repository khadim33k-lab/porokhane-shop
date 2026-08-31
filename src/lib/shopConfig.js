// ─── CONFIG BOUTIQUE CENTRALISÉE ───
// Modifiez ici pour changer les infos partout dans le site

export const SHOP_CONFIG = {
    name:      'Porokhane Shop',
    slogan:    'Élégance, Pudeur et Classe en parfaite symbiose',
    delivery:  'Livraison à Dakar et partout dans le monde',
    phone:     '78 536 34 25',
    whatsapp:  '221785363425',
    address:   'Guediawaye, Hamo4, Dakar',
    twitter:   '@porokhaneshop',
    xUrl:      'https://x.com/porokhaneshop',
    tiktok:    '@porokhaneshop',
    tiktokUrl: 'https://www.tiktok.com/@porokhaneshop',
    zones:     'Dakar, Pikine, Guediawaye, Parcelles, Thiaroye',
    logo:      '/images/porokhane-logo.webp',
    instagram: '',
    email:     'admin@porokhaneshop.com',
  }
  
  // Helper : lien WhatsApp avec message
  export const whatsappLink = (message = '') => {
    const base = `https://wa.me/${SHOP_CONFIG.whatsapp}`
    return message ? `${base}?text=${encodeURIComponent(message)}` : base
  }
  
  export default SHOP_CONFIG
