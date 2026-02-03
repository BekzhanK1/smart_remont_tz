"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { authRegister, authLogin } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { setAuthToken } from "@/utils/helpers";

export default function RegisterPage() {
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Введите email");
      return;
    }
    if (password.length < 6) {
      toast.error("Пароль не менее 6 символов");
      return;
    }
    if (password !== confirm) {
      toast.error("Пароли не совпадают");
      return;
    }
    setLoading(true);
    try {
      await authRegister(email.trim(), password);
      const data = await authLogin(email.trim(), password);
      setAuthToken(data.access_token);
      setToken(data.access_token);
      await useAuthStore.getState().loadUser();
      toast.success("Регистрация выполнена");
      router.push("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка регистрации";
      toast.error(msg.includes("already") ? "Такой email уже зарегистрирован" : "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <Link href="/" className="text-slate-600 hover:text-slate-900">
            ← В каталог
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Регистрация</h1>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Пароль (не менее 6 символов)
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-slate-700">
                Повторите пароль
              </label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-800 py-2.5 font-medium text-white hover:bg-slate-700 disabled:opacity-60"
            >
              {loading ? "Регистрация…" : "Зарегистрироваться"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-600">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="font-medium text-slate-800 hover:underline">
              Войти
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
