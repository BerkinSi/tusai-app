"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function GirisPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-tusai-light dark:bg-tusai-dark">
      <div className="bg-white dark:bg-tusai-dark border border-tusai rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-tusai">Giriş Yap</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <label className="font-semibold">E-posta</label>
          <input
            type="email"
            className="input input-bordered border-tusai px-3 py-2 rounded"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
          <label className="font-semibold">Şifre</label>
          <input
            type="password"
            className="input input-bordered border-tusai px-3 py-2 rounded"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            className="bg-tusai text-white font-semibold py-2 rounded hover:bg-tusai-accent transition mt-2"
            disabled={loading}
          >
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
        <div className="text-center mt-4 text-sm">
          Hesabınız yok mu? {" "}
          <Link href="/kayit" className="text-tusai font-semibold hover:underline">Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
}
  