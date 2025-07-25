"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function BackButton({ fallbackHref, label = "Geri Dön", className = "", iconOnly = false, iconClassName = "w-5 h-5", iconColorClass, onClick }: { fallbackHref?: string; label?: string; className?: string; iconOnly?: boolean; iconClassName?: string; iconColorClass?: string; onClick?: () => void }) {
  const router = useRouter();

  const handleBack = () => {
    if (onClick) {
      onClick();
    } else if (window.history.length > 1) {
      router.back();
    } else if (fallbackHref) {
      router.push(fallbackHref);
    } else {
      router.push("/");
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center ${iconOnly ? '' : 'gap-2 px-3 py-2 bg-tusai-blue/10 hover:bg-tusai-blue/20 font-medium text-sm'} rounded-lg text-tusai-blue transition ${className}`}
      aria-label={label}
    >
      <ArrowLeftIcon className={iconClassName + ' ' + (iconOnly ? (iconColorClass || 'text-black') : '')} />
      {!iconOnly && <span>{label}</span>}
    </button>
  );
} 