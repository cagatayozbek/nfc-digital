"use client";

import { DEFAULT_PHOTO, PhotoDesign } from "../lib/profile-photo";

export function PhotoSettings({
  value,
  onChange,
}: {
  value: PhotoDesign;
  onChange: (value: PhotoDesign) => void;
}) {
  const update = (patch: Partial<PhotoDesign>) =>
    onChange({ ...value, ...patch });
  return (
    <details className="mt-3 border border-gray-200 p-3">
      <summary className="cursor-pointer text-sm font-medium">
        Fotoğrafı ayarla
      </summary>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <label className="text-xs">
          Şekil
          <select
            className="mt-1 w-full border border-black p-2 bg-white"
            value={value.photo_shape}
            onChange={(e) =>
              update({
                photo_shape: e.target.value as PhotoDesign["photo_shape"],
              })
            }
          >
            <option value="square">Kare</option>
            <option value="rounded">Yuvarlatılmış</option>
            <option value="circle">Daire</option>
          </select>
        </label>
        <label className="text-xs">
          Yerleşim
          <select
            className="mt-1 w-full border border-black p-2 bg-white"
            value={value.photo_fit}
            onChange={(e) =>
              update({ photo_fit: e.target.value as PhotoDesign["photo_fit"] })
            }
          >
            <option value="contain">Tamamını göster</option>
            <option value="cover">Alanı doldur</option>
          </select>
        </label>
        {(
          [
            ["photo_size", "Boyut", 72, 200, 1, " px"],
            ["photo_zoom", "Yakınlaştırma", 1, 3, 0.1, "×"],
            ["photo_x", "Yatay konum", 0, 100, 1, "%"],
            ["photo_y", "Dikey konum", 0, 100, 1, "%"],
          ] as const
        ).map(([key, label, min, max, step, suffix]) => (
          <label key={key} className="text-xs">
            {label} · {value[key]}
            {suffix}
            <input
              className="block mt-2 w-full accent-black"
              type="range"
              min={min}
              max={max}
              step={step}
              value={value[key]}
              onChange={(e) => update({ [key]: Number(e.target.value) })}
            />
          </label>
        ))}
        <button
          className="text-xs underline text-left col-span-2"
          type="button"
          onClick={() => onChange({ ...DEFAULT_PHOTO })}
        >
          Ayarları sıfırla
        </button>
      </div>
    </details>
  );
}
