import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./lib/auth/AuthContext";

export const metadata: Metadata = {
  title: "Gyanivo AI — MoSPI Competency Intelligence & Learning Platform",
  description:
    "AI-enabled Competency Intelligence, Adaptive Skill-Gap Analytics and Learning Platform for India's Official Statistical System (MoSPI). Problem Statement SIH26101.",
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
