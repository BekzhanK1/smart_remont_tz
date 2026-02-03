import type { Metadata } from "next";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import Notifications from "@/components/Notifications";
import CompareBar from "@/components/CompareBar";

export const metadata: Metadata = {
  title: "Каталог товаров",
  description: "Интерактивный каталог товаров с корзиной",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="min-h-screen antialiased">
        {children}
        <Notifications />
        <CompareBar />
      </body>
    </html>
  );
}
