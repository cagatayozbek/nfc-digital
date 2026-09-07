import Link from 'next/link';
import { getBusinesses } from '../../lib/businesses';
import { DeleteButton } from './DeleteButton';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const businesses = await getBusinesses();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-white text-black font-sans">
      <div className="max-w-2xl w-full p-8 border border-black">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-widest">Yönetim Paneli</h1>
          <Link
            href="/add"
            className="text-sm border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors uppercase tracking-widest"
          >
            + Yeni Ekle
          </Link>
        </div>

        {businesses.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Henüz profil eklenmemiş.</p>
        ) : (
          <ul className="space-y-3">
            {businesses.map((b) => (
              <li key={b.slug} className="flex items-center justify-between p-4 border border-black">
                <div>
                  <p className="font-medium text-sm uppercase tracking-wider">{b.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">/{b.slug}</p>
                </div>
                <div className="flex gap-2">
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
                  <DeleteButton slug={b.slug} name={b.name} />
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest">
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </main>
  );
}
