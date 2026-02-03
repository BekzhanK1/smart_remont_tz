import Link from "next/link";
import Cart from "@/components/Cart";

export default function CartPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-slate-600 hover:text-slate-900">
            ← В каталог
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Cart />
      </main>
    </div>
  );
}
