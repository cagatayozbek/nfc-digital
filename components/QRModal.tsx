"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

interface QRModalProps {
  slug: string;
  name: string;
  onClose: () => void;
}

export function QRModal({ slug, name, onClose }: QRModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(`${window.location.origin}/${slug}`);
  }, [slug]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLButtonElement>("button")?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "Tab" && dialog) {
        const buttons = Array.from(
          dialog.querySelectorAll<HTMLButtonElement>("button"),
        );
        const first = buttons[0],
          last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      previous?.focus();
    };
  }, [onClose]);

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
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-dialog-title"
        className="bg-white p-8 border border-black max-w-sm w-full mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="text-left">
            <h2
              id="qr-dialog-title"
              className="font-bold uppercase tracking-widest text-sm"
            >
              {name}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">/{slug}</p>
          </div>
          <button
            type="button"
            aria-label="QR kodunu kapat"
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
