import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  Mail,
  MapPin,
  ShieldCheck,
} from "lucide-react";

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}

const productLinks = [
  { name: "Features", href: "/features" },
  { name: "How It Works", href: "/how-it-works" },
  { name: "Assessments", href: "/assessments" },
  { name: "Learning Paths", href: "/learning-path" },
  { name: "Analytics", href: "/analytics" },
];

const portalLinks = [
  { name: "Employee Portal", href: "/dashboard" },
  { name: "Trainer Portal", href: "/trainer" },
  { name: "Admin Portal", href: "/admin" },
  { name: "Competencies", href: "/competencies" },
  { name: "iGOT Recommendations", href: "/courses" },
];

const resourceLinks = [
  { name: "About Disha AI", href: "/about" },
  { name: "SIH26101", href: "/about#sih26101" },
  { name: "User Guide", href: "/resources" },
  { name: "FAQs", href: "/faq" },
  { name: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#061A40] text-white font-sans antialiased">
      {/* ======================================================
          CTA SECTION
      ====================================================== */}

      <div className="relative border-b border-white/10">
        {/* Glow Effects */}
        <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-blue-500/20 blur-[110px]" />
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-violet-500/20 blur-[110px]" />

        <div className="relative mx-auto max-w-[1450px] px-5 py-10 sm:px-7 lg:px-10">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            {/* LEFT */}
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                <ShieldCheck className="h-4 w-4" />
                SIH26101 • Official Statistical System
              </div>

              <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-[34px]">
                Building Skills for a
                <span className="ml-2 bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                  Data-Driven India
                </span>
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Empower government officials through AI-powered competency
                assessment, adaptive learning and personalized skill
                development.
              </p>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>

              <Link
                href="/contact"
                className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          MAIN FOOTER
      ====================================================== */}

      <div className="relative mx-auto grid max-w-[1450px] gap-12 px-5 py-14 sm:px-7 md:grid-cols-2 lg:grid-cols-[1.4fr_.7fr_.7fr_.7fr_1fr] lg:px-10">
        {/* BRAND */}
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white border border-slate-700/50 shadow-lg shadow-blue-500/20 p-1">
              <img
                src="/Disha_AI_Logo.png"
                alt="Disha AI Logo"
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <p className="text-2xl font-black tracking-tight">
                Disha{" "}
                <span className="text-blue-400">
                  AI
                </span>
              </p>

              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Skill • Learn • Grow
              </p>
            </div>
          </Link>

          <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
            An AI-enabled competency development and personalized learning
            platform designed for India&apos;s Official Statistical System.
          </p>

          {/* SIH Badge */}
          <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-300">
            <ShieldCheck className="h-4 w-4" />
            Smart India Hackathon • SIH26101
          </div>
        </div>

        {/* PRODUCT */}
        <FooterColumn title="Product" links={productLinks} />

        {/* PORTALS */}
        <FooterColumn title="Portals" links={portalLinks} />

        {/* RESOURCES */}
        <FooterColumn title="Resources" links={resourceLinks} />

        {/* CONTACT */}
        <div>
          <h3 className="text-sm font-bold text-white">
            Contact
          </h3>

          <div className="mt-5 space-y-4 text-sm text-slate-400">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />

              <div>
                <p className="text-[11px] text-slate-500">
                  Email
                </p>

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
                <p className="text-[11px] text-slate-500">
                  Ministry
                </p>

                <p className="mt-0.5 leading-6">
                  Ministry of Statistics &
                  <br />
                  Programme Implementation
                  <br />
                  Government of India
                </p>
              </div>
            </div>
          </div>

          {/* Social */}
          <div className="mt-6 flex gap-2">
            <SocialButton label="LinkedIn">
              <LinkedinIcon className="h-4 w-4" />
            </SocialButton>

            <SocialButton label="YouTube">
              <YoutubeIcon className="h-4 w-4" />
            </SocialButton>

            <SocialButton label="Email">
              <Mail className="h-4 w-4" />
            </SocialButton>
          </div>
        </div>
      </div>

      {/* ======================================================
          GOVERNMENT / DIGITAL INDIA STRIP
      ====================================================== */}

      <div className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto flex max-w-[1450px] flex-col justify-between gap-5 px-5 py-5 sm:px-7 md:flex-row md:items-center lg:px-10">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl">
              🇮🇳
            </div>

            <div>
              <p className="text-xs font-bold text-white">
                Ministry of Statistics & Programme Implementation
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                Government of India
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-medium text-slate-400">
            <span>AI Enabled Learning</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:block" />
            <span>Competency Based</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:block" />
            <span>Aligned with iGOT Karmayogi</span>
          </div>
        </div>
      </div>

      {/* ======================================================
          BOTTOM
      ====================================================== */}

      <div className="mx-auto flex max-w-[1450px] flex-col justify-between gap-5 px-5 py-6 text-[11px] text-slate-500 sm:px-7 md:flex-row md:items-center lg:px-10">
        <p>
          © {new Date().getFullYear()} Disha AI. Built for Smart India
          Hackathon.
        </p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link
            href="/privacy"
            className="transition hover:text-white"
          >
            Privacy Policy
          </Link>

          <Link
            href="/terms"
            className="transition hover:text-white"
          >
            Terms of Use
          </Link>

          <Link
            href="/accessibility"
            className="transition hover:text-white"
          >
            Accessibility
          </Link>

          <Link
            href="/sitemap"
            className="transition hover:text-white"
          >
            Sitemap
          </Link>

          <span className="font-semibold text-slate-300">
            Together for a Data-Driven India 🇮🇳
          </span>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================
   FOOTER COLUMN
========================================================= */

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: {
    name: string;
    href: string;
  }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-bold text-white">
        {title}
      </h3>

      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.name}>
            <Link
              href={link.href}
              className="group flex w-fit items-center gap-1.5 text-sm text-slate-400 transition hover:text-white"
            >
              {link.name}

              <ArrowRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* =========================================================
   SOCIAL BUTTON
========================================================= */

function SocialButton({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition-all hover:-translate-y-1 hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-300"
    >
      {children}
    </button>
  );
}
