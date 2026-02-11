// Database Row Types
export interface Category {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  image_url: string | null;
  published: boolean;
  featured: boolean;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  category_id: string;
  featured_image_url: string | null;
  gallery_images: string[];
  width: number | null;
  height: number | null;
  thickness: number | null;
  material: string | null;
  surface_finish: string | null;
  fire_rating: string | null;
  weight_per_sqm: number | null;
  available_colors: string | null;
  installation_method: string | null;
  certifications: string | null;
  additional_features: string | null;
  meta_description: string | null;
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  website: string | null;
  logo_url: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  location: string | null;
  year: number;
  client_name: string | null;
  featured_image_url: string | null;
  gallery_images: string[];
  product_ids: string[];
  meta_description: string | null;
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

// Extended Types with Relations
export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

export interface ProductWithCategory extends Product {
  category: Category | null;
}

export interface ProjectWithProducts extends Project {
  products: Product[];
}

// Database Type (for Supabase client)
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>;
      };
      clients: {
        Row: Client;
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
