import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

const cols = [
  {
    title: "Product",
    links: [
      { name: "Features",      href: "/features" },
      { name: "How it works",  href: "/how-it-works" },
      { name: "Assessments",   href: "/assessments" },
      { name: "Learning paths",href: "/learning-path" },
      { name: "Analytics",     href: "/analytics" },
    ],
  },
  {
    title: "Portals",
    links: [
      { name: "Employee",    href: "/dashboard" },
      { name: "Trainer",     href: "/trainer" },
      { name: "Admin",       href: "/admin" },
      { name: "Competencies",href: "/competencies" },
      { name: "iGOT courses",href: "/courses" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "About Disha AI",href: "/about" },
      { name: "SIH 26101",    href: "/about#sih26101" },
      { name: "User guide",   href: "/resources" },
      { name: "FAQs",         href: "/faq" },
      { name: "Contact",      href: "/contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-[#0f2140] text-white dark:border-gray-800 dark:bg-gray-950">

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1.2fr] lg:px-10">

        {/* brand */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center">
              <img src="/Disha_AI_Logo.png" alt="Disha AI" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">
                Disha <span className="text-blue-400">AI</span>
              </p>
              <p className="text-[9px] font-medium uppercase tracking-widest text-gray-500">
                Skill · Learn · Grow
              </p>
            </div>
          </Link>

          <p className="mt-5 max-w-xs text-sm leading-relaxed text-gray-400">
            An AI-enabled competency development platform for India&apos;s
            Official Statistical System — built for real people, real roles, real growth.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-300">
            <span>🏆</span> Smart India Hackathon · SIH26101
          </div>
        </div>

        {/* link columns */}
        {cols.map((col) => (
          <div key={col.title}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-600">
              {col.title}
            </p>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.name}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-400 transition hover:text-white dark:text-gray-600 dark:hover:text-gray-300"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* contact */}
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-600">
            Contact
          </p>
          <div className="space-y-4 text-sm text-gray-400">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
              <div>
                <p className="text-[10px] text-gray-600">Email</p>
                <a href="mailto:support@disha.ai" className="mt-0.5 block transition hover:text-white">
                  support@disha.ai
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
              <div>
                <p className="text-[10px] text-gray-600">Ministry</p>
                <p className="mt-0.5 leading-relaxed">
                  Ministry of Statistics &amp;<br />
                  Programme Implementation<br />
                  Government of India
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* gov strip */}
      <div className="border-t border-white/8 dark:border-gray-800">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-5 py-5 sm:px-8 md:flex-row md:items-center lg:px-10">
          <div className="flex items-center gap-3">
            <span className="text-xl">🇮🇳</span>
            <div>
              <p className="text-xs font-semibold text-white">Ministry of Statistics &amp; Programme Implementation</p>
              <p className="text-[11px] text-gray-500">Government of India</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] text-gray-500">
            <span>AI-enabled learning</span><span>·</span>
            <span>Competency-based</span><span>·</span>
            <span>iGOT Karmayogi aligned</span>
          </div>
        </div>
      </div>

      {/* bottom */}
      <div className="border-t border-white/8 dark:border-gray-800">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-5 py-5 text-[11px] text-gray-500 sm:px-8 md:flex-row md:items-center lg:px-10">
          <p>© {new Date().getFullYear()} Disha AI. Built for Smart India Hackathon.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {[
              { name: "Privacy",       href: "/privacy" },
              { name: "Terms",         href: "/terms" },
              { name: "Accessibility", href: "/accessibility" },
              { name: "Sitemap",       href: "/sitemap" },
            ].map((l) => (
              <Link key={l.name} href={l.href} className="transition hover:text-white dark:hover:text-gray-300">
                {l.name}
              </Link>
            ))}
            <span className="text-gray-600">Together for a data-driven India 🇮🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
