-- ═══════════════════════════════════════════════════════════
-- POROKHANE SHOP — SCHÉMA SUPABASE
-- Colle ce code dans : Supabase → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════

-- ─── TABLE PRODUITS ───
create table if not exists products (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  category    text not null,
  material    text,
  price       integer not null,
  old_price   integer default 0,
  stock       integer default 0,
  alert_stock integer default 3,
  colors      text,
  badge       text,
  emoji       text default '🧕',
  description text,
  image_url   text,
  bg_color    text default '#FFF6E8',
  active      boolean default true,
  sales_count integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── TABLE COMMANDES ───
create table if not exists orders (
  id             uuid default gen_random_uuid() primary key,
  client_name    text not null,
  client_phone   text not null,
  client_zone    text,
  client_address text,
  items          jsonb not null default '[]',
  total          integer not null,
  payment_method text default 'Wave',
  note           text,
  status         text default 'Nouveau',
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ─── DONNÉES DE DÉMARRAGE (12 produits) ───
insert into products (name, category, material, price, old_price, stock, alert_stock, colors, badge, emoji, bg_color) values
  ('Voile Pashmina Uni',     'Pashmina',     'Pashmina', 8500,  0,     12, 3, 'Beige · Noir · Bordeaux · Rose',  'Nouveau',  '🧕', '#FFF6E8'),
  ('Pashmina Brodé Floral',  'Pashmina',     'Pashmina', 11000, 0,     8,  2, 'Rose · Ivoire · Vert Amande',     'Exclusif', '🌸', '#FFF0F5'),
  ('Pashmina Long Premium',  'Pashmina',     'Pashmina', 9000,  13000, 5,  2, 'Camel · Gris · Marine · Noir',    'Promo',    '🌺', '#FFF4EC'),
  ('Voile Jersey Léger',     'Jersey',       'Jersey',   5500,  0,     20, 4, 'Blanc · Noir · Gris · Nude',      '',         '✨', '#F8FFF0'),
  ('Jersey Stretch Doux',    'Jersey',       'Jersey',   6000,  0,     15, 3, 'Vert Sage · Bleu Ciel · Taupe',   'Nouveau',  '💚', '#F0FFF4'),
  ('Hijab Jersey Côtelé',    'Jersey',       'Jersey',   6500,  0,     10, 3, 'Sage · Nude · Chocolat',          '',         '🌿', '#F0F8F0'),
  ('Voile Cashmere Doux',    'Cashmere',     'Cashmere', 15000, 0,     6,  2, 'Camel · Noir · Crème · Chocolat', 'Premium',  '👑', '#FFFAEF'),
  ('Cashmere Oversize',      'Cashmere',     'Cashmere', 13000, 18000, 4,  2, 'Rouille · Beige · Gris Perle',    'Promo',    '🍂', '#FFF5E8'),
  ('Voile Crêpe Satiné',     'Crêpe & Soie', 'Crêpe',   9500,  0,     10, 3, 'Mauve · Or · Ivoire · Blush',     '',         '🌙', '#F5F0FF'),
  ('Hijab Soie Naturelle',   'Crêpe & Soie', 'Soie',    12000, 0,     7,  2, 'Champagne · Bleu Nuit · Rose',    'Luxe',     '🌟', '#FFFFF0'),
  ('Épingles Hijab (lot 6)', 'Accessoires',  '—',        2500,  0,     30, 5, 'Doré · Argenté · Rosé',          '',         '📿', '#F0F5FF'),
  ('Bonnet Sous-Hijab',      'Accessoires',  'Coton',    3000,  0,     18, 4, 'Noir · Blanc · Gris · Nude',      '',         '🎀', '#FFF0F8');

-- ─── SÉCURITÉ (RLS) ───
alter table products enable row level security;
alter table orders   enable row level security;

-- Tout le monde peut lire les produits actifs
create policy "Produits publics" on products
  for select using (active = true);

-- Admins peuvent tout faire sur products
create policy "Admin produits" on products
  for all using (auth.role() = 'authenticated');

-- Tout le monde peut créer une commande
create policy "Créer commande" on orders
  for insert with check (true);

-- Admins peuvent tout voir/modifier les commandes
create policy "Admin commandes" on orders
  for all using (auth.role() = 'authenticated');

-- ─── FUNCTION UPDATED_AT AUTO ───
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_products
  before update on products
  for each row execute function update_updated_at();

create trigger set_updated_at_orders
  before update on orders
  for each row execute function update_updated_at();
