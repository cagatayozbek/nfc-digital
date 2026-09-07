"use client";

import Link from "next/link";
import { useState } from "react";
import { QRModal } from "../../components/QRModal";

interface Business {
  slug: string;
  name: string;
}

interface AnalyticsBreakdown {
  type: string;
  label: string;
  count: number;
}

interface Analytics {
  total: number;
  breakdown: AnalyticsBreakdown[];
}

export function AdminClient({ businesses }: { businesses: Business[] }) {
  const [qrTarget, setQrTarget] = useState<Business | null>(null);
  const [analytics, setAnalytics] = useState<Record<string, Analytics | null>>(
    {},
  );
  const [loadingAnalytics, setLoadingAnalytics] = useState<string | null>(null);

  const loadAnalytics = async (slug: string) => {
    if (analytics[slug] !== undefined) {
      // Toggle off
      setAnalytics((prev) => ({ ...prev, [slug]: undefined as any }));
      return;
    }
    setLoadingAnalytics(slug);
    try {
      const res = await fetch(`/api/businesses/${slug}/analytics`);
      const data = await res.json();
      setAnalytics((prev) => ({ ...prev, [slug]: data }));
    } catch {
      setAnalytics((prev) => ({ ...prev, [slug]: null }));
    } finally {
      setLoadingAnalytics(null);
    }
  };

  return (
    <>
      {businesses.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          Henüz profil eklenmemiş.
        </p>
      ) : (
        <ul className="space-y-3">
          {businesses.map((b) => (
            <li key={b.slug} className="border border-black">
              {/* Main row */}
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-sm uppercase tracking-wider">
                    {b.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">/{b.slug}</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                  <Link
                    href={`/${b.slug}`}
                    target="_blank"
                    className="text-xs border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors"
                  >
                    Görüntüle
                  </Link>
                  <Link
                    href={`/${b.slug}/edit`}
                    className="text-xs border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors"
                  >
                    Düzenle
                  </Link>
                  <button
                    onClick={() => setQrTarget(b)}
                    className="text-xs border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors"
                  >
                    QR
                  </button>
                  <button
                    onClick={() => loadAnalytics(b.slug)}
                    className="text-xs border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors"
                  >
                    {loadingAnalytics === b.slug
                      ? "..."
                      : analytics[b.slug] !== undefined
                        ? `${analytics[b.slug]?.total ?? 0} tık ▲`
                        : "İstatistik"}
                  </button>
                  <DeleteButtonInline slug={b.slug} name={b.name} />
                </div>
              </div>

              {/* Analytics breakdown */}
              {analytics[b.slug] !== undefined &&
                analytics[b.slug] !== null && (
                  <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                    {analytics[b.slug]!.total === 0 ? (
                      <p className="text-xs text-gray-400">
                        Henüz tıklanma yok.
                      </p>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
                          Toplam: {analytics[b.slug]!.total} tıklanma
                        </p>
                        {analytics[b.slug]!.breakdown.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-gray-600">
                              {item.label || item.type}
                            </span>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-1.5 bg-black rounded-full"
                                style={{
                                  width: `${Math.round((item.count / analytics[b.slug]!.total) * 80)}px`,
                                  minWidth: "4px",
                                }}
                              />
                              <span className="font-medium w-6 text-right">
                                {item.count}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
            </li>
          ))}
        </ul>
      )}

      {/* QR Modal */}
      {qrTarget && (
        <QRModal
          slug={qrTarget.slug}
          name={qrTarget.name}
          onClose={() => setQrTarget(null)}
        />
      )}
    </>
  );
}

function DeleteButtonInline({ slug, name }: { slug: string; name: string }) {
  const handleDelete = async () => {
    if (!confirm(`"${name}" profilini silmek istediğinize emin misiniz?`))
      return;
    await fetch(`/api/businesses/${slug}`, { method: "DELETE" });
    window.location.reload();
  };

  return (
    <button
      onClick={handleDelete}
      className="text-xs border border-red-300 text-red-500 px-3 py-1 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
    >
      Sil
    </button>
  );
}
