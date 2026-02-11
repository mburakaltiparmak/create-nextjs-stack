-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Categories Table
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  slug text not null unique,
  description text,
  featured boolean default false,
  published boolean default true
);

-- 2. Clients Table
create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  logo_url text,
  website text
);

-- 3. Products Table
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  slug text not null unique,
  description text,
  featured_image_url text,
  category_id uuid references public.categories(id) on delete set null,
  featured boolean default false,
  published boolean default true
);

-- 4. Projects Table
create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  slug text not null unique,
  description text,
  client_id uuid references public.clients(id) on delete set null,
  featured_image_url text,
  published boolean default true
);

-- 5. Users Table (Public Profile / Admin Management)
-- Note: This is separate from auth.users, used for application logic
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text not null unique,
  full_name text,
  role text default 'editor' check (role in ('admin', 'editor'))
);

-- Enable Row Level Security (RLS) on all tables
alter table public.categories enable row level security;
alter table public.clients enable row level security;
alter table public.products enable row level security;
alter table public.projects enable row level security;
alter table public.users enable row level security;

-- Create policies (modify as needed for your auth model)
-- For development/admin, we might want full access for authenticated users

create policy "Enable all access for authenticated users" on public.categories for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on public.clients for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on public.products for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on public.projects for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on public.users for all using (auth.role() = 'authenticated');

-- Function to automatically update updated_at timestamp
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'admin');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
