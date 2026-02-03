export interface Product {
  id: number;
  name: string;
  price: number;
  image: string | null;
  category: string;
}

export interface ProductDetail extends Product {
  description: string | null;
}

export interface ProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  product_image: string | null;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  id: number;
  items: CartItem[];
  total: number;
}

export interface FilterState {
  category: string;
  min_price: string;
  max_price: string;
  search: string;
  sort_by: "id" | "name" | "price";
  sort_order: "asc" | "desc";
  limit: number;
  offset: number;
}

export interface User {
  id: number;
  email: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}
