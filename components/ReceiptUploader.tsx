"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface Props {
  onImageSelect: (base64: string, mediaType: string, preview: string) => void;
}

export default function ReceiptUploader({ onImageSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const base64 = dataUrl.split(",")[1];
      const mediaType = file.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif";
      setPreview(dataUrl);
      onImageSelect(base64, mediaType, dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleChange}
        />
        <div className="text-gray-500 space-y-1">
          <div className="text-3xl">📷</div>
          <p className="font-medium text-sm">レシート画像をアップロード</p>
          <p className="text-xs text-gray-400">クリックまたはドラッグ＆ドロップ</p>
          <p className="text-xs text-gray-400">JPG・PNG・WebP対応</p>
        </div>
      </div>

      {preview && (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <Image
            src={preview}
            alt="レシートプレビュー"
            width={600}
            height={400}
            className="w-full max-h-64 object-contain"
            unoptimized
          />
          <button
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow text-gray-500 hover:text-red-500 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              setPreview(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
