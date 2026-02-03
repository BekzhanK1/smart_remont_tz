import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import Header from "@/components/Header";
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
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <ProductDetail product={product} />
      </main>
    </div>
  );
}
