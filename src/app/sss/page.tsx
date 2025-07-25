"use client";
import React, { useState } from "react";
import BackButton from '../../components/BackButton';

const FAQ_DATA = [
  {
    category: "📚 Genel Sorular",
    questions: [
      {
        q: "TusAI nedir?",
        a: "TusAI, Tıpta Uzmanlık Sınavı (TUS) için yapay zeka destekli, interaktif bir quiz platformudur. Sınav tipi soruları ve yapay zekâ tarafından oluşturulan soruları kullanarak kişiselleştirilmiş testler sunar."
      },
      {
        q: "Platformdaki sorular nasıl hazırlanıyor?",
        a: "Sınav Tipi TUS soruları, geçmiş sorulara benzeyen AI üretimi sorular ve tamamen yeni AI sorularıyla hazırlanır."
      },
      {
        q: "TusAI'de hangi dersler kapsanıyor?",
        a: "Temel bilimler ve klinik bilimler dahil olmak üzere TUS kapsamındaki tüm dersler."
      }
    ]
  },
  {
    category: "💳 Üyelik ve Ücretlendirme",
    questions: [
      {
        q: "TusAI kullanımı ücretsiz mi?",
        a: "Evet. Ücretsiz üyelikle günde 1 quiz çözebilirsiniz."
      },
      {
        q: "Pro üyelik neler sunar?",
        a: "Günde 5 quiz, açıklamalı sorular, PDF çıktısı ve geçmişe erişim."
      },
      {
        q: "Pro üyelik ücretli mi?",
        a: "Aylık ₺99 veya 3 aylık ₺250 ücretlidir."
      }
    ]
  },
  {
    category: "🤖 Yapay Zeka Hakkında",
    questions: [
      {
        q: "Yapay zeka nasıl çalışıyor?",
        a: "AI, geçmiş performansa göre kişiselleştirilmiş sorular ve açıklamalar sunar."
      },
      {
        q: "AI'nin oluşturduğu sorular güvenilir mi?",
        a: "Evet, geçmiş TUS yapısına uygun şekilde üretilir."
      },
      {
        q: "Açıklamalar AI tarafından mı yazılıyor?",
        a: "Evet, açıklamalar yapay zekâ tarafından oluşturulmaktadır."
      }
    ]
  },
  {
    category: "📱 Teknik ve Kullanım Soruları",
    questions: [
      {
        q: "Nasıl kayıt olabilirim?",
        a: "Google hesabınızla ya da aktif kullandığınız bir e-posta  hızlıca kayıt olabilirsiniz."
      },
      {
        q: "Mobilde kullanılabilir mi?",
        a: "Evet, TusAI mobil tarayıcılarla uyumludur."
      },
      {
        q: "Verilerim güvende mi?",
        a: "Evet, Supabase altyapısıyla güvenli şekilde saklanır."
      },
      {
        q: "Destek nasıl alırım?",
        a: "support@tusai.app adresine e-posta atabilirsiniz."
      }
    ]
  }
];

function Accordion({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        className="w-full flex justify-between items-center py-4 text-left focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="font-medium text-gray-900 dark:text-white">{question}</span>
        <span className="ml-2 text-gray-400">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="pb-4 text-gray-700 dark:text-gray-300 text-sm pl-1 pr-2">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function SSSPage() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12 flex flex-col gap-10">
      <BackButton className="mb-4" />
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-blue-600 mb-8">Sıkça Sorulan Sorular (SSS)</h1>
      {FAQ_DATA.map((group) => (
        <section key={group.category} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">{group.category}</h2>
          <div>
            {group.questions.map((item) => (
              <Accordion key={item.q} question={item.q} answer={item.a} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
} 