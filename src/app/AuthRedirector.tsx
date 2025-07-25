"use client";
import { useAuth } from "../lib/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthRedirector({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && user && pathname !== "/dashboard") {
      router.replace("/dashboard");
    }
  }, [user, loading, pathname, router]);

  // Show nothing while loading, and never show children if user is logged in
  if (loading || user) return null;

  return <>{children}</>;
} 