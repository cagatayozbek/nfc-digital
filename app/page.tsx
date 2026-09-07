import Link from "next/link";
import { businesses } from "../data/businesses";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50 text-gray-900">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
        <h1 className="text-4xl font-extrabold mb-4 text-blue-600">
          NFC Digital
        </h1>
        <p className="mb-8 text-gray-600">
          Dijital kartvizit ve işletme profil platformu. Lütfen bir profil seçin
          veya NFC kartınızı okutun.
        </p>

        <div className="text-left">
          <h2 className="text-lg font-bold mb-4 border-b pb-2">
            Kayıtlı Profiller:
          </h2>
          <ul className="space-y-3">
            {Object.keys(businesses).map((slug) => (
              <li key={slug}>
                <Link
                  href={`/${slug}`}
                  className="block p-4 border rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors flex items-center justify-between"
                >
                  <span className="font-semibold">{businesses[slug].name}</span>
                  <span className="text-blue-500">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
