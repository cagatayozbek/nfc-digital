import Link from "next/link";
import { getBusinesses } from "../../lib/businesses";
import { AdminClient } from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const businesses = await getBusinesses();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-white text-black font-sans">
      <div className="max-w-2xl w-full p-8 border border-black">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-widest">
            Yönetim Paneli
          </h1>
          <Link
            href="/add"
            className="text-sm border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors uppercase tracking-widest text-center"
          >
            + Yeni Ekle
          </Link>
        </div>

        <AdminClient
          businesses={businesses.map((b) => ({ slug: b.slug, name: b.name }))}
        />

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
          >
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </main>
  );
}
