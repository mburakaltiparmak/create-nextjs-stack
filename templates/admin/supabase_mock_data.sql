-- Mock Data Script for Admin Panel
-- Run this script in the Supabase SQL Editor to populate your tables with test data.

-- 1. Insert Users
-- Note: These users won't have login credentials in auth.users, they are just profile records.
INSERT INTO public.users (email, full_name, role) VALUES
('admin@example.com', 'Test Admin User', 'admin'),
('editor1@example.com', 'Test Editor One', 'editor'),
('editor2@example.com', 'Test Editor Two', 'editor');

-- 2. Insert Categories
INSERT INTO public.categories (title, slug, description, featured, published) VALUES
('Test Category 1', 'test-category-1', 'Description for Test Category 1', true, true),
('Test Category 2', 'test-category-2', 'Description for Test Category 2', false, true),
('Test Category 3', 'test-category-3', 'Description for Test Category 3', true, true),
('Test Category 4', 'test-category-4', 'Description for Test Category 4', false, false),
('Test Category 5', 'test-category-5', 'Description for Test Category 5', false, true);

-- 3. Insert Clients
INSERT INTO public.clients (name, logo_url, website) VALUES
('Test Client 1', 'https://picsum.photos/200/200?random=1', 'https://example.com/client1'),
('Test Client 2', 'https://picsum.photos/200/200?random=2', 'https://example.com/client2'),
('Test Client 3', 'https://picsum.photos/200/200?random=3', 'https://example.com/client3'),
('Test Client 4', 'https://picsum.photos/200/200?random=4', 'https://example.com/client4'),
('Test Client 5', 'https://picsum.photos/200/200?random=5', 'https://example.com/client5');

-- 4. Insert Products (Assigning to randomly selected Categories)
WITH cat_ids AS (
    SELECT id, row_number() OVER () as rn FROM public.categories
)
INSERT INTO public.products (title, slug, description, featured_image_url, category_id, featured, published) VALUES
('Test Product 1', 'test-product-1', 'Description for Test Product 1', 'https://picsum.photos/800/600?random=10', (SELECT id FROM cat_ids WHERE rn = 1), true, true),
('Test Product 2', 'test-product-2', 'Description for Test Product 2', 'https://picsum.photos/800/600?random=11', (SELECT id FROM cat_ids WHERE rn = 2), false, true),
('Test Product 3', 'test-product-3', 'Description for Test Product 3', 'https://picsum.photos/800/600?random=12', (SELECT id FROM cat_ids WHERE rn = 3), true, true),
('Test Product 4', 'test-product-4', 'Description for Test Product 4', 'https://picsum.photos/800/600?random=13', (SELECT id FROM cat_ids WHERE rn = 4), false, false),
('Test Product 5', 'test-product-5', 'Description for Test Product 5', 'https://picsum.photos/800/600?random=14', (SELECT id FROM cat_ids WHERE rn = 5), true, true),
('Test Product 6', 'test-product-6', 'Description for Test Product 6', 'https://picsum.photos/800/600?random=15', (SELECT id FROM cat_ids WHERE rn = 1), false, true),
('Test Product 7', 'test-product-7', 'Description for Test Product 7', 'https://picsum.photos/800/600?random=16', (SELECT id FROM cat_ids WHERE rn = 2), true, true),
('Test Product 8', 'test-product-8', 'Description for Test Product 8', 'https://picsum.photos/800/600?random=17', (SELECT id FROM cat_ids WHERE rn = 3), false, true),
('Test Product 9', 'test-product-9', 'Description for Test Product 9', 'https://picsum.photos/800/600?random=18', (SELECT id FROM cat_ids WHERE rn = 4), true, true),
('Test Product 10', 'test-product-10', 'Description for Test Product 10', 'https://picsum.photos/800/600?random=19', (SELECT id FROM cat_ids WHERE rn = 5), false, true);

-- 5. Insert Projects (Assigning to randomly selected Clients)
WITH client_ids AS (
    SELECT id, row_number() OVER () as rn FROM public.clients
)
INSERT INTO public.projects (title, slug, description, featured_image_url, client_id, published) VALUES
('Test Project 1', 'test-project-1', 'Description for Test Project 1', 'https://picsum.photos/800/600?random=30', (SELECT id FROM client_ids WHERE rn = 1), true),
('Test Project 2', 'test-project-2', 'Description for Test Project 2', 'https://picsum.photos/800/600?random=31', (SELECT id FROM client_ids WHERE rn = 2), true),
('Test Project 3', 'test-project-3', 'Description for Test Project 3', 'https://picsum.photos/800/600?random=32', (SELECT id FROM client_ids WHERE rn = 3), true),
('Test Project 4', 'test-project-4', 'Description for Test Project 4', 'https://picsum.photos/800/600?random=33', (SELECT id FROM client_ids WHERE rn = 4), false),
('Test Project 5', 'test-project-5', 'Description for Test Project 5', 'https://picsum.photos/800/600?random=34', (SELECT id FROM client_ids WHERE rn = 5), true),
('Test Project 6', 'test-project-6', 'Description for Test Project 6', 'https://picsum.photos/800/600?random=35', (SELECT id FROM client_ids WHERE rn = 1), true),
('Test Project 7', 'test-project-7', 'Description for Test Project 7', 'https://picsum.photos/800/600?random=36', (SELECT id FROM client_ids WHERE rn = 2), true),
('Test Project 8', 'test-project-8', 'Description for Test Project 8', 'https://picsum.photos/800/600?random=37', (SELECT id FROM client_ids WHERE rn = 3), true),
('Test Project 9', 'test-project-9', 'Description for Test Project 9', 'https://picsum.photos/800/600?random=38', (SELECT id FROM client_ids WHERE rn = 4), true),
('Test Project 10', 'test-project-10', 'Description for Test Project 10', 'https://picsum.photos/800/600?random=39', (SELECT id FROM client_ids WHERE rn = 5), true);
