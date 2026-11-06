"use client";

import {
  ChangeEvent,
  FormEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Star,
  Trash2,
  Check,
  ExternalLink,
  Smartphone,
} from "lucide-react";
import {
  BusinessLink,
  BusinessProfile,
  LinkType,
  ProfileDesign,
} from "../data/businesses";
import {
  DEFAULT_DESIGN,
  LINK_TYPES,
  TEMPLATES,
  contrastRatio,
  normalizeLink,
  normalizeSlug,
  validSlug,
} from "../lib/profile-design";
import { addBusiness, checkSlug } from "../app/add/actions";
import { editBusiness } from "../app/[slug]/edit/actions";
import { ProfilePreview } from "./ProfilePreview";
import { QRModal } from "./QRModal";

type EditorLink = BusinessLink & { id: string };
type Tab = "content" | "appearance" | "publish";
const inputClass = "editor-input";
const imageAccept = "image/jpeg,image/png,image/webp,image/gif";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="block text-sm font-medium mb-2">{label}</span>
      {children}
      {hint && (
        <span className="block text-xs text-slate-500 mt-2 leading-relaxed">
          {hint}
        </span>
      )}
    </label>
  );
}
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="editor-section">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && (
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          {description}
        </p>
      )}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}
function Action({
  label,
  children,
  onClick,
  disabled = false,
  pressed,
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={`editor-icon ${pressed ? "bg-slate-900 text-white" : ""}`}
    >
      {children}
    </button>
  );
}
function Range({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix = "",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <Field label={`${label} · ${value}${suffix}`}>
      <input
        className="w-full accent-slate-900"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  );
}
function useImageUrl(file: File | null, fallback: string) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!file) {
      setUrl("");
      return;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return file ? url : fallback;
}

export function ProfileEditor({
  initialProfile,
}: {
  initialProfile?: BusinessProfile;
}) {
  const editing = !!initialProfile;
  const [tab, setTab] = useState<Tab>("content");
  const [slug, setSlug] = useState(initialProfile?.slug || "");
  const slugTouched = useRef(editing);
  const [name, setName] = useState(initialProfile?.name || "");
  const [description, setDescription] = useState(
    initialProfile?.description || "",
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [design, setDesign] = useState<ProfileDesign>({
    ...DEFAULT_DESIGN,
    ...initialProfile?.design,
  });
  const [primary, setPrimary] = useState(
    initialProfile?.primary_color || "#000000",
  );
  const [background, setBackground] = useState(
    initialProfile?.background_color || "#ffffff",
  );
  const [text, setText] = useState(initialProfile?.text_color || "#000000");
  const [links, setLinks] = useState<EditorLink[]>(() =>
    (initialProfile?.links || []).map((link, index) => ({
      ...link,
      id: link.id || `existing-${index}`,
    })),
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [origin, setOrigin] = useState("");
  const [slugCheck, setSlugCheck] = useState<{
    slug: string;
    available: boolean;
    message: string;
  } | null>(null);
  const [retry, setRetry] = useState(0);
  const dragId = useRef<string | null>(null);
  const [copied, setCopied] = useState(false);
  const logoUrl = useImageUrl(logoFile, initialProfile?.logo_url || "");
  const coverUrl = useImageUrl(coverFile, design.cover_url);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  useEffect(() => {
    if (editing || !slug || !validSlug(slug)) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const result = await checkSlug(slug);
        if (!cancelled) setSlugCheck({ slug, ...result });
      } catch {
        if (!cancelled)
          setSlugCheck({
            slug,
            available: false,
            message: "Adres kontrol edilemedi. Yeniden deneyin.",
          });
      }
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [slug, editing, retry]);

  const changeTab = (next: Tab) => {
    setTab(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const updateDesign = <K extends keyof ProfileDesign>(
    key: K,
    value: ProfileDesign[K],
  ) => setDesign((d) => ({ ...d, [key]: value }));
  const updateLink = (id: string, patch: Partial<EditorLink>) =>
    setLinks((current) =>
      current.map((link) =>
        link.id === id
          ? { ...link, ...patch }
          : patch.featured
            ? { ...link, featured: false }
            : link,
      ),
    );
  const moveLink = (id: string, offset: number) =>
    setLinks((current) => {
      const from = current.findIndex((link) => link.id === id),
        to = from + offset;
      if (from < 0 || to < 0 || to >= current.length) return current;
      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  const addLink = () =>
    setLinks((current) =>
      current.length >= 50
        ? current
        : [
            ...current,
            {
              id: crypto.randomUUID(),
              type: "website",
              label: "",
              url: "",
              visible: true,
              featured: false,
            },
          ],
    );
  const chooseImage = (
    event: ChangeEvent<HTMLInputElement>,
    kind: "logo" | "cover",
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (
      !imageAccept.split(",").includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError("En fazla 5 MB JPG, PNG, WebP veya GIF yükleyin.");
      event.target.value = "";
      return;
    }
    setError("");
    if (kind === "logo") {
      setLogoFile(file);
      setDesign((d) => ({ ...d, photo_x: 50, photo_y: 50, photo_zoom: 1 }));
    } else setCoverFile(file);
  };
  const applyTemplate = (id: ProfileDesign["template"]) => {
    const template = TEMPLATES.find((t) => t.id === id)!;
    setDesign((d) => ({
      ...DEFAULT_DESIGN,
      ...template.design,
      template: id,
      cover_url: d.cover_url,
    }));
    setPrimary(template.primary);
    setBackground(template.background);
    setText(template.text);
  };
  const normalizedLinks = links.map((link) => ({
    ...link,
    label: link.label || LINK_TYPES.find((t) => t.value === link.type)!.label,
    url: normalizeLink(link.type, link.url),
  }));
  const invalidLinks = links.filter(
    (link) => !link.label.trim() || !normalizeLink(link.type, link.url),
  );
  const visibleCount = links.filter((link) => link.visible !== false).length;
  const lowContrast = contrastRatio(text, background) < 4.5;
  const profile: BusinessProfile = {
    slug,
    name,
    description,
    logo_url: logoUrl,
    primary_color: primary,
    background_color: background,
    text_color: text,
    links: normalizedLinks,
    design: { ...design, cover_url: coverUrl },
  };
  const currentSlugCheck = slugCheck?.slug === slug ? slugCheck : null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!name.trim()) {
      changeTab("content");
      setError("Profil adını girin.");
      return;
    }
    if (invalidLinks.length) {
      changeTab("content");
      setError(
        "Bağlantıların başlıklarını ve adreslerini tamamlayın. Gizli bağlantılar da geçerli olmalı.",
      );
      return;
    }
    if (!validSlug(slug)) {
      changeTab("publish");
      setError("Geçerli bir profil adresi girin.");
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      for (const [key, value] of Object.entries({
        slug,
        name,
        description,
        primary,
        background,
        text,
        links: JSON.stringify(normalizedLinks),
        design: JSON.stringify(design),
      }))
        form.append(key, value);
      if (logoFile) form.append("logo", logoFile);
      if (coverFile) form.append("cover", coverFile);
      const result = editing
        ? await editBusiness(initialProfile!.slug, form)
        : await addBusiness(form);
      setPublished(result.slug);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Profil kaydedilemedi. Yeniden deneyin.",
      );
    } finally {
      setLoading(false);
    }
  };

  const preview = (
    <div className="sticky top-6 space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span className="flex items-center gap-2">
          <Smartphone size={16} /> Canlı önizleme
        </span>
        <span>Mobil görünüm</span>
      </div>
      <div className="mx-auto w-[376px] max-w-full h-[680px] rounded-[36px] border-8 border-slate-900 overflow-hidden bg-white shadow-xl">
        <div className="h-full overflow-y-auto">
          <ProfilePreview {...profile} />
        </div>
      </div>
      <p className="text-xs text-center text-slate-500">
        Yayınlanan sayfayla aynı görünümü kullanır.
      </p>
    </div>
  );

  if (published)
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <section className="max-w-lg w-full bg-white rounded-2xl border p-8 space-y-6">
          <Check className="text-emerald-700" size={32} />
          <h1 className="text-2xl font-semibold">
            {editing ? "Profil güncellendi" : "Profilin yayında"}
          </h1>
          <p className="text-slate-600">
            {name} profilini paylaşmaya hazırsın.
          </p>
          <a className="block break-all underline" href={`/${published}`}>
            {origin}/{published}
          </a>
          <div className="flex flex-wrap gap-3">
            <a
              className="editor-button editor-button-primary"
              href={`/${published}`}
              target="_blank"
              rel="noreferrer"
            >
              Profili aç <ExternalLink size={16} />
            </a>
            <button
              type="button"
              className="editor-button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(`${origin}/${published}`);
                  setCopied(true);
                } catch {
                  setError(
                    "Bağlantıyı yukarıdaki adresten kopyalayabilirsiniz.",
                  );
                }
              }}
            >
              {copied ? "Kopyalandı" : "Bağlantıyı kopyala"}
            </button>
            <button
              type="button"
              className="editor-button"
              onClick={() => setShowQR(true)}
            >
              QR kodu
            </button>
          </div>
          {error && <p role="alert">{error}</p>}
          <Link className="block text-sm underline" href="/arkaoda">
            Arkaoda’ya dön
          </Link>
          {showQR && (
            <QRModal
              slug={published}
              name={name}
              onClose={() => setShowQR(false)}
            />
          )}
        </section>
      </main>
    );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white px-5 py-5">
        <div className="max-w-[1360px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/arkaoda"
              className="text-xs text-slate-500 hover:underline"
            >
              ← Arkaoda
            </Link>
            <h1 className="text-2xl font-semibold mt-2">
              {editing ? "Profili düzenle" : "Yeni profil oluştur"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              İçeriğini ekle, görünümünü seç, paylaş.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowMobilePreview((v) => !v)}
            className="editor-button lg:hidden"
          >
            <Eye size={16} />
            {showMobilePreview ? "Düzenleyiciye dön" : "Önizleme"}
          </button>
        </div>
      </header>
      <div className="max-w-[1360px] mx-auto grid lg:grid-cols-[minmax(0,1fr)_408px] gap-8 p-4 sm:p-6 lg:p-8">
        <div
          className={`min-w-0 ${showMobilePreview ? "hidden lg:block" : ""}`}
        >
          <nav
            aria-label="Profil oluşturma adımları"
            className="flex gap-1 p-1 bg-slate-200/60 rounded-xl mb-6"
          >
            {(
              [
                { id: "content", label: "İçerik" },
                { id: "appearance", label: "Görünüm" },
                { id: "publish", label: "Yayınla" },
              ] as const
            ).map((item, index) => (
              <button
                type="button"
                key={item.id}
                aria-current={tab === item.id ? "step" : undefined}
                onClick={() => changeTab(item.id)}
                className={`flex-1 px-2 py-3 text-sm rounded-lg ${tab === item.id ? "bg-white shadow-sm font-semibold" : "text-slate-600 hover:bg-white/50"}`}
              >
                {index + 1}. {item.label}
              </button>
            ))}
          </nav>
          <form onSubmit={submit} noValidate>
            {error && (
              <div
                role="alert"
                className="mb-5 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm"
              >
                {error}
              </div>
            )}
            <div className="space-y-5" hidden={tab !== "content"}>
              <Section
                title="Profil bilgileri"
                description="Bir kişi, sanatçı veya işletme için kendi sayfanı oluştur."
              >
                <Field label="Profil adı">
                  <input
                    className={inputClass}
                    maxLength={120}
                    autoComplete="organization"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!slugTouched.current)
                        setSlug(
                          normalizeSlug(e.target.value).replace(/-$/, ""),
                        );
                    }}
                    placeholder="Örn. Begüm"
                  />
                </Field>
                <Field
                  label="Açıklama"
                  hint={`${description.length}/2000 karakter · İsteğe bağlı`}
                >
                  <textarea
                    className={inputClass}
                    rows={3}
                    maxLength={2000}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Kendinden veya yaptığın işten kısaca bahset."
                  />
                </Field>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field
                    label="Profil fotoğrafı / logo"
                    hint="JPG, PNG, WebP veya GIF · En fazla 5 MB"
                  >
                    <input
                      className="editor-file"
                      type="file"
                      accept={imageAccept}
                      onChange={(e) => chooseImage(e, "logo")}
                    />
                  </Field>
                  <div>
                    <Field
                      label="Kapak görseli"
                      hint="Yatay bir görsel seç · En fazla 5 MB"
                    >
                      <input
                        className="editor-file"
                        type="file"
                        accept={imageAccept}
                        onChange={(e) => chooseImage(e, "cover")}
                      />
                    </Field>
                    {(coverUrl || coverFile) && (
                      <button
                        type="button"
                        className="text-xs underline mt-2"
                        onClick={() => {
                          setCoverFile(null);
                          updateDesign("cover_url", "");
                        }}
                      >
                        Kapağı kaldır
                      </button>
                    )}
                  </div>
                </div>
              </Section>
              <Section
                title="Bağlantılar"
                description="Sürükleyerek veya oklarla sırala. Yıldız ile bir bağlantıyı öne çıkar."
              >
                {links.length === 0 && (
                  <div className="border border-dashed rounded-xl p-6 text-center text-sm text-slate-500">
                    İlk bağlantını ekle. Sosyal hesaplarını, biletlerini veya
                    web siteni paylaş.
                  </div>
                )}
                <div className="space-y-4">
                  {links.map((link, index) => {
                    const type = LINK_TYPES.find((t) => t.value === link.type)!;
                    const normalized = normalizeLink(link.type, link.url);
                    return (
                      <article
                        key={link.id}
                        className={`rounded-xl border p-4 space-y-4 ${link.visible === false ? "bg-slate-50 border-dashed" : "bg-white"}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const source = dragId.current;
                          if (!source || source === link.id) return;
                          setLinks((current) => {
                            const next = [...current];
                            const from = next.findIndex((l) => l.id === source),
                              to = next.findIndex((l) => l.id === link.id);
                            if (from < 0 || to < 0) return current;
                            const [moved] = next.splice(from, 1);
                            next.splice(to, 0, moved);
                            return next;
                          });
                          dragId.current = null;
                        }}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              draggable
                              onDragStart={(e) => {
                                dragId.current = link.id;
                                e.dataTransfer.setData("text/plain", link.id);
                                e.dataTransfer.effectAllowed = "move";
                              }}
                              onDragEnd={() => {
                                dragId.current = null;
                              }}
                              className="cursor-grab p-1"
                              title="Sürükleyerek sırala"
                            >
                              <GripVertical size={18} />
                            </span>
                            <span className="text-sm font-medium">
                              Bağlantı {index + 1}
                              {link.visible === false ? " · Gizli" : ""}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Action
                              label="Yukarı taşı"
                              disabled={index === 0}
                              onClick={() => moveLink(link.id, -1)}
                            >
                              <ArrowUp size={16} />
                            </Action>
                            <Action
                              label="Aşağı taşı"
                              disabled={index === links.length - 1}
                              onClick={() => moveLink(link.id, 1)}
                            >
                              <ArrowDown size={16} />
                            </Action>
                            <Action
                              label={
                                link.visible === false
                                  ? "Bağlantıyı göster"
                                  : "Bağlantıyı gizle"
                              }
                              pressed={link.visible === false}
                              onClick={() =>
                                updateLink(link.id, {
                                  visible: link.visible === false,
                                })
                              }
                            >
                              {link.visible === false ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </Action>
                            <Action
                              label="Öne çıkar"
                              pressed={!!link.featured}
                              onClick={() =>
                                updateLink(link.id, {
                                  featured: !link.featured,
                                })
                              }
                            >
                              <Star size={16} />
                            </Action>
                            <Action
                              label="Bağlantıyı çoğalt"
                              disabled={links.length >= 50}
                              onClick={() =>
                                setLinks((current) => {
                                  const next = [...current];
                                  next.splice(index + 1, 0, {
                                    ...link,
                                    id: crypto.randomUUID(),
                                    featured: false,
                                  });
                                  return next;
                                })
                              }
                            >
                              <Copy size={16} />
                            </Action>
                            <Action
                              label="Bağlantıyı sil"
                              onClick={() =>
                                setLinks((current) =>
                                  current.filter((l) => l.id !== link.id),
                                )
                              }
                            >
                              <Trash2 size={16} />
                            </Action>
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <Field label="Bağlantı türü">
                            <select
                              className={inputClass}
                              value={link.type}
                              onChange={(e) =>
                                updateLink(link.id, {
                                  type: e.target.value as LinkType,
                                  label:
                                    link.label === type.label || !link.label
                                      ? LINK_TYPES.find(
                                          (t) => t.value === e.target.value,
                                        )!.label
                                      : link.label,
                                  url: "",
                                })
                              }
                            >
                              {LINK_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                  {t.label}
                                </option>
                              ))}
                            </select>
                          </Field>
                          <Field label="Buton başlığı">
                            <input
                              className={inputClass}
                              value={link.label}
                              maxLength={100}
                              placeholder={type.label}
                              onChange={(e) =>
                                updateLink(link.id, { label: e.target.value })
                              }
                            />
                          </Field>
                        </div>
                        <Field
                          label={
                            link.type === "phone" || link.type === "whatsapp"
                              ? "Telefon numarası (ülke koduyla)"
                              : link.type === "email"
                                ? "E-posta adresi"
                                : "Adres / kullanıcı adı"
                          }
                        >
                          <input
                            className={inputClass}
                            value={link.url}
                            placeholder={type.placeholder}
                            inputMode={
                              link.type === "phone" || link.type === "whatsapp"
                                ? "tel"
                                : link.type === "email"
                                  ? "email"
                                  : "text"
                            }
                            aria-invalid={!!link.url && !normalized}
                            onChange={(e) =>
                              updateLink(link.id, { url: e.target.value })
                            }
                          />
                          {link.url && (
                            <span
                              className={`block text-xs mt-2 break-all ${normalized ? "text-slate-500" : "text-red-700"}`}
                            >
                              {normalized ||
                                "Geçerli bir adres veya numara girin."}
                            </span>
                          )}
                        </Field>
                      </article>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={addLink}
                  disabled={links.length >= 50}
                  className="editor-button w-full"
                >
                  <Plus size={16} /> Bağlantı ekle{" "}
                  {links.length > 0 && `(${links.length}/50)`}
                </button>
                <label className="flex gap-3 items-center text-sm">
                  <input
                    className="accent-slate-900 w-4 h-4"
                    type="checkbox"
                    checked={design.show_contact}
                    onChange={(e) =>
                      updateDesign("show_contact", e.target.checked)
                    }
                  />
                  “Rehbere Kaydet” düğmesini göster
                </label>
                {design.show_contact && (
                  <Field label="Rehber düğmesi başlığı">
                    <input
                      className={inputClass}
                      maxLength={60}
                      value={design.contact_label}
                      onChange={(e) =>
                        updateDesign("contact_label", e.target.value)
                      }
                    />
                  </Field>
                )}
              </Section>
            </div>
            <div className="space-y-5" hidden={tab !== "appearance"}>
              <Section
                title="Bir başlangıç seç"
                description="Şablonlar renk ve görünüm ayarlarını değiştirir. İçeriğin korunur."
              >
                <div className="grid sm:grid-cols-3 gap-3">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={design.template === t.id}
                      onClick={() => applyTemplate(t.id)}
                      className={`text-left rounded-xl border-2 p-4 ${design.template === t.id ? "border-slate-900" : "border-slate-200"}`}
                    >
                      <span className="flex gap-1 mb-4">
                        {[t.background, t.primary, t.text].map((color, i) => (
                          <span
                            key={i}
                            className="w-6 h-6 rounded-full border border-black/10"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </span>
                      <span className="block text-sm font-semibold">
                        {t.name}
                      </span>
                      <span className="block text-xs text-slate-500 mt-1">
                        {t.description}
                      </span>
                    </button>
                  ))}
                </div>
              </Section>
              <Section title="Renkler">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Vurgu", value: primary, set: setPrimary },
                    {
                      label: "Arka plan",
                      value: background,
                      set: setBackground,
                    },
                    { label: "Metin", value: text, set: setText },
                  ].map((c) => (
                    <Field key={c.label} label={c.label}>
                      <input
                        className="h-12 w-full rounded-lg border p-1 bg-white"
                        type="color"
                        value={c.value}
                        onChange={(e) => c.set(e.target.value)}
                      />
                      <span className="block mt-2 text-xs text-slate-500">
                        {c.value}
                      </span>
                    </Field>
                  ))}
                </div>
                <p
                  role="status"
                  className={`text-sm rounded-lg p-3 ${lowContrast ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-800"}`}
                >
                  {lowContrast
                    ? "Metin ile arka planın kontrastı düşük. Daha koyu veya daha açık bir renk seç."
                    : "Metin ve arka plan kontrastı uygun."}{" "}
                  ({contrastRatio(text, background).toFixed(1)}:1)
                </p>
                {design.button_style === "outline" &&
                  links.some((l) => l.visible !== false && l.featured) &&
                  contrastRatio(primary, background) < 3 && (
                    <p className="text-sm text-amber-900">
                      Vurgu rengi arka plandan zor ayırt edilebilir.
                    </p>
                  )}
              </Section>
              <Section
                title="Fotoğraf görünümü"
                description="Kadraj ve yakınlaştırma ayarlarını canlı önizlemede takip et."
              >
                <Range
                  label="Fotoğraf boyutu"
                  min={72}
                  max={200}
                  value={design.photo_size}
                  onChange={(v) => updateDesign("photo_size", v)}
                  suffix=" px"
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Fotoğraf şekli">
                    <select
                      className={inputClass}
                      value={design.photo_shape}
                      onChange={(e) =>
                        updateDesign(
                          "photo_shape",
                          e.target.value as ProfileDesign["photo_shape"],
                        )
                      }
                    >
                      <option value="square">Kare</option>
                      <option value="rounded">Yuvarlatılmış</option>
                      <option value="circle">Daire</option>
                    </select>
                  </Field>
                  <Field label="Görseli yerleştir">
                    <select
                      className={inputClass}
                      value={design.photo_fit}
                      onChange={(e) =>
                        updateDesign(
                          "photo_fit",
                          e.target.value as ProfileDesign["photo_fit"],
                        )
                      }
                    >
                      <option value="contain">Tamamını göster (logo)</option>
                      <option value="cover">Alanı doldur (fotoğraf)</option>
                    </select>
                  </Field>
                </div>
                <Range
                  label="Yakınlaştırma"
                  min={1}
                  max={3}
                  step={0.1}
                  value={design.photo_zoom}
                  onChange={(v) => updateDesign("photo_zoom", v)}
                  suffix="×"
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Range
                    label="Yatay kadraj"
                    min={0}
                    max={100}
                    value={design.photo_x}
                    onChange={(v) => updateDesign("photo_x", v)}
                    suffix="%"
                  />
                  <Range
                    label="Dikey kadraj"
                    min={0}
                    max={100}
                    value={design.photo_y}
                    onChange={(v) => updateDesign("photo_y", v)}
                    suffix="%"
                  />
                </div>
                <button
                  type="button"
                  className="text-sm underline"
                  onClick={() =>
                    setDesign((d) => ({
                      ...d,
                      photo_zoom: 1,
                      photo_x: 50,
                      photo_y: 50,
                    }))
                  }
                >
                  Kadrajı ortala
                </button>
              </Section>
              <Section title="Yazı, buton ve yerleşim">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Yazı tipi">
                    <select
                      className={inputClass}
                      value={design.font}
                      onChange={(e) =>
                        updateDesign(
                          "font",
                          e.target.value as ProfileDesign["font"],
                        )
                      }
                    >
                      <option value="sans">Sade · Arial</option>
                      <option value="serif">Klasik · Georgia</option>
                      <option value="mono">Daktilo · Courier</option>
                    </select>
                  </Field>
                  <Field label="Buton şekli">
                    <select
                      className={inputClass}
                      value={design.button_shape}
                      onChange={(e) =>
                        updateDesign(
                          "button_shape",
                          e.target.value as ProfileDesign["button_shape"],
                        )
                      }
                    >
                      <option value="square">Köşeli</option>
                      <option value="rounded">Yuvarlatılmış</option>
                      <option value="pill">Tam yuvarlak</option>
                    </select>
                  </Field>
                  <Field label="Buton stili">
                    <select
                      className={inputClass}
                      value={design.button_style}
                      onChange={(e) =>
                        updateDesign(
                          "button_style",
                          e.target.value as ProfileDesign["button_style"],
                        )
                      }
                    >
                      <option value="outline">Çerçeveli</option>
                      <option value="solid">Dolgulu</option>
                    </select>
                  </Field>
                  <Field label="İçerik aralıkları">
                    <select
                      className={inputClass}
                      value={design.spacing}
                      onChange={(e) =>
                        updateDesign(
                          "spacing",
                          e.target.value as ProfileDesign["spacing"],
                        )
                      }
                    >
                      <option value="compact">Sıkı</option>
                      <option value="comfortable">Dengeli</option>
                      <option value="spacious">Geniş</option>
                    </select>
                  </Field>
                  <Field label="Hizalama">
                    <select
                      className={inputClass}
                      value={design.alignment}
                      onChange={(e) =>
                        updateDesign(
                          "alignment",
                          e.target.value as ProfileDesign["alignment"],
                        )
                      }
                    >
                      <option value="center">Ortala</option>
                      <option value="left">Sola hizala</option>
                    </select>
                  </Field>
                </div>
              </Section>
            </div>
            <div className="space-y-5" hidden={tab !== "publish"}>
              <Section
                title="Profil adresi"
                description={
                  editing
                    ? "Mevcut profilinin adresi korunur."
                    : "Paylaşacağın kısa ve akılda kalıcı adresi seç."
                }
              >
                <Field
                  label="Adres"
                  hint="Küçük harf, rakam ve aralarda tire kullanabilirsin."
                >
                  <input
                    className={inputClass}
                    value={slug}
                    readOnly={editing}
                    maxLength={80}
                    autoCapitalize="none"
                    spellCheck={false}
                    onChange={(e) => {
                      slugTouched.current = true;
                      setSlug(normalizeSlug(e.target.value));
                    }}
                    placeholder="begum"
                  />
                </Field>
                <p className="text-sm break-all text-slate-600">
                  {origin || "Profil adresin"}/{slug || "profil-adin"}
                </p>
                {!editing && slug && (
                  <div role="status" className="text-sm">
                    <p
                      className={
                        currentSlugCheck?.available
                          ? "text-emerald-700"
                          : "text-slate-600"
                      }
                    >
                      {!validSlug(slug)
                        ? "Bu adres geçersiz veya ayrılmış. Farklı bir adres seçin."
                        : currentSlugCheck?.message ||
                          "Adres kontrol ediliyor…"}
                    </p>
                    {currentSlugCheck && !currentSlugCheck.available && (
                      <button
                        className="underline mt-2"
                        type="button"
                        onClick={() => {
                          setSlugCheck(null);
                          setRetry((r) => r + 1);
                        }}
                      >
                        Yeniden kontrol et
                      </button>
                    )}
                  </div>
                )}
              </Section>
              <Section title="Yayın öncesi kontrol">
                <ul className="text-sm space-y-3">
                  <li>
                    {name.trim() ? "✓" : "•"} Profil adı:{" "}
                    {name || "Henüz eklenmedi"}
                  </li>
                  <li>
                    {invalidLinks.length ? "•" : "✓"} {visibleCount} görünür,{" "}
                    {links.length - visibleCount} gizli bağlantı
                    {invalidLinks.length > 0
                      ? ` · ${invalidLinks.length} bağlantı tamamlanmalı`
                      : ""}
                  </li>
                  <li>
                    ✓ Rehber düğmesi {design.show_contact ? "açık" : "kapalı"}
                  </li>
                  <li>
                    {lowContrast
                      ? "• Metin kontrastını gözden geçir."
                      : "✓ Metin kontrastı uygun."}
                  </li>
                </ul>
                <p className="text-sm text-slate-500">
                  {editing
                    ? "Kaydettiğinde mevcut profilin güncellenir."
                    : "Yayınladığında profilin bu adresten herkes tarafından görüntülenebilir."}{" "}
                  Ardından bağlantıyı kopyalayabilir ve QR kodunu
                  indirebilirsin.
                </p>
              </Section>
            </div>
            <div className="flex justify-between gap-3 mt-6 py-4">
              <button
                type="button"
                className="editor-button"
                disabled={tab === "content" || loading}
                onClick={() =>
                  changeTab(tab === "publish" ? "appearance" : "content")
                }
              >
                Geri
              </button>
              {tab === "publish" ? (
                <button
                  key="publish"
                  type="submit"
                  disabled={
                    loading ||
                    !validSlug(slug) ||
                    (!editing && currentSlugCheck?.available === false)
                  }
                  className="editor-button editor-button-primary"
                >
                  {loading
                    ? "Kaydediliyor…"
                    : editing
                      ? "Değişiklikleri yayınla"
                      : "Profili yayınla"}
                </button>
              ) : (
                <button
                  key="continue"
                  type="button"
                  className="editor-button editor-button-primary"
                  onClick={() =>
                    changeTab(tab === "content" ? "appearance" : "publish")
                  }
                >
                  {tab === "content" ? "Görünümü düzenle" : "Yayına hazırla"} →
                </button>
              )}
            </div>
          </form>
        </div>
        <aside
          className={`${showMobilePreview ? "block" : "hidden"} lg:block min-w-0`}
          aria-label="Profil önizlemesi"
        >
          {preview}
        </aside>
      </div>
    </main>
  );
}
