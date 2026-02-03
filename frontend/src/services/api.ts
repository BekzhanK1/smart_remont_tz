import type {
  ProductDetail,
  ProductsResponse,
  CartResponse,
  FilterState,
} from "@/types";
import { getOrCreateSessionId } from "@/utils/helpers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getSessionId(): string {
  return getOrCreateSessionId();
}

function headers(): HeadersInit {
  const h: HeadersInit = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    (h as Record<string, string>)["X-Session-ID"] = getSessionId();
  }
  return h;
}

export async function fetchProducts(
  params: Partial<FilterState> = {}
): Promise<ProductsResponse> {
  const searchParams = new URLSearchParams();
  if (params.limit != null) searchParams.set("limit", String(params.limit));
  if (params.offset != null) searchParams.set("offset", String(params.offset));
  if (params.category) searchParams.set("category", params.category);
  if (params.min_price) searchParams.set("min_price", params.min_price);
  if (params.max_price) searchParams.set("max_price", params.max_price);
  if (params.search) searchParams.set("search", params.search);
  if (params.sort_by) searchParams.set("sort_by", params.sort_by);
  if (params.sort_order) searchParams.set("sort_order", params.sort_order);

  const res = await fetch(`${API_URL}/api/products/?${searchParams}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchProduct(id: number): Promise<ProductDetail> {
  const res = await fetch(`${API_URL}/api/products/${id}/`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchCart(): Promise<CartResponse> {
  const res = await fetch(`${API_URL}/api/cart/`, { headers: headers() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function addToCart(productId: number, quantity: number): Promise<CartResponse> {
  const res = await fetch(`${API_URL}/api/cart/`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ product_id: productId, quantity }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateCartItem(
  itemId: number,
  quantity: number
): Promise<CartResponse> {
  const res = await fetch(`${API_URL}/api/cart/${itemId}/`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function removeCartItem(itemId: number): Promise<CartResponse> {
  const res = await fetch(`${API_URL}/api/cart/${itemId}/`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
