"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function AIExplanationDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [explanation, setExplanation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExplanation() {
      setLoading(true);
      const { data, error } = await supabase
        .from("ai_explanations")
        .select("*")
        .eq("id", id)
        .single();
      setExplanation(data);
      setLoading(false);
    }
    if (id) fetchExplanation();
  }, [id]);

  if (loading) return (
    <div className="w-full flex justify-center items-center py-12">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!explanation) return <div className="p-8 text-center text-gray-500">Açıklama bulunamadı.</div>;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white rounded-xl shadow border p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">{explanation.subject}</span>
          <span className="ml-auto text-xs text-gray-400">{explanation.created_at ? new Date(explanation.created_at).toLocaleDateString("tr-TR") : ""}</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">{explanation.title}</h1>
        <div className="text-gray-700 mb-4 whitespace-pre-line">{explanation.content}</div>
        {explanation.related_question && (
          <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-4">
            <div className="text-xs text-gray-500 mb-1">İlgili Soru:</div>
            <div className="text-gray-800">{explanation.related_question}</div>
          </div>
        )}
        <div className="flex gap-4 mt-6">
          <button className="ml-auto text-gray-500 underline" onClick={() => router.back()}>Geri Dön</button>
        </div>
      </div>
    </div>
  );
} 