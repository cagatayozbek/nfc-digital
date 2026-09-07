import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black font-sans flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-6">
          NFC Digital
        </p>
        <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-widest mb-6 leading-tight">
          Dijital
          <br />
          Kartvizit
        </h1>
        <p className="text-sm md:text-base text-gray-500 font-light tracking-wide max-w-sm leading-relaxed mb-12">
          NFC kartınızla bir dokunuşta işletmenizin tüm iletişim bilgilerini
          paylaşın.
        </p>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl w-full mb-16">
          {[
            {
              num: "01",
              title: "Profil Oluştur",
              desc: "İşletme bilgilerinizi, logonuzu ve linklerinizi ekleyin.",
            },
            {
              num: "02",
              title: "Karta Yaz",
              desc: "Profilinizin URL'si NFC kartınıza programlanır.",
            },
            {
              num: "03",
              title: "Paylaş",
              desc: "Müşteri kartı okutunca anında profilinize ulaşır.",
            },
          ].map((step) => (
            <div key={step.num} className="border border-black p-6 text-left">
              <p className="text-xs text-gray-300 font-mono mb-3">{step.num}</p>
              <h3 className="font-bold uppercase tracking-wider text-sm mb-2">
                {step.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            "Telefon & WhatsApp",
            "Instagram & Sosyal Medya",
            "Google Haritalar",
            "Google Yorum",
            "Rehbere Kaydet",
            "QR Kod",
          ].map((f) => (
            <span
              key={f}
              className="text-xs border border-gray-200 px-3 py-1.5 text-gray-500 tracking-wide"
            >
              {f}
            </span>
          ))}
        </div>
      </section>

    </main>
  );
}
