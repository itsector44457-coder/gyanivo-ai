import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./lib/auth/AuthContext";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://gyanivo-web.onrender.com"),
  title: "Disha AI — MoSPI Competency Intelligence & Learning Platform",
  description:
    "AI-enabled Competency Intelligence, Adaptive Skill-Gap Analytics and Learning Platform for India's Official Statistical System (MoSPI). Problem Statement SIH26101.",
  keywords: [
    "Disha AI",
    "MoSPI",
    "Competency Intelligence",
    "Smart India Hackathon",
    "SIH26101",
    "Adaptive Learning",
    "Official Statistics",
    "iGOT Karmayogi",
    "Skill Gap Analytics",
  ],
  authors: [{ name: "Disha AI Team" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/Disha_AI_Logo.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/Disha_AI_Logo.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Disha AI — MoSPI Competency Intelligence & Learning Platform",
    description:
      "AI-enabled Competency Intelligence, Adaptive Skill-Gap Analytics and Learning Platform for India's Official Statistical System (MoSPI). Problem Statement SIH26101.",
    url: "https://gyanivo-web.onrender.com",
    siteName: "Disha AI",
    images: [
      {
        url: "/Disha_AI_Logo.png",
        width: 1408,
        height: 768,
        alt: "Disha AI — MoSPI Competency Intelligence & Learning Platform",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Disha AI — MoSPI Competency Intelligence & Learning Platform",
    description:
      "AI-enabled Competency Intelligence, Adaptive Skill-Gap Analytics and Learning Platform for India's Official Statistical System (MoSPI).",
    images: ["/Disha_AI_Logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#0F172A] antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
