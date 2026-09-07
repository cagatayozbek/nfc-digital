"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

interface QRModalProps {
  slug: string;
  name: string;
  onClose: () => void;
}

export function QRModal({ slug, name, onClose }: QRModalProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(`${window.location.origin}/${slug}`);
  }, [slug]);

  const downloadQR = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-${slug}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 border border-black max-w-sm w-full mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="text-left">
            <h2 className="font-bold uppercase tracking-widest text-sm">
              {name}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">/{slug}</p>
          </div>
          <button
            onClick={onClose}
            className="text-lg text-gray-400 hover:text-black transition-colors"
          >
            ✕
          </button>
        </div>

        {/* QR Code */}
        <div
          ref={canvasRef}
          className="flex justify-center mb-6 p-4 border border-gray-100"
        >
          {url && (
            <QRCodeCanvas
              value={url}
              size={200}
              level="M"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          )}
        </div>

        {/* URL */}
        <p className="text-xs text-gray-400 mb-6 break-all">{url}</p>

        <div className="flex gap-3">
          <button
            onClick={downloadQR}
            className="flex-1 py-3 border border-black bg-black text-white text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
          >
            PNG İndir
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-black text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
