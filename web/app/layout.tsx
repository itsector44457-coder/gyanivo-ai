import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./lib/auth/AuthContext";
import { ThemeProvider } from "./lib/theme/ThemeProvider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://gyanivo-web.onrender.com"),
  title: "Disha AI — MoSPI Competency Intelligence & Learning Platform",
  description:
    "AI-enabled Competency Intelligence, Adaptive Skill-Gap Analytics and Learning Platform for India's Official Statistical System (MoSPI). Problem Statement SIH26101.",
  keywords: [
    "Disha AI", "MoSPI", "Competency Intelligence", "Smart India Hackathon",
    "SIH26101", "Adaptive Learning", "Official Statistics", "iGOT Karmayogi", "Skill Gap Analytics",
  ],
  authors: [{ name: "Disha AI Team" }],
  icons: {
    icon: [
      { url: "/Disha_AI_Logo.png?v=2", type: "image/png" },
      { url: "/favicon.ico?v=2", sizes: "any" },
    ],
    shortcut: "/Disha_AI_Logo.png?v=2",
    apple: "/Disha_AI_Logo.png?v=2",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Disha AI — MoSPI Competency Intelligence & Learning Platform",
    description:
      "AI-enabled Competency Intelligence, Adaptive Skill-Gap Analytics and Learning Platform for India's Official Statistical System (MoSPI). Problem Statement SIH26101.",
    url: "https://gyanivo-web.onrender.com",
    siteName: "Disha AI",
    images: [{ url: "/Disha_AI_Logo.png", width: 1408, height: 768, alt: "Disha AI" }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Disha AI — MoSPI Competency Intelligence & Learning Platform",
    description: "AI-enabled Competency Intelligence, Adaptive Skill-Gap Analytics and Learning Platform for India's Official Statistical System (MoSPI).",
    images: ["/Disha_AI_Logo.png"],
  },
};

/* Inline script — runs before React, prevents flash of wrong theme */
const themeScript = `
(function(){
  try {
    var s = localStorage.getItem('disha-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = s || (prefersDark ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch(e){}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-[--bg] text-[--text] antialiased transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
