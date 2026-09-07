"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addBusiness } from "./actions";
import { LinkType } from "../../data/businesses";
import Link from "next/link";

function isValidUrl(url: string): boolean {
  if (url.startsWith('tel:') || url.startsWith('mailto:') || url.startsWith('https://wa.me')) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default function AddBusinessPage() {
  const router = useRouter();

  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [primary, setPrimary] = useState("#000000");
  const [background, setBackground] = useState("#ffffff");
  const [text, setText] = useState("#000000");
  const [links, setLinks] = useState<{ type: LinkType; label: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [urlErrors, setUrlErrors] = useState<Record<number, string>>({});

  const addLink = () => {
    setLinks([...links, { type: "website", label: "", url: "" }]);
  };

  const updateLink = (index: number, field: keyof (typeof links)[0], value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);

    // URL alanı değişince validasyon yenile
    if (field === 'url') {
      const newUrlErrors = { ...urlErrors };
      if (value && !isValidUrl(value)) {
        newUrlErrors[index] = 'Geçersiz URL formatı';
      } else {
        delete newUrlErrors[index];
      }
      setUrlErrors(newUrlErrors);
    }
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
    const newUrlErrors = { ...urlErrors };
    delete newUrlErrors[index];
    setUrlErrors(newUrlErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // URL validasyon kontrolü
    const invalidUrls = links.some((l) => l.url && !isValidUrl(l.url));
    if (invalidUrls) {
      setError("Lütfen tüm URL'lerin geçerli formatta olduğundan emin olun.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("slug", slug);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("primary", primary);
      formData.append("background", background);
      formData.append("text", text);
      formData.append("links", JSON.stringify(links));
      if (logoFile) formData.append("logo", logoFile);

      await addBusiness(formData);
      // addBusiness server action redirect() ile yönlendirir
    } catch (err: any) {
      setError(err.message || "Bilinmeyen hata");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-white text-black font-sans">
      <div className="max-w-2xl w-full p-8 border border-black">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-widest">Yeni Profil Ekle</h1>
          <Link href="/admin" className="text-sm underline hover:no-underline">← Admin</Link>
        </div>

        {error && (
          <div className="mb-4 p-4 border border-red-400 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Slug (URL)</label>
              <input
                required
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                className="w-full border border-black p-2 bg-transparent"
                placeholder="ornek-sirket"
                pattern="[a-z0-9\-]+"
                title="Sadece küçük harf, rakam ve tire kullanın"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Şirket Adı</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-black p-2 bg-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Açıklama</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-black p-2 bg-transparent"
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Logo Dosyası <span className="text-gray-400 font-normal">(opsiyonel)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="w-full border border-black p-2 bg-transparent"
              />
            </div>

            <div className="md:col-span-2 border border-black p-4 space-y-4">
              <h3 className="text-sm font-medium uppercase tracking-wider">Tema Renkleri</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs mb-1">Birincil</label>
                  <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} className="w-full h-10 border border-black p-1" />
                </div>
                <div>
                  <label className="block text-xs mb-1">Arka Plan</label>
                  <input type="color" value={background} onChange={(e) => setBackground(e.target.value)} className="w-full h-10 border border-black p-1" />
                </div>
                <div>
                  <label className="block text-xs mb-1">Metin</label>
                  <input type="color" value={text} onChange={(e) => setText(e.target.value)} className="w-full h-10 border border-black p-1" />
                </div>
              </div>
            </div>
          </div>

          <div className="border border-black p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium uppercase tracking-wider">Linkler</h3>
              <button type="button" onClick={addLink} className="text-xs border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors">
                + Link Ekle
              </button>
            </div>

            <div className="space-y-4">
              {links.map((link, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <select
                    value={link.type}
                    onChange={(e) => updateLink(index, 'type', e.target.value as LinkType)}
                    className="border border-black p-2 bg-transparent text-sm w-1/4"
                  >
                    <option value="website">Website</option>
                    <option value="instagram">Instagram</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="maps">Maps</option>
                    <option value="phone">Telefon</option>
                    <option value="email">E-posta</option>
                    <option value="google_review">Google Review</option>
                    <option value="contact">Kişi</option>
                  </select>
                  <input
                    required
                    type="text"
                    placeholder="Etiket"
                    value={link.label}
                    onChange={(e) => updateLink(index, 'label', e.target.value)}
                    className="border border-black p-2 bg-transparent text-sm w-1/4"
                  />
                  <div className="flex flex-col w-2/4">
                    <input
                      required
                      type="text"
                      placeholder="URL (https://... veya tel:...)"
                      value={link.url}
                      onChange={(e) => updateLink(index, 'url', e.target.value)}
                      className={`border p-2 bg-transparent text-sm ${urlErrors[index] ? 'border-red-400' : 'border-black'}`}
                    />
                    {urlErrors[index] && (
                      <span className="text-red-500 text-xs mt-1">{urlErrors[index]}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    className="border border-black p-2 text-sm hover:bg-black hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {links.length === 0 && (
                <p className="text-xs text-gray-400 text-center">Henüz link eklenmedi.</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || Object.keys(urlErrors).length > 0}
            className="w-full p-4 border border-black bg-black text-white uppercase tracking-widest hover:bg-white hover:text-black transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? "Kaydediliyor..." : "Profili Kaydet"}
          </button>
        </form>
      </div>
    </main>
  );
}
