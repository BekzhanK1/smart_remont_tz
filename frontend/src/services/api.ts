import axios, { type AxiosInstance } from "axios";
import type {
  ProductDetail,
  ProductsResponse,
  CartResponse,
  FilterState,
  User,
  TokenResponse,
} from "@/types";
import { getOrCreateSessionId, getAuthToken } from "@/utils/helpers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function createClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
  });

  client.interceptors.request.use((config) => {
    if (typeof window === "undefined") return config;
    config.headers["X-Session-ID"] = getOrCreateSessionId();
    const token = getAuthToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  return client;
}

const api = createClient();

export async function authLogin(email: string, password: string): Promise<TokenResponse> {
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", password);
  const { data } = await api.post<TokenResponse>("/api/auth/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data;
}

export async function authRegister(email: string, password: string): Promise<User> {
  const { data } = await api.post<User>("/api/auth/register", { email, password });
  return data;
}

export async function authMe(): Promise<User> {
  const { data } = await api.get<User>("/api/auth/me");
  return data;
}

export async function fetchProducts(
  params: Partial<FilterState> = {}
): Promise<ProductsResponse> {
  const { data } = await api.get<ProductsResponse>("/api/products/", { params });
  return data;
}

export async function fetchProduct(id: number): Promise<ProductDetail> {
  const { data } = await api.get<ProductDetail>(`/api/products/${id}/`);
  return data;
}

export async function fetchCart(): Promise<CartResponse> {
  const { data } = await api.get<CartResponse>("/api/cart/");
  return data;
}

export async function addToCart(productId: number, quantity: number): Promise<CartResponse> {
  const { data } = await api.post<CartResponse>("/api/cart/", {
    product_id: productId,
    quantity,
  });
  return data;
}

export async function updateCartItem(
  itemId: number,
  quantity: number
): Promise<CartResponse> {
  const { data } = await api.put<CartResponse>(`/api/cart/${itemId}/`, { quantity });
  return data;
}

export async function removeCartItem(itemId: number): Promise<CartResponse> {
  const { data } = await api.delete<CartResponse>(`/api/cart/${itemId}/`);
  return data;
}
