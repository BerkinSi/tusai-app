"use client";
import { useAuth } from "./AuthContext";
import { useState } from "react";
import Link from "next/link";

interface FeatureGateProps {
  premium?: boolean;
  children: React.ReactNode;
}

export default function FeatureGate({ premium, children }: FeatureGateProps) {
  const { profile, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);

  if (loading) return null;

  if (premium && !profile?.is_premium) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="bg-tusai text-white px-4 py-2 rounded hover:bg-tusai-accent transition"
        >
          Premium Özellik – Yükselt
        </button>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-tusai-dark p-8 rounded-lg shadow-lg max-w-sm w-full text-center">
              <h2 className="text-xl font-bold mb-2 text-tusai">Premium Gerekli</h2>
              <p className="mb-4">Bu özelliği kullanmak için Premium üyelik gereklidir.</p>
              <Link
                href="/pricing"
                className="bg-tusai-accent text-white px-4 py-2 rounded font-semibold hover:bg-tusai transition"
              >
                Premium’a Geç
              </Link>
              <button
                onClick={() => setShowModal(false)}
                className="block mt-4 text-tusai underline mx-auto"
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
} 