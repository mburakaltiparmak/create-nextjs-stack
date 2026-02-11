export interface ResourceConfig {
  name: string;
  singular: string;
  plural: string;
  icon: string;
  path: string;
  table: string;
  fields: ResourceField[];
}

export interface ResourceField {
  name: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "boolean"
    | "select"
    | "image"
    | "date";
  label: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  relation?: {
    table: string;
    display: string;
  };
}

export const resources: ResourceConfig[] = [
  {
    name: "categories",
    singular: "Category",
    plural: "Categories",
    icon: "Layers",
    path: "/categories",
    table: "categories",
    fields: [
      { name: "title", type: "text", label: "Title", required: true },
      { name: "slug", type: "text", label: "Slug", required: true },
      { name: "description", type: "textarea", label: "Description" },
      { name: "featured", type: "boolean", label: "Featured" },
      { name: "published", type: "boolean", label: "Published" },
    ],
  },
  {
    name: "clients",
    singular: "Client",
    plural: "Clients",
    icon: "Users",
    path: "/clients",
    table: "clients",
    fields: [
      { name: "name", type: "text", label: "Name", required: true },
      { name: "logo_url", type: "image", label: "Logo" },
      { name: "website", type: "text", label: "Website" },
    ],
  },
  {
    name: "products",
    singular: "Product",
    plural: "Products",
    icon: "Package",
    path: "/products",
    table: "products",
    fields: [
      { name: "title", type: "text", label: "Title", required: true },
      { name: "slug", type: "text", label: "Slug", required: true },
      { name: "description", type: "textarea", label: "Description" },
      { name: "featured_image_url", type: "image", label: "Featured Image" },
      {
        name: "category_id",
        type: "select",
        label: "Category",
        relation: { table: "categories", display: "title" },
      },
      { name: "featured", type: "boolean", label: "Featured" },
      { name: "published", type: "boolean", label: "Published" },
    ],
  },
  {
    name: "projects",
    singular: "Project",
    plural: "Projects",
    icon: "Briefcase",
    path: "/projects",
    table: "projects",
    fields: [
      { name: "title", type: "text", label: "Title", required: true },
      { name: "slug", type: "text", label: "Slug", required: true },
      { name: "description", type: "textarea", label: "Description" },
      {
        name: "client_id",
        type: "select",
        label: "Client",
        relation: { table: "clients", display: "name" },
      },
      { name: "featured_image_url", type: "image", label: "Featured Image" },
      { name: "published", type: "boolean", label: "Published" },
    ],
  },
  {
    name: "users",
    singular: "User",
    plural: "Users",
    icon: "Settings",
    path: "/users",
    table: "users",
    fields: [
      { name: "email", type: "text", label: "Email", required: true },
      { name: "full_name", type: "text", label: "Full Name" },
      {
        name: "role",
        type: "select",
        label: "Role",
        options: [
          { value: "admin", label: "Admin" },
          { value: "editor", label: "Editor" },
        ],
      },
    ],
  },
];
