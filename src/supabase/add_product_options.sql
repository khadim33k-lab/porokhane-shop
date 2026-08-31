-- Porokhane Shop — options facultatives par produit
-- À exécuter une seule fois dans Supabase > SQL Editor.

alter table public.products
  add column if not exists option_enabled boolean not null default false,
  add column if not exists option_name text,
  add column if not exists option_values text;

comment on column public.products.option_enabled is 'Active le choix obligatoire d’une option sur la fiche produit';
comment on column public.products.option_name is 'Nom affiché au client, par exemple Taille';
comment on column public.products.option_values is 'Valeurs séparées par ·, virgule, point-virgule ou retour à la ligne';
