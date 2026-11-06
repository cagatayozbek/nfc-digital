"use client";

import { useEffect, useRef, useState } from "react";

export const PROFILE_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";

export function useImagePreview(file: File | null, savedUrl: string) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!file) {
      setUrl("");
      return;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return file ? url : savedUrl;
}

export function BannerInput({
  label,
  url,
  onChange,
  onRemove,
}: {
  label: string;
  url: string;
  onChange: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label}
        <input
          ref={inputRef}
          type="file"
          accept={PROFILE_IMAGE_TYPES}
          className="mt-1 w-full border border-black p-2 bg-transparent text-sm"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (
              !PROFILE_IMAGE_TYPES.split(",").includes(file.type) ||
              file.size > 5 * 1024 * 1024
            ) {
              setError("En fazla 5 MB JPG, PNG, WebP veya GIF seçin.");
              event.target.value = "";
              return;
            }
            setError("");
            onChange(file);
          }}
        />
      </label>
      {error && (
        <p className="text-xs text-red-600 mt-1" role="alert">
          {error}
        </p>
      )}
      {url && (
        <button
          className="text-xs underline mt-1"
          type="button"
          onClick={() => {
            if (inputRef.current) inputRef.current.value = "";
            setError("");
            onRemove();
          }}
        >
          Görseli kaldır
        </button>
      )}
    </div>
  );
}
