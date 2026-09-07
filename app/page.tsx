import Link from 'next/link';
import { businesses } from '../data/businesses';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-white text-black font-sans selection:bg-black selection:text-white">
      <div className="max-w-md w-full p-8 border border-black text-center">
        <h1 className="text-2xl font-bold mb-4 uppercase tracking-widest">NFC Digital</h1>
        <p className="mb-10 text-sm font-light tracking-wide text-gray-600">
          Dijital kartvizit platformu. Lütfen profil seçin.
        </p>
        
        <div className="text-left">
          <ul className="space-y-3">
            {Object.keys(businesses).map((slug) => (
              <li key={slug}>
                <Link 
                  href={`/${slug}`}
                  className="group flex items-center justify-between p-4 border border-black bg-transparent hover:bg-black hover:text-white transition-colors duration-200"
                >
                  <span className="font-medium text-sm uppercase tracking-widest">{businesses[slug].name}</span>
                  <span className="text-black group-hover:text-white transition-colors duration-200">↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
