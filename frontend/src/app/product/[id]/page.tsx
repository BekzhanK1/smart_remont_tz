import Link from "next/link";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import { fetchProduct } from "@/services/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const productId = parseInt(id, 10);
  if (Number.isNaN(productId)) notFound();
  let product;
  try {
    product = await fetchProduct(productId);
  } catch {
    notFound();
  }
  if (!product) notFound();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-slate-600 hover:text-slate-900">
            ← В каталог
          </Link>
          <Link
            href="/cart"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Корзина
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <ProductDetail product={product} />
      </main>
    </div>
  );
}
