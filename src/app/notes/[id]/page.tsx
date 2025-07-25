"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function NoteDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNote() {
      setLoading(true);
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", id)
        .single();
      setNote(data);
      setLoading(false);
    }
    if (id) fetchNote();
  }, [id]);

  if (loading) return (
    <div className="w-full flex justify-center items-center py-12">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!note) return <div className="p-8 text-center text-gray-500">Not bulunamadı.</div>;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white rounded-xl shadow border p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{note.subject}</span>
          <span className="ml-auto text-xs text-gray-400">{note.created_at ? new Date(note.created_at).toLocaleDateString("tr-TR") : ""}</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">{note.title}</h1>
        <div className="text-gray-700 mb-4 whitespace-pre-line">{note.content}</div>
        <div className="flex gap-4 mt-6">
          <button className="text-blue-600 underline">Düzenle</button>
          <button className="text-red-600 underline">Sil</button>
          <button className="ml-auto text-gray-500 underline" onClick={() => router.back()}>Geri Dön</button>
        </div>
      </div>
    </div>
  );
} 