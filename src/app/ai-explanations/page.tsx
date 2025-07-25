"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../lib/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";
import BackButton from '../../components/BackButton';

export default function AIExplanationsListPage() {
  const { user, authState } = useAuth();
  const [explanations, setExplanations] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [loadingExplanations, setLoadingExplanations] = useState(true); // Start as true

  const loadExplanations = async () => {
    if (!user?.id) {
      setLoadingExplanations(false);
      return;
    }
    setLoadingExplanations(true);
    try {
      let query = supabase.from("ai_explanations").select("*").eq("user_id", user.id);
      const { data, error } = await query;
      if (error) {
        console.error('Error fetching explanations:', error);
        setExplanations([]);
      } else {
        setExplanations(data || []);
      }
    } catch (error) {
      console.error('Error fetching explanations:', error);
      setExplanations([]);
    } finally {
      setLoadingExplanations(false);
    }
  };

  // Initial load only when auth is done and user is available
  useEffect(() => {
    // Only load when auth is done and we have a user
    if (authState === 'authenticated' && user?.id) {
      loadExplanations();
    } else if (authState === 'unauthenticated') {
      // If auth is done loading but no user, stop loading
      setLoadingExplanations(false);
    }
  }, [user, authState]);

  // Timeout fallback for stuck loading spinner
  useEffect(() => {
    if (loadingExplanations) {
      const timeout = setTimeout(() => setLoadingExplanations(false), 10000); // 10 seconds
      return () => clearTimeout(timeout);
    }
  }, [loadingExplanations]);

  const subjects = Array.from(new Set(explanations.map(n => n.subject).filter(Boolean)));

  let filtered = explanations;
  if (subjectFilter) filtered = filtered.filter(n => n.subject === subjectFilter);
  filtered = filtered.sort((a, b) => {
    if (sortBy === "date") {
      const cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    }
    return 0;
  });

  if (authState === 'loading' || loadingExplanations) return (
    <div className="w-full flex justify-center items-center py-12">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!user) return <div className="p-8 text-center">Giriş yapmalısınız.</div>;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-10 flex flex-col gap-8">
      <div className="flex items-center gap-2 mb-2">
        <BackButton iconOnly iconClassName="w-6 h-6" iconColorClass="text-black" className="p-0 bg-transparent hover:bg-tusai-blue/10" label="Geri Dön" />
        <h1 className="text-2xl font-bold text-tusai">Tüm AI Açıklamalarım</h1>
      </div>
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="border rounded px-2 py-1 text-sm">
          <option value="">Konu</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border rounded px-2 py-1 text-sm">
          <option value="date">Tarih</option>
        </select>
        <select value={sortDir} onChange={e => setSortDir(e.target.value as "asc" | "desc")} className="border rounded px-2 py-1 text-sm">
          <option value="desc">Azalan</option>
          <option value="asc">Artan</option>
        </select>
      </div>
      <div className="bg-white rounded-xl shadow border p-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-700 border-b">
              <th className="py-2 px-2 text-left">Konu</th>
              <th className="py-2 px-2 text-left">Başlık</th>
              <th className="py-2 px-2 text-left">Tarih</th>
              <th className="py-2 px-2 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400">Kayıt bulunamadı.</td></tr>
            ) : (
              filtered.map(explanation => (
                <tr key={explanation.id} className="border-b last:border-0">
                  <td className="py-2 px-2">{explanation.subject}</td>
                  <td className="py-2 px-2">
                    <Link href={`/ai-explanations/${explanation.id}`} className="font-semibold text-purple-700 hover:underline">{explanation.title}</Link>
                  </td>
                  <td className="py-2 px-2">{explanation.created_at ? new Date(explanation.created_at).toLocaleDateString("tr-TR") : ""}</td>
                  <td className="py-2 px-2">
                    <Link href={`/ai-explanations/${explanation.id}`} className="text-xs text-blue-600 underline">Detay</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 