import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Upload,
  BookOpen,
  Volume2,
  Type,
  Ruler,
  Highlighter,
  School,
  Users,
  Gauge,
  ClipboardList,
  ShieldCheck,
  Brain,
  Timer,
  Cloud,
  Lock,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";

// ==============================================
// Readease Landing Page — Hover Glow Update + Light/Dark Toggle
// ==============================================

const TOKENS = {
  dark: {
    pageBg: "bg-[#0B0B0F]",
    text: "text-white",
    textMuted: "text-white/80",
    border: "border-white/10",
    chipBg: "bg-white/5",
    chipRing: "border-white/15",
    panelBg: "bg-black/40",
    starfield:
      "bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.06),transparent_60%)]",
    card:
      "rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur shadow-[0_8px_30px_rgba(0,0,0,0.12)]",
    cardHover:
      "hover:scale-[1.01] hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_16px_60px_rgba(0,0,0,0.45)] hover:bg-white/\[0.06\]",
    buttonPrimary:
      "text-black bg-white hover:bg-white/90 ring-2 ring-white/0 hover:ring-white/30 shadow-lg shadow-black/10",
    buttonGhost: "text-white/90 bg-white/0 hover:bg-white/10 ring-1 ring-white/15",
    divider: "border-white/10",
    glowBorder: "from-white/35 via-white/10 to-transparent",
  },
  light: {
    pageBg: "bg-[#F7F8FB]",
    text: "text-[#0B0B0F]",
    textMuted: "text-[#0B0B0F]/70",
    border: "border-black/10",
    chipBg: "bg-white",
    chipRing: "border-black/10",
    panelBg: "bg-white/70",
    starfield:
      "bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.045),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.035),transparent_60%)]",
    card:
      "rounded-3xl border border-black/10 bg-white p-5 backdrop-blur shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
    cardHover:
      "hover:scale-[1.01] hover:-translate-y-0.5 hover:border-black/20 hover:shadow-[0_16px_60px_rgba(0,0,0,0.12)]",
    buttonPrimary:
      "text-white bg-[#0B0B0F] hover:bg-[#14141b] ring-2 ring-black/0 hover:ring-black/10 shadow-lg shadow-black/10",
    buttonGhost: "text-[#0B0B0F] bg-white hover:bg-[#f1f2f6] ring-1 ring-black/10",
    divider: "border-black/10",
    glowBorder: "from-[#0B0B0F]/35 via-[#0B0B0F]/10 to-transparent",
  },
};

const Section = ({ id, className = "", children }) => (
  <section id={id} className={`relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </section>
);

const Badge = ({ children, tone }) => (
  <span className={`inline-flex items-center gap-1 rounded-full ${tone.chipRing} ${tone.chipBg} px-3 py-1 text-xs ${tone.textMuted} backdrop-blur`}>{children}</span>
);

const PrimaryButton = ({ children, tone, href, to, onClick }) => {
  const cls = `inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition ${tone.buttonPrimary}`;
  return to ? (
    <Link to={to} onClick={onClick} className={cls}>{children}</Link>
  ) : (
    <a href={href || "#"} onClick={onClick} className={cls}>{children}</a>
  );
};

const GhostButton = ({ children, tone, href, to }) => {
  const cls = `inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition ${tone.buttonGhost}`;
  return to ? (
    <Link to={to} className={cls}>{children}</Link>
  ) : (
    <a href={href || "#"} className={cls}>{children}</a>
  );
};

// ✨ Card with hover glow ring & gentle scale
const Card = ({ tone, className = "", children }) => (
  <div className={`group relative overflow-hidden ${tone.card} transition-all duration-300 ${tone.cardHover} ${className}`}>
    {/* soft border light on hover */}
    <div className={`pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
      <div className={`absolute inset-0 rounded-3xl ring-1 ring-white/0 group-hover:ring-white/25`}></div>
      <div className={`absolute -inset-[1px] rounded-3xl bg-gradient-to-b ${tone.glowBorder} blur-[6px]`}></div>
    </div>
    {/* inner glow wash for dark */}
    <div
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{ background: "radial-gradient(120px 80px at 80% 20%, rgba(255,255,255,0.12), transparent 60%)" }}
    />
    {children}
  </div>
);

const Blob = ({ className = "" }) => (
  <motion.div aria-hidden initial={{ opacity: 0.3 }} animate={{ opacity: [0.25, 0.4, 0.25], scale: [1, 1.06, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className={`pointer-events-none absolute blur-3xl ${className}`} />
);

function ReadingDemo({ tone }) {
  const text = useMemo(() => "Photosynthesis is how plants turn sunlight into food. Leaves collect light, roots drink water, and the plant mixes them to make energy.", []);
  const words = text.split(" ");
  const [index, setIndex] = useState(0);
  useEffect(() => { const id = setInterval(() => setIndex((i) => (i + 1) % words.length), 550); return () => clearInterval(id); }, [words.length]);
  return (
    <Card tone={tone} className="mt-4">
      <div className="flex items-center justify-between">
        <Badge tone={tone}><Volume2 className="h-3.5 w-3.5" />Read‑aloud • word highlight</Badge>
        <div className={`flex items-center gap-2 text-xs ${tone.textMuted}`}><Type className="h-4 w-4" /><span>OpenDyslexic / +Spacing / Ruler</span></div>
      </div>
      <p className={`mt-3 leading-7 ${tone.text} [word-spacing:0.15em]`}>
        {words.map((w, i) => (
          <span key={i} className={`rounded-md px-0.5 py-0.5 transition-colors ${i === index ? "bg-amber-300/80 text-black" : "bg-transparent"}`}>{w}{i !== words.length - 1 ? " " : ""}</span>
        ))}
      </p>
      <div className={`relative mt-4 h-1.5 w-full rounded-full ${tone.border.replace("border-", "bg-")}`}>
        <motion.div className="absolute left-0 top-0 h-1.5 rounded-full bg-current" initial={{ width: 0 }} animate={{ width: `${((index + 1) / words.length) * 100}%` }} transition={{ type: "spring", stiffness: 70, damping: 20 }} />
      </div>
    </Card>
  );
}

function UploadDemo({ tone }) {
  return (
    <Card tone={tone} className="mt-6">
      <div className="flex items-center gap-3">
        <Upload className="h-5 w-5" />
        <div>
          <p className={`text-sm font-semibold ${tone.text}`}>Drop doc/PDF/image</p>
          <p className={`text-xs ${tone.textMuted}`}>OCR → simplify → read aloud</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        {[".pdf", ".docx", ".png"].map((t) => (
          <div key={t} className={`rounded-xl ${tone.border} ${tone.chipBg} px-3 py-2 ${tone.textMuted}`}>sample{t}</div>
        ))}
      </div>
    </Card>
  );
}

const Feature = ({ Icon, title, desc, tone }) => (
  <motion.div initial={{ y: 16, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }} viewport={{ once: true, margin: "-100px" }}>
    <Card tone={tone} className="h-full">
      <div className="flex items-center gap-3">
        <div className={`rounded-2xl ${tone.chipBg} p-3 transition-colors duration-300`}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className={`text-base font-semibold ${tone.text}`}>{title}</h3>
      </div>
      <p className={`mt-3 text-sm leading-6 ${tone.textMuted}`}>{desc}</p>
    </Card>
  </motion.div>
);

function Navbar({ tone, dark, toggleTheme }) {
  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`mt-4 rounded-2xl ${tone.border} ${tone.panelBg} px-4 py-3 backdrop-blur`}>
          <div className="flex items-center justify-between">
            {/* Brand → route to home */}
            <Link to="/" className="flex items-center gap-2">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${dark ? "bg-white text-black" : "bg-[#0B0B0F] text-white"} font-black`}>R</div>
              <span className={`text-sm font-semibold tracking-wide ${tone.text}`}>Readease</span>
            </Link>

            {/* Keep section anchors as anchors (same-page scroll) */}
            <nav className={`hidden md:flex items-center gap-6 text-sm ${tone.textMuted}`}>
              <a href="#features" className="hover:opacity-100 opacity-90 transition">Features</a>
              <a href="#schools" className="hover:opacity-100 opacity-90 transition">Schools</a>
              <a href="#teachers" className="hover:opacity-100 opacity-90 transition">Teachers</a>
              <a href="#privacy" className="hover:opacity-100 opacity-90 transition">Privacy</a>
            </nav>

            <div className="flex items-center gap-2">
              <button
                aria-label="Toggle theme"
                onClick={toggleTheme}
                className={`inline-flex items-center justify-center rounded-2xl px-3 py-3 text-sm font-semibold transition ${tone.buttonGhost}`}
                title={dark ? "Switch to light" : "Switch to dark"}
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* Auth buttons → route to pages */}
              <GhostButton tone={tone} to="/login">Log in</GhostButton>
              <PrimaryButton tone={tone} to="/signup">Get started</PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function Hero({ tone }) {
  return (
    <div className="relative overflow-hidden">
      <Blob className="-top-24 left-[-10%] h-[26rem] w-[26rem] bg-gradient-to-br from-amber-500/40 via-fuchsia-500/30 to-cyan-500/30" />
      <Blob className="top-[30%] right-[-10%] h-[28rem] w-[28rem] bg-gradient-to-br from-cyan-500/30 via-emerald-400/30 to-indigo-500/30" />

      <Section id="home" className="pt-36 pb-14">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge tone={tone}><Sparkles className="h-3.5 w-3.5" />Accessibility‑first learning platform</Badge>
              <Badge tone={tone}><Cloud className="h-3.5 w-3.5" />Low‑bandwidth support</Badge>
            </div>
            <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} className={`text-3xl sm:text-5xl font-extrabold tracking-tight ${tone.text}`}>
              Make every page readable for dyslexic learners
            </motion.h1>
            <p className={`mt-4 max-w-xl text-base sm:text-lg leading-7 ${tone.textMuted}`}>
              Upload any document, image, or webpage. Readease performs OCR, simplifies to the right reading level, and reads aloud with word‑level highlighting—plus dyslexia‑friendly fonts, spacing, color overlays, and a reading ruler.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <PrimaryButton tone={tone} href="/Signup">Get started</PrimaryButton>
              <GhostButton tone={tone} href="/Login">Log in</GhostButton>
            </div>
            <div className={`mt-6 flex items-center gap-4 text-xs ${tone.textMuted}`}>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Role‑based access & audit</div>
              <div className="flex items-center gap-2"><Lock className="h-4 w-4" />Privacy‑first</div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="relative">
            <Card tone={tone} className="relative overflow-hidden p-6">
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <h3 className={`text-sm font-semibold ${tone.text}`}>Reader</h3>
                  <ReadingDemo tone={tone} />
                </div>
                <div>
                  <h3 className={`text-sm font-semibold ${tone.text}`}>Upload</h3>
                  <UploadDemo tone={tone} />
                  <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className={`rounded-xl ${tone.chipBg} p-3 ${tone.textMuted}`}><Type className="mx-auto mb-1 h-4 w-4" />Dyslexic font</div>
                    <div className={`rounded-xl ${tone.chipBg} p-3 ${tone.textMuted}`}><Ruler className="mx-auto mb-1 h-4 w-4" />Reading ruler</div>
                    <div className={`rounded-xl ${tone.chipBg} p-3 ${tone.textMuted}`}><Highlighter className="mx-auto mb-1 h-4 w-4" />Overlay colors</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </Section>
    </div>
  );
}

function Features({ tone }) {
  const items = [
    { Icon: Upload, title: "Any file or page", desc: "Docs, PDFs, images, and webpages—OCR extracts clean text for reading and analysis." },
    { Icon: BookOpen, title: "Adaptive simplification", desc: "Match reading level per student; reduce jargon, split long sentences, and add glossaries." },
    { Icon: Volume2, title: "TTS with highlighting", desc: "Natural voices with word‑level sync, pause/pace controls, and offline caching." },
    { Icon: Type, title: "Dyslexia‑friendly UI", desc: "OpenDyslexic, extra letter‑spacing, color overlays, and a movable reading ruler." },
    { Icon: Gauge, title: "Live learning signals", desc: "See where readers slow down, misclick, or re‑read; surface vocabulary pain points." },
    { Icon: ClipboardList, title: "Quizzes & accommodations", desc: "Schedule by section; set extra time, forced TTS, simplified wording; auto‑grade objective items." },
    { Icon: Brain, title: "Personalized practice", desc: "Spaced review and adaptive assignments to reinforce comprehension over time." },
    { Icon: Cloud, title: "Low‑bandwidth mode", desc: "Smart caching and prefetch keep reading smooth even with spotty internet." },
  ];
  return (
    <Section id="features" className="py-20">
      <motion.h2 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className={`text-center text-2xl sm:text-4xl font-extrabold ${tone.text}`}>Built for accessibility. Designed for outcomes.</motion.h2>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p, i) => (<Feature key={i} {...p} tone={tone} />))}
      </div>
    </Section>
  );
}

function SchoolsTeachers({ tone }) {
  return (
    <Section id="schools" className="py-16">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card tone={tone}>
          <div className="flex items-center gap-3">
            <div className={`rounded-2xl ${tone.chipBg} p-3`}><School className="h-6 w-6" /></div>
            <h3 className={`text-lg font-semibold ${tone.text}`}>One‑time school onboarding</h3>
          </div>
          <p className={`mt-3 text-sm leading-6 ${tone.textMuted}`}>Connect rosters/LMS once. Students register under their school and section, then use Readease daily on any device at school or home.</p>
          <ul className={`mt-4 grid gap-2 text-sm ${tone.textMuted}`}>
            <li className="flex items-center gap-2"><Users className="h-4 w-4" /> SSO / roster sync</li>
            <li className="flex items-center gap-2"><Cloud className="h-4 w-4" /> Caching for lab devices</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Role‑based access + audit log</li>
          </ul>
        </Card>
        <Card tone={tone} id="teachers">
          <div className="flex items-center gap-3">
            <div className={`rounded-2xl ${tone.chipBg} p-3`}><Gauge className="h-6 w-6" /></div>
            <h3 className={`text-lg font-semibold ${tone.text}`}>Teacher dashboard & interventions</h3>
          </div>
          <p className={`mt-3 text-sm leading-6 ${tone.textMuted}`}>See hotspots where students are stuck, assign quick vocabulary help, or offer enrichment to those ready to go further.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {["Stuck on vocabulary: 7", "Reread paragraphs: 12", "High performers: 5"].map((t, i) => (
              <div key={i} className={`rounded-2xl ${tone.border} ${tone.chipBg} px-4 py-3 text-sm ${tone.textMuted}`}>{t}</div>
            ))}
          </div>
        </Card>
      </div>
    </Section>
  );
}

function Assessments({ tone }) {
  return (
    <Section id="assessments" className="py-16">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card tone={tone}>
          <div className="flex items-center gap-3">
            <div className={`rounded-2xl ${tone.chipBg} p-3`}><ClipboardList className="h-6 w-6" /></div>
            <h3 className={`text-lg font-semibold ${tone.text}`}>Quizzes with built‑in accommodations</h3>
          </div>
          <p className={`mt-3 text-sm leading-6 ${tone.textMuted}`}>Schedule by section with windows and durations. Auto‑grade objective items and use rubrics for short answers. Options for extra time, simplified wording, and enforced read‑aloud.</p>
        </Card>
        <Card tone={tone}>
          <div className="flex items-center gap-3">
            <div className={`rounded-2xl ${tone.chipBg} p-3`}><Timer className="h-6 w-6" /></div>
            <h3 className={`text-lg font-semibold ${tone.text}`}>Spaced review & mastery</h3>
          </div>
          <p className={`mt-3 text-sm leading-6 ${tone.textMuted}`}>Adaptive practice revisits trouble spots at the right time to build long‑term retention and confidence.</p>
        </Card>
      </div>
    </Section>
  );
}

function Privacy({ tone }) {
  return (
    <Section id="privacy" className="py-20">
      <div className="mx-auto max-w-3xl text-center">
        <div className={`inline-flex items-center gap-2 rounded-full ${tone.chipRing} ${tone.chipBg} px-3 py-1 text-xs ${tone.textMuted} backdrop-blur`}><ShieldCheck className="h-3.5 w-3.5" /> Privacy & consent by design</div>
        <h2 className={`mt-4 text-2xl sm:text-4xl font-extrabold ${tone.text}`}>Data‑minimized. Auditable. School‑controlled.</h2>
        <p className={`mt-4 ${tone.textMuted}`}>Readease stores only what’s necessary. Access is role‑based, with full audit trails. Admins can export or purge data at any time.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3 text-left">
          {["Role‑based access", "Granular consent", "Audit logs", "Roster/LMS integration", "Regional hosting", "Parent visibility"].map((t, i) => (
            <div key={i} className={`rounded-2xl ${tone.border} ${tone.chipBg} px-4 py-3 text-sm ${tone.textMuted}`}>{t}</div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function CTA({ tone }) {
  return (
    <Section id="signup" className="py-16">
      <Card tone={tone} className="flex flex-col items-center text-center p-8">
        <h3 className={`text-xl sm:text-2xl font-extrabold ${tone.text}`}>
          Ready to make every page readable?
        </h3>
        <p className={`mt-2 max-w-2xl ${tone.textMuted}`}>
          Start with a pilot at your school. Onboard classes in minutes and see measurable gains in comprehension and retention.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {/* Route to pages */}
          <PrimaryButton tone={tone} to="/signup">Get started</PrimaryButton>
          <GhostButton tone={tone} to="/login">Log in</GhostButton>
          {/* Optional: direct link into the app */}
          {/* <PrimaryButton tone={tone} to="/simplify">Try the Simplifier</PrimaryButton> */}
        </div>
      </Card>
    </Section>
  );
}


function Footer({ tone }) {
  return (
    <footer className={`mt-10 border-t ${tone.divider} ${tone.panelBg}`}>
      <Section className="py-10">
        <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-sm ${tone.textMuted}`}>
          <div>
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${tone.pageBg.includes('#0B0B0F') ? 'bg-white text-black' : 'bg-[#0B0B0F] text-white'} font-black`}>R</div>
              <span className={`font-semibold ${tone.text}`}>Readease</span>
            </div>
            <p className="mt-3">Accessibility‑first learning for dyslexic readers.</p>
          </div>
          <div>
            <h4 className={`font-semibold ${tone.text}`}>Product</h4>
            <ul className="mt-2 space-y-1">
              <li><a href="#features" className="hover:opacity-100 opacity-90">Features</a></li>
              <li><a href="#assessments" className="hover:opacity-100 opacity-90">Assessments</a></li>
              <li><a href="#privacy" className="hover:opacity-100 opacity-90">Privacy</a></li>
            </ul>
          </div>
          <div>
            <h4 className={`font-semibold ${tone.text}`}>For Schools</h4>
            <ul className="mt-2 space-y-1">
              <li><a href="#schools" className="hover:opacity-100 opacity-90">Onboarding</a></li>
              <li><a href="#teachers" className="hover:opacity-100 opacity-90">Teacher dashboard</a></li>
              <li><a href="#signup" className="hover:opacity-100 opacity-90">Get started</a></li>
            </ul>
          </div>
          <div>
            <h4 className={`font-semibold ${tone.text}`}>Legal</h4>
            <ul className="mt-2 space-y-1">
              <li><a href="#" className="hover:opacity-100 opacity-90">Terms</a></li>
              <li><a href="#" className="hover:opacity-100 opacity-90">Privacy</a></li>
              <li><a href="#" className="hover:opacity-100 opacity-90">Accessibility</a></li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-center text-xs opacity-60">© {new Date().getFullYear()} Readease. All rights reserved.</p>
      </Section>
    </footer>
  );
}

export default function ReadeaseLanding_HoverGlow() {
  const [dark, setDark] = useState(true);
  const tone = dark ? TOKENS.dark : TOKENS.light;
  return (
    <div className={`min-h-screen w-full ${tone.pageBg} ${tone.text}`}>
      <div className={`pointer-events-none fixed inset-0 ${tone.starfield}`} />
      <Navbar tone={tone} dark={dark} toggleTheme={() => setDark((d) => !d)} />
      <main>
        <Hero tone={tone} />
        <Features tone={tone} />
        <SchoolsTeachers tone={tone} />
        <Assessments tone={tone} />
        <Privacy tone={tone} />
        <CTA tone={tone} />
      </main>
      <Footer tone={tone} />
    </div>
  );
}
