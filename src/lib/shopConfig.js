// ─── CONFIG BOUTIQUE CENTRALISÉE ───
// Modifiez ici pour changer les infos partout dans le site

export const SHOP_CONFIG = {
    name:      'Porokhane Shop',
    slogan:    'Élégance, Pudeur et Classe en parfait symbiose !',
    phone:     '78 536 34 25',
    whatsapp:  '221785363425',
    address:   'Guediawaye, Hamo4, Dakar',
    twitter:   '@porokhaneshop',
    zones:     'Dakar, Pikine, Guediawaye, Parcelles, Thiaroye',
    logo:      'https://fedznkkxobzgzsbybozb.supabase.co/storage/v1/object/public/product-images/Porokhane%20SHOP.png',
    instagram: '',
    email:     'admin@porokhaneshop.com',
  }
  
  // Helper : lien WhatsApp avec message
  export const whatsappLink = (message = '') => {
    const base = `https://wa.me/${SHOP_CONFIG.whatsapp}`
    return message ? `${base}?text=${encodeURIComponent(message)}` : base
  }
  
  export default SHOP_CONFIG