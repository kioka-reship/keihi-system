"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface Props {
  onImageSelect: (base64: string, mediaType: string, preview: string) => void;
}

const MAX_PX = 1920;
const JPEG_QUALITY = 0.85;

// Canvas経由でJPEGに変換してbase64を返す（HEIC等の非対応形式・大きすぎる画像も正規化）
function normalizeImageToJpeg(file: File): Promise<{ base64: string; preview: string }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > MAX_PX || height > MAX_PX) {
        if (width > height) {
          height = Math.round((height * MAX_PX) / width);
          width = MAX_PX;
        } else {
          width = Math.round((width * MAX_PX) / height);
          height = MAX_PX;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas取得失敗"));

      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
      const base64 = dataUrl.split(",")[1];
      resolve({ base64, preview: dataUrl });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("画像の読み込みに失敗しました"));
    };

    img.src = objectUrl;
  });
}

export default function ReceiptUploader({ onImageSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setProcessing(true);
    try {
      const { base64, preview: dataUrl } = await normalizeImageToJpeg(file);
      setPreview(dataUrl);
      onImageSelect(base64, "image/jpeg", dataUrl);
    } catch {
      alert("画像の処理に失敗しました。別の画像をお試しください。");
    } finally {
      setProcessing(false);
    }
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
        } ${processing ? "opacity-50 pointer-events-none" : ""}`}
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
          <div className="text-3xl">{processing ? "⏳" : "📷"}</div>
          <p className="font-medium text-sm">
            {processing ? "画像を処理中…" : "レシート画像をアップロード"}
          </p>
          <p className="text-xs text-gray-400">クリックまたはドラッグ＆ドロップ</p>
          <p className="text-xs text-gray-400">JPG・PNG・WebP・HEIC対応</p>
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
