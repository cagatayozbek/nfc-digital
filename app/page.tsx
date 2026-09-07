import Link from 'next/link';
import { getBusinesses } from '../lib/businesses';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const businesses = await getBusinesses();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-white text-black font-sans selection:bg-black selection:text-white">
      <div className="max-w-md w-full p-8 border border-black text-center">
        <h1 className="text-2xl font-bold mb-4 uppercase tracking-widest">NFC Digital</h1>
        <p className="mb-10 text-sm font-light tracking-wide text-gray-600">
          Dijital kartvizit platformu. Lütfen profil seçin.
        </p>

        <div className="text-left">
          {businesses.length === 0 ? (
            <p className="text-sm text-gray-400 text-center">Henüz profil eklenmemiş.</p>
          ) : (
            <ul className="space-y-3">
              {businesses.map((b) => (
                <li key={b.slug}>
                  <Link
                    href={`/${b.slug}`}
                    className="group flex items-center justify-between p-4 border border-black bg-transparent hover:bg-black hover:text-white transition-colors duration-200"
                  >
                    <span className="font-medium text-sm uppercase tracking-widest">{b.name}</span>
                    <span className="text-black group-hover:text-white transition-colors duration-200">↗</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Gizli Admin Linki */}
        <div className="mt-12 pt-6 border-t border-gray-100">
          <Link href="/admin" className="text-xs text-gray-300 hover:text-gray-500 transition-colors uppercase tracking-widest">
            Yönetim Paneli
          </Link>
        </div>
      </div>
    </main>
  );
}
