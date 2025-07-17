"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function KayitPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setError("Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.");
      setLoading(false);
      return;
    }
    // Create profile row
    const user = data.user;
    if (user) {
      await supabase.from("profiles").insert({
        id: user.id,
        full_name: fullName,
        is_premium: false,
      });
    }
    setLoading(false);
    router.push("/giris");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-tusai-light dark:bg-tusai-dark">
      <div className="bg-white dark:bg-tusai-dark border border-tusai rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-tusai">Kayıt Ol</h1>
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <label className="font-semibold">Ad Soyad</label>
          <input
            type="text"
            className="input input-bordered border-tusai px-3 py-2 rounded"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
          />
          <label className="font-semibold">E-posta</label>
          <input
            type="email"
            className="input input-bordered border-tusai px-3 py-2 rounded"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
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
            {loading ? "Kayıt Olunuyor..." : "Kayıt Ol"}
          </button>
        </form>
        <div className="text-center mt-4 text-sm">
          Zaten hesabınız var mı? {" "}
          <Link href="/giris" className="text-tusai font-semibold hover:underline">Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
}
  