"use client";

import { useState } from "react";
import { addBusiness } from "./actions";
import { LinkType } from "../../data/businesses";

export default function AddBusinessPage() {
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [primary, setPrimary] = useState("#000000");
  const [background, setBackground] = useState("#ffffff");
  const [text, setText] = useState("#000000");
  
  const [links, setLinks] = useState<{type: LinkType, label: string, url: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const addLink = () => {
    setLinks([...links, { type: "website", label: "", url: "" }]);
  };

  const updateLink = (index: number, field: keyof typeof links[0], value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    try {
      const formData = new FormData();
      formData.append("slug", slug);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("primary", primary);
      formData.append("background", background);
      formData.append("text", text);
      formData.append("links", JSON.stringify(links));
      
      if (logoFile) {
        formData.append("logo", logoFile);
      }
      
      await addBusiness(formData);
      setMessage("Şirket başarıyla eklendi! Logo public/logos klasörüne kaydedildi.");
      
      // Reset form
      setSlug(""); setName(""); setDescription(""); setLogoFile(null);
      setPrimary("#000000"); setBackground("#ffffff"); setText("#000000");
      setLinks([]);
    } catch (err: any) {
      setMessage("Hata: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-white text-black font-sans">
      <div className="max-w-2xl w-full p-8 border border-black">
        <h1 className="text-2xl font-bold mb-6 uppercase tracking-widest text-center">Yeni Şirket Ekle</h1>
        
        {message && (
          <div className="mb-4 p-4 border border-black bg-gray-100 text-center text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Slug (URL)</label>
              <input required type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full border border-black p-2 bg-transparent" placeholder="ornek-sirket" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Şirket Adı</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border border-black p-2 bg-transparent" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Açıklama</label>
              <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-black p-2 bg-transparent" rows={3} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Logo Dosyası</label>
              <input 
                required 
                type="file" 
                accept="image/*"
                onChange={e => setLogoFile(e.target.files?.[0] || null)} 
                className="w-full border border-black p-2 bg-transparent" 
              />
            </div>
            
            <div className="md:col-span-2 border border-black p-4 space-y-4">
              <h3 className="text-sm font-medium uppercase tracking-wider">Tema Renkleri</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs mb-1">Birincil</label>
                  <input type="color" value={primary} onChange={e => setPrimary(e.target.value)} className="w-full h-10 border border-black p-1" />
                </div>
                <div>
                  <label className="block text-xs mb-1">Arka Plan</label>
                  <input type="color" value={background} onChange={e => setBackground(e.target.value)} className="w-full h-10 border border-black p-1" />
                </div>
                <div>
                  <label className="block text-xs mb-1">Metin</label>
                  <input type="color" value={text} onChange={e => setText(e.target.value)} className="w-full h-10 border border-black p-1" />
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
                    onChange={e => updateLink(index, 'type', e.target.value as LinkType)}
                    className="border border-black p-2 bg-transparent text-sm w-1/4"
                  >
                    <option value="website">Website</option>
                    <option value="instagram">Instagram</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="maps">Maps</option>
                    <option value="phone">Phone</option>
                    <option value="email">Email</option>
                    <option value="google_review">Google Review</option>
                    <option value="contact">Contact</option>
                  </select>
                  <input 
                    required 
                    type="text" 
                    placeholder="Etiket (Örn: Web Sitesi)" 
                    value={link.label}
                    onChange={e => updateLink(index, 'label', e.target.value)}
                    className="border border-black p-2 bg-transparent text-sm w-1/4"
                  />
                  <input 
                    required 
                    type="text" 
                    placeholder="URL (https://... veya tel:...)" 
                    value={link.url}
                    onChange={e => updateLink(index, 'url', e.target.value)}
                    className="border border-black p-2 bg-transparent text-sm w-2/4"
                  />
                  <button 
                    type="button" 
                    onClick={() => removeLink(index)}
                    className="border border-black p-2 text-sm hover:bg-black hover:text-white transition-colors"
                  >
                    X
                  </button>
                </div>
              ))}
              {links.length === 0 && <p className="text-xs text-gray-500 text-center">Henüz link eklenmedi.</p>}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full p-4 border border-black bg-black text-white uppercase tracking-widest hover:bg-white hover:text-black transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? "Kaydediliyor..." : "Şirketi Kaydet"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm underline hover:no-underline">Ana Sayfaya Dön</a>
        </div>
      </div>
    </main>
  );
}
