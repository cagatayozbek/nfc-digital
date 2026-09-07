export type LinkType =
  | "instagram"
  | "whatsapp"
  | "website"
  | "maps"
  | "phone"
  | "email"
  | "google_review"
  | "contact";

export interface BusinessLink {
  type: LinkType;
  label: string;
  url: string;
}

export interface BusinessProfile {
  name: string;
  description: string;
  logo: string;
  theme: {
    primary: string;
    background: string;
    text: string;
  };
  links: BusinessLink[];
}

export const businesses: Record<string, BusinessProfile> = {
  demo: {
    name: "Demo İşletme",
    description:
      "Bu bir demo profildir. Müşterilerinize NFC kartınızın nasıl çalışacağını göstermek için kullanabilirsiniz.",
    logo: "https://placehold.co/400x400?text=Logo",
    theme: {
      primary: "#3b82f6", // blue-500
      background: "#f3f4f6", // gray-100
      text: "#1f2937", // gray-800
    },
    links: [
      {
        type: "phone",
        label: "Hemen Ara",
        url: "tel:+905555555555",
      },
      {
        type: "whatsapp",
        label: "WhatsApp",
        url: "https://wa.me/905555555555",
      },
      {
        type: "instagram",
        label: "Instagram",
        url: "https://instagram.com",
      },
      {
        type: "maps",
        label: "Yol Tarifi",
        url: "https://maps.google.com",
      },
      {
        type: "google_review",
        label: "Bizi Değerlendirin",
        url: "https://google.com",
      },
      {
        type: "website",
        label: "Web Sitesi",
        url: "https://example.com",
      },
    ],
  },
  "baskent-ozpen": {
    name: "Başkent Özpen",
    description: "PVC Pencere ve Kapı Sistemleri",
    logo: "https://placehold.co/400x400?text=Özpen",
    theme: {
      primary: "#dc2626", // red-600
      background: "#ffffff",
      text: "#000000",
    },
    links: [
      {
        type: "phone",
        label: "Bizi Arayın",
        url: "tel:+905320000000",
      },
      {
        type: "whatsapp",
        label: "WhatsApp",
        url: "https://wa.me/905320000000",
      },
      {
        type: "instagram",
        label: "Instagram",
        url: "https://instagram.com",
      },
      {
        type: "maps",
        label: "Yol Tarifi",
        url: "https://maps.google.com",
      },
    ],
  },


  "iot": {
      "name": "iot aş",
      "description": "iot yazılım aş",
      "logo": "/logos/iot-logo.svg",
      "theme": {
          "primary": "#000000",
          "background": "#ffffff",
          "text": "#000000"
      },
      "links": [
          {
              "type": "website",
              "label": "web siteşi",
              "url": "https://www.emnify.com/hubfs/Title-iot-connectivity.webp"
          },
          {
              "type": "instagram",
              "label": "insta",
              "url": "https://www.emnify.com/hubfs/Title-iot-connectivity.webp"
          }
      ]
  },
};
