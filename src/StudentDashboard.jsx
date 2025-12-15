import React from "react";
import { motion } from "framer-motion";
import {
  Sun, Moon,
  Upload, ClipboardList, MessageSquare, NotebookPen,
  Sparkles, Timer, Headphones, Gauge, CalendarDays,
  ArrowRight, Settings, PlayCircle, FileText, FolderOpen, User2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ==============================================
// Readease – Student Dashboard (final)
// - Four quick tiles route via SPA navigation
// - KPI cards
// - Continue Reading + Last Chat
// - Minimal navbar with theme toggle
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
      "rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-[0_8px_30px_rgba(0,0,0,0.12)]",
    cardHover: "hover:-translate-y-1 hover:border-white/20",
    buttonPrimary:
      "text-black bg-white hover:bg-white/90 ring-2 ring-white/0 hover:ring-white/30 shadow-lg shadow-black/10",
    buttonGhost: "text-white/90 bg-white/0 hover:bg-white/10 ring-1 ring-white/15",
    divider: "border-white/10",
    glowBorder: "from-white/40 via-white/10 to-transparent",
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
      "rounded-3xl border border-black/10 bg-white backdrop-blur shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
    cardHover: "hover:-translate-y-1 hover:border-black/20",
    buttonPrimary:
      "text-white bg-[#0B0B0F] hover:bg-[#14141b] ring-2 ring-black/0 hover:ring-black/10 shadow-lg shadow-black/10",
    buttonGhost: "text-[#0B0B0F] bg-white hover:bg-[#f1f2f6] ring-1 ring-black/10",
    divider: "border-black/10",
    glowBorder: "from-[#0B0B0F]/30 via-[#0B0B0F]/10 to-transparent",
  },
};

const Section = ({ className = "", children }) => (
  <section className={`relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{children}</section>
);

const Card = ({ tone, className = "", children, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    transition={{ type: "spring", stiffness: 220, damping: 20 }}
    className={`group relative overflow-hidden ${tone.card} ${tone.cardHover} transition-all duration-300 ${onClick ? "cursor-pointer" : ""} ${className}`}
    onClick={onClick}
  >
    {/* soft glow */}
    <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity">
      <div className={`absolute -inset-[1px] rounded-3xl bg-gradient-to-b ${tone.glowBorder} blur-[6px]`} />
    </div>
    {children}
  </motion.div>
);

const Button = ({ tone, children, variant = "primary", className = "", ...props }) => {
  const base = "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2";
  const styles = variant === "primary" ? tone.buttonPrimary : tone.buttonGhost;
  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
};

function Navbar({ tone, dark, toggleTheme }) {
  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`mt-4 rounded-2xl ${tone.border} ${tone.panelBg} px-4 py-3 backdrop-blur`}>
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${dark ? "bg-white text-black" : "bg-[#0B0B0F] text-white"} font-black`}>R</div>
              <span className={`text-sm font-semibold tracking-wide ${tone.text}`}>Readease</span>
            </a>
            <div className="flex items-center gap-2">
              <a href="/profile" className={`inline-flex items-center justify-center h-10 w-10 rounded-2xl ${tone.buttonGhost}`} title="Profile">
                <User2 className="h-5 w-5" />
              </a>
              <button
                aria-label="Toggle theme"
                onClick={toggleTheme}
                className={`inline-flex items-center justify-center rounded-2xl px-3 py-3 text-sm font-semibold transition ${tone.buttonGhost}`}
                title={dark ? "Switch to light" : "Switch to dark"}
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const [dark, setDark] = React.useState(() => {
    const saved = localStorage.getItem("readease-theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return true;
  });
  const tone = dark ? TOKENS.dark : TOKENS.light;
  const navigate = useNavigate();

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("readease-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className={`min-h-screen ${tone.pageBg} ${tone.text}`}>
      <div className={`pointer-events-none fixed inset-0 ${tone.starfield}`} />
      <Navbar tone={tone} dark={dark} toggleTheme={() => setDark((d) => !d)} />

      {/* Welcome */}
      <Section className="pt-36 pb-6">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className={`inline-flex items-center gap-2 rounded-full ${tone.chipRing} ${tone.chipBg} px-3 py-1 text-xs ${tone.textMuted} backdrop-blur`}>
              <Sparkles className="h-3.5 w-3.5" /> Welcome back
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold">Good morning</h1>
            <p className={`mt-2 ${tone.textMuted}`}>Choose where to go next.</p>
          </div>
        </div>
      </Section>

      {/* Four Quick Tiles */}
      <Section className="pb-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Simplify a Document → /simplify */}
          <Card tone={tone} className="p-5" onClick={() => navigate("/simplify")}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold">Simplify a document</p>
                <p className={`mt-1 text-xs ${tone.textMuted}`}>Upload doc/PDF/image/webpage → OCR + simplify + TTS</p>
              </div>
              <Upload className="h-5 w-5 opacity-80" />
            </div>
            <div className="mt-4">
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${tone.chipBg} ${tone.border}`}>
                Start now <ArrowRight className="h-3.5 w-3.5"/>
              </span>
            </div>
          </Card>

          {/* Upcoming Quizzes → /quizzes */}
          <Card tone={tone} className="p-5" onClick={() => navigate("/quizzes")}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold">Upcoming quizzes</p>
                <p className={`mt-1 text-xs ${tone.textMuted}`}>See due dates and accommodations</p>
              </div>
              <ClipboardList className="h-5 w-5 opacity-80" />
            </div>
            <div className={`mt-4 text-xs ${tone.textMuted}`}>Next: Vocab Unit 3 — Today 5:00 PM</div>
          </Card>

          {/* Chat & Doubts → /chat */}
          <Card tone={tone} className="p-5" onClick={() => navigate("/chat")}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold">Chat & clear doubts</p>
                <p className={`mt-1 text-xs ${tone.textMuted}`}>Ask teachers or classmates in your section</p>
              </div>
              <MessageSquare className="h-5 w-5 opacity-80" />
            </div>
            <div className="mt-4">
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${tone.chipBg} ${tone.border}`}>
                Open chat
              </span>
            </div>
          </Card>

          {/* Notes from Teacher → /notes */}
          <Card tone={tone} className="p-5" onClick={() => navigate("/notes")}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold">Notes from teacher</p>
                <p className={`mt-1 text-xs ${tone.textMuted}`}>Slides, PDFs, and links shared with your class</p>
              </div>
              <NotebookPen className="h-5 w-5 opacity-80" />
            </div>
            <div className="mt-4 text-xs">2 new notes added</div>
          </Card>
        </div>
      </Section>

      {/* KPIs */}
      <Section className="pb-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <Timer className="h-5 w-5" />, title: "Reading time", value: "42 min", sub: "+12 today" },
            { icon: <Headphones className="h-5 w-5" />, title: "TTS minutes", value: "28 min", sub: "+7 today" },
            { icon: <Gauge className="h-5 w-5" />, title: "Docs uploaded", value: "17", sub: "total uploaded" },
            { icon: <CalendarDays className="h-5 w-5" />, title: "Days logged in", value: "23", sub: "this month" },
          ].map((kpi, i) => (
            <Card key={i} tone={tone} className="p-5">
              <div className={`flex items-center justify-between ${tone.text}`}>
                <div className="flex items-center gap-2 opacity-80">
                  {kpi.icon}
                  <span className="text-sm font-semibold">{kpi.title}</span>
                </div>
              </div>
              <div className="mt-3 text-2xl font-extrabold">{kpi.value}</div>
              <div className={`mt-1 text-xs ${tone.textMuted}`}>{kpi.sub}</div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Continue reading + Last chat */}
      <Section className="pb-8">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card tone={tone} className="p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Continue reading</h2>
              <Button tone={tone} variant="ghost" onClick={() => navigate("/simplify")}>
                Open reader <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { title: "Photosynthesis basics", progress: 0.65, meta: "Science • 2 pages left" },
                { title: "The Water Cycle", progress: 0.3, meta: "Geography • 5 pages left" },
              ].map((item, i) => (
                <div key={i} className={`rounded-2xl ${tone.chipBg} ${tone.border} p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className={`text-xs ${tone.textMuted}`}>{item.meta}</p>
                    </div>
                    <PlayCircle className="h-5 w-5 opacity-80" />
                  </div>
                  <div className={`mt-3 h-2 w-full rounded-full ${tone.border.replace("border-", "bg-")}`}>
                    <motion.div
                      className="h-2 rounded-full bg-current"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress * 100}%` }}
                      transition={{ type: "spring", stiffness: 70, damping: 18 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Last chat */}
          <Card tone={tone} className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Last chat</h2>
              <span className={`text-xs ${tone.textMuted}`}>Today • 11:10 AM</span>
            </div>
            <div className={`mt-3 rounded-2xl ${tone.chipBg} ${tone.border} p-4`}>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MessageSquare className="h-4 w-4" /> Section 8A – Science
              </div>
              <p className={`mt-2 text-sm ${tone.textMuted}`}>
                Teacher: "For Q2, focus on how sunlight affects the chlorophyll…"
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <Button tone={tone} onClick={() => navigate("/chat")}>Continue chat</Button>
              <Button tone={tone} variant="ghost" onClick={() => navigate("/chat")}>Open inbox</Button>
            </div>
          </Card>
        </div>
      </Section>

      {/* Assignments & Recent */}
      <Section className="pb-20">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card tone={tone} className="p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Assignments</h2>
              <Button tone={tone} variant="ghost" onClick={() => navigate("/quizzes")}>
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 grid gap-3">
              {[
                { title: "Vocabulary check – Unit 3", due: "Today, 5:00 PM", acc: "Extra time available" },
                { title: "Reading comprehension – Ecosystems", due: "Tomorrow, 10:00 AM", acc: "TTS enforced" },
              ].map((a, i) => (
                <div key={i} className={`rounded-2xl ${tone.chipBg} ${tone.border} p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{a.title}</p>
                      <p className={`text-xs ${tone.textMuted}`}>{a.due} • {a.acc}</p>
                    </div>
                    <FileText className="h-5 w-5 opacity-80" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card tone={tone} className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recently read</h2>
              <Button tone={tone} variant="ghost" onClick={() => navigate("/simplify")}>
                Open library <FolderOpen className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              {["Solar System – overview.pdf", "Photosynthesis.png", "The Water Cycle.docx"].map((f, i) => (
                <div key={i} className={`rounded-2xl ${tone.chipBg} ${tone.border} px-4 py-3 flex items-center justify-between`}>
                  <span className="truncate pr-3">{f}</span>
                  <ArrowRight className="h-4 w-4 opacity-70" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      <footer className={`border-t ${tone.divider} ${tone.panelBg}`}>
        <Section className="py-6">
          <div className={`text-xs ${tone.textMuted}`}>© {new Date().getFullYear()} Readease • Student Dashboard</div>
        </Section>
      </footer>
    </div>
  );
}
