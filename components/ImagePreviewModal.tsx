"use client";

import { useEffect } from "react";
import Image from "next/image";

interface Props {
  src: string;
  alt?: string;
  onClose: () => void;
}

export default function ImagePreviewModal({ src, alt = "レシート", onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      {/* 閉じるボタン */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="閉じる"
      >
        ✕
      </button>

      {/* 画像 */}
      <div
        className="relative max-w-2xl w-full max-h-[85vh] flex items-center justify-center"
        onClick={e => e.stopPropagation()}
      >
        <Image
          src={src}
          alt={alt}
          width={800}
          height={1200}
          className="object-contain max-h-[85vh] w-auto rounded-xl shadow-2xl"
          unoptimized
        />
      </div>
    </div>
  );
}
