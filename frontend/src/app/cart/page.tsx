import Cart from "@/components/Cart";
import Header from "@/components/Header";

export default function CartPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Cart />
      </main>
    </div>
  );
}
