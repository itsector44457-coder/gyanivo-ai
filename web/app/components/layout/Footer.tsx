import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

/* ── data ──────────────────────────────────────────── */

const cols = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "/features" },
      { name: "How it works", href: "/how-it-works" },
      { name: "Assessments", href: "/assessments" },
      { name: "Learning paths", href: "/learning-path" },
      { name: "Analytics", href: "/analytics" },
    ],
  },
  {
    title: "Portals",
    links: [
      { name: "Employee", href: "/dashboard" },
      { name: "Trainer", href: "/trainer" },
      { name: "Admin", href: "/admin" },
      { name: "Competencies", href: "/competencies" },
      { name: "iGOT courses", href: "/courses" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "About Disha AI", href: "/about" },
      { name: "SIH 26101", href: "/about#sih26101" },
      { name: "User guide", href: "/resources" },
      { name: "FAQs", href: "/faq" },
      { name: "Contact", href: "/contact" },
    ],
  },
];

/* ── component ─────────────────────────────────────── */

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-[#0f2140] text-white">

      {/* ── main grid ── */}
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1.2fr] lg:px-10">

        {/* brand column */}
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
            Official Statistical System — built for real people, real roles,
            real growth.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-300">
            <span>🏆</span>
            Smart India Hackathon · SIH26101
          </div>
        </div>

        {/* link columns */}
        {cols.map((col) => (
          <div key={col.title}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
              {col.title}
            </p>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.name}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-400 transition hover:text-white"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* contact column */}
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Contact
          </p>
          <div className="space-y-4 text-sm text-gray-400">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
              <div>
                <p className="text-[10px] text-gray-600">Email</p>
                <a
                  href="mailto:support@disha.ai"
                  className="mt-0.5 block transition hover:text-white"
                >
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

          {/* social */}
          <div className="mt-5 flex gap-2">
            {[
              { label: "LinkedIn", path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
              { label: "YouTube", path: "M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" },
            ].map((s) => (
              <button
                key={s.label}
                aria-label={s.label}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-300"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d={s.path} />
                </svg>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ── gov strip ── */}
      <div className="border-t border-white/8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-5 py-5 sm:px-8 md:flex-row md:items-center lg:px-10">
          <div className="flex items-center gap-3">
            <span className="text-xl">🇮🇳</span>
            <div>
              <p className="text-xs font-semibold text-white">
                Ministry of Statistics &amp; Programme Implementation
              </p>
              <p className="text-[11px] text-gray-500">Government of India</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] text-gray-500">
            <span>AI-enabled learning</span>
            <span>·</span>
            <span>Competency-based</span>
            <span>·</span>
            <span>iGOT Karmayogi aligned</span>
          </div>
        </div>
      </div>

      {/* ── bottom bar ── */}
      <div className="border-t border-white/8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-5 py-5 text-[11px] text-gray-500 sm:px-8 md:flex-row md:items-center lg:px-10">
          <p>© {new Date().getFullYear()} Disha AI. Built for Smart India Hackathon.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {[
              { name: "Privacy", href: "/privacy" },
              { name: "Terms", href: "/terms" },
              { name: "Accessibility", href: "/accessibility" },
              { name: "Sitemap", href: "/sitemap" },
            ].map((l) => (
              <Link key={l.name} href={l.href} className="transition hover:text-white">
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
