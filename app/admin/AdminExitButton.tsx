"use client";

import { useRouter } from "next/navigation";

export default function AdminExitButton() {
  const router = useRouter();

  function handleExit() {
    document.cookie = "admin_verified=; path=/; max-age=0; SameSite=Strict";
    router.push("/");
  }

  return (
    <button
      onClick={handleExit}
      className="flex items-center px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors w-full text-left"
    >
      ← アプリに戻る
    </button>
  );
}
