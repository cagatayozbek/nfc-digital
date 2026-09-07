import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NFC Digital Profile",
  description: "Dijital kartvizit ve profil sayfanız",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
