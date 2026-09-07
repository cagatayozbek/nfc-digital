"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({ slug, name }: { slug: string; name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`"${name}" profilini silmek istediğinizden emin misiniz?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/businesses/${slug}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Silinemedi');
      router.refresh();
    } catch (err: any) {
      alert('Hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs border border-red-400 text-red-500 px-3 py-1 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
    >
      {loading ? "..." : "Sil"}
    </button>
  );
}
