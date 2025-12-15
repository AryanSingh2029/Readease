import React from "react";
import { motion } from "framer-motion";
import {
  Sun, Moon, ArrowLeft, Send,
  ShieldCheck, MessageSquare, CheckCircle2, RefreshCw
} from "lucide-react";
import { supabase } from "./supabaseClient";

// ==============================================
// Readease – Chat & Doubts (Student → School)
// Single chat box; sends to Supabase (school_doubts)
// Keeps your original UI styling/tokens/components
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
    cardHover: "hover:-translate-y-0.5 hover:border-white/20",
    buttonPrimary:
      "text-black bg-white hover:bg-white/90 ring-2 ring-white/0 hover:ring-white/30 shadow-lg shadow-black/10",
    buttonGhost: "text-white/90 bg-white/0 hover:bg-white/10 ring-1 ring-white/15",
    divider: "border-white/10",
    glowBorder: "from-white/40 via-white/10 to-transparent",
    inputBg: "bg-white/5",
    inputText: "text-white",
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
    cardHover: "hover:-translate-y-0.5 hover:border-black/20",
    buttonPrimary:
      "text-white bg-[#0B0B0F] hover:bg-[#14141b] ring-2 ring-black/0 hover:ring-black/10 shadow-lg shadow-black/10",
    buttonGhost: "text-[#0B0B0F] bg-white hover:bg-[#f1f2f6] ring-1 ring-black/10",
    divider: "border-black/10",
    glowBorder: "from-[#0B0B0F]/30 via-[#0B0B0F]/10 to-transparent",
    inputBg: "bg-white",
    inputText: "text-[#0B0B0F]",
  },
};

const Section = ({ className = "", children }) => (
  <section className={`relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{children}</section>
);

const Card = ({ tone, className = "", children, ...props }) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    transition={{ type: "spring", stiffness: 220, damping: 20 }}
    className={`group relative overflow-hidden ${tone.card} ${tone.cardHover} transition-all duration-300 ${className}`}
    {...props}
  >
    {/* soft glow */}
    <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity">
      <div className={`absolute -inset-[1px] rounded-3xl bg-gradient-to-b ${tone.glowBorder} blur-[6px]`} />
    </div>
    {children}
  </motion.div>
);

const Button = ({ tone, children, variant = "primary", className = "", disabled=false, ...props }) => {
  const base = `inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`;
  const styles = variant === "primary" ? tone.buttonPrimary : tone.buttonGhost;
  return (
    <button className={`${base} ${styles} ${className}`} disabled={disabled} {...props}>
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
            <div className="flex items-center gap-2">
              <Button tone={tone} variant="ghost" onClick={() => window.history.back()}>
                <ArrowLeft className="mr-2 h-4 w-4"/> Back
              </Button>
              <a href="/" className="flex items-center gap-2">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone.pageBg.includes('#0B0B0F') ? 'bg-white text-black' : 'bg-[#0B0B0F] text-white'} font-black`}>R</div>
                <span className={`text-sm font-semibold tracking-wide`}>Readease</span>
              </a>
            </div>
            <div className="flex items-center gap-2">
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

const StatusPill = ({ tone, status }) => {
  const base = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] border";
  if (status === "replied") return <span className={`${base} border-emerald-500/30 bg-emerald-500/15`}><CheckCircle2 className="h-3.5 w-3.5"/> Replied</span>;
  if (status === "seen") return <span className={`${base} border-indigo-500/30 bg-indigo-500/15`}>Seen</span>;
  if (status === "error") return <span className={`${base} border-red-500/30 bg-red-500/15`}>Error</span>;
  return <span className={`${base} border-yellow-500/30 bg-yellow-500/15`}>New</span>;
};

function MessageBubble({ tone, row, me=false }){
  const align = me ? "items-end" : "items-start";
  const bg = me ? "bg-emerald-500/20 border border-emerald-400/30" : `${tone.chipBg} ${tone.border}`;
  return (
    <div className={`flex ${align}`}>
      <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${bg}`}>
        <div className="text-[11px] opacity-70 mb-0.5">
          {me ? "You" : "School"} • {new Date((me ? row.created_at : row.updated_at || row.created_at)).toLocaleString()}
        </div>
        <div className="leading-6 whitespace-pre-wrap">{me ? row.message : (row.reply || "")}</div>
        {me && (
          <div className="mt-1"><StatusPill tone={tone} status={row.status}/></div>
        )}
      </div>
    </div>
  );
}

export default function ChatDoubts(){
  const [dark, setDark] = React.useState(() => {
    const saved = localStorage.getItem("readease-theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return true;
  });
  const tone = dark ? TOKENS.dark : TOKENS.light;

  const [user, setUser] = React.useState(null);
  const [profile, setProfile] = React.useState(null); // { school, grade, full_name? }
  const [draft, setDraft] = React.useState("");
  const [items, setItems] = React.useState([]); // rows from school_doubts
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("readease-theme", dark ? "dark" : "light");
  }, [dark]);

  // Load current user, profile and doubts
  React.useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: udata } = await supabase.auth.getUser();
      const u = udata?.user || null;
      setUser(u);

      if (u) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("school, grade, full_name")
          .eq("id", u.id)
          .single();
        setProfile(prof || null);

        const { data: rows } = await supabase
          .from("school_doubts")
          .select("id,message,status,reply,created_at,updated_at")
          .eq("user_id", u.id)
          .order("created_at", { ascending: false });
        setItems(rows || []);
      }
      setLoading(false);
    })();
  }, []);

  // Optional: Poll every 10s for updates
  React.useEffect(() => {
    if (!user) return;
    const i = setInterval(async () => {
      const { data: rows } = await supabase
        .from("school_doubts")
        .select("id,message,status,reply,created_at,updated_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setItems(rows || []);
    }, 10000);
    return () => clearInterval(i);
  }, [user]);

  async function refreshNow(){
    if (!user) return;
    setRefreshing(true);
    const { data: rows } = await supabase
      .from("school_doubts")
      .select("id,message,status,reply,created_at,updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setItems(rows || []);
    setRefreshing(false);
  }

  function nowLabel(){
    const d = new Date();
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  async function send(){
    const text = draft.trim();
    if (!text || sending || !user || !profile?.school || !profile?.grade) return;

    setSending(true);

    // optimistic row
    const optimistic = {
      id: `tmp-${Math.random().toString(36).slice(2)}`,
      message: text,
      status: "new",
      reply: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      _optimistic: true,
      at: nowLabel(),
    };
    setItems((prev)=>[optimistic, ...prev]);
    setDraft("");

    const { data, error } = await supabase
      .from("school_doubts")
      .insert({
        user_id: user.id,
        school: profile.school,
        grade: profile.grade,
        message: text,
        status: "new",
      })
      .select("id,message,status,reply,created_at,updated_at")
      .single();

    if (error) {
      // rollback + show error row
      setItems((prev)=>prev.filter(r=>r.id !== optimistic.id));
      setItems((prev)=>[
        {
          ...optimistic,
          id: `err-${Math.random().toString(36).slice(2)}`,
          status: "error",
          message: `Failed to send: ${text}`,
          _optimistic: false,
        },
        ...prev
      ]);
    } else {
      // replace optimistic with real
      setItems((prev)=>{
        const without = prev.filter(r=>r.id !== optimistic.id);
        return [data, ...without];
      });
    }

    setSending(false);
  }

  return (
    <div className={`min-h-screen ${tone.pageBg} ${tone.text}`}>
      <div className={`pointer-events-none fixed inset-0 ${tone.starfield}`} />
      <Navbar tone={tone} dark={dark} toggleTheme={() => setDark(d => !d)} />

      {/* Header */}
      <Section className="pt-36 pb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className={`inline-flex items-center gap-2 rounded-full ${tone.chipRing} ${tone.chipBg} px-3 py-1 text-xs ${tone.textMuted} backdrop-blur`}>
              <MessageSquare className="h-3.5 w-3.5"/> Doubts • Sent to School
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold">Ask questions. Your school will reply here.</h1>
            <p className={`mt-2 ${tone.textMuted}`}>
              Protected by school policy • <ShieldCheck className="inline h-4 w-4 mr-1"/> Moderated by staff.
            </p>
          </div>
          <Button tone={tone} variant="primary" onClick={refreshNow} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin": ""}`}/> Refresh
          </Button>
        </div>
      </Section>

      {/* Single Chat Box */}
      <Section className="pb-20">
        <Card tone={tone} className="flex min-h-[60vh] flex-col">
          {/* Top banner with identity */}
          <div className="p-4 border-b border-white/10">
            {loading ? (
              <div className={`text-sm ${tone.textMuted}`}>Loading your profile…</div>
            ) : user && profile ? (
              <div className="text-sm">
                Signed in as <b>{profile.full_name || user.email}</b> • School: <b>{profile.school}</b> • Grade: <b>{profile.grade}</b>
              </div>
            ) : (
              <div className={`text-sm ${tone.textMuted}`}>Please sign in to send a doubt.</div>
            )}
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className={`text-sm ${tone.textMuted}`}>No messages yet. Type below to contact your school.</div>
            ) : (
              items.map((row)=>(
                <div key={row.id} className="space-y-2">
                  {/* your message */}
                  <MessageBubble tone={tone} row={row} me />
                  {/* school's reply (if any) */}
                  {row.reply ? <MessageBubble tone={tone} row={row} me={false} /> : null}
                </div>
              ))
            )}
          </div>

          {/* Composer */}
          <div className="p-3">
            <div className={`flex items-center gap-2 rounded-2xl ${tone.inputBg} ${tone.border} px-3 py-2`}>
              <input
                className={`flex-1 bg-transparent outline-none ${tone.inputText} text-sm`}
                placeholder="Type your message to school…"
                value={draft}
                onChange={(e)=>setDraft(e.target.value)}
                onKeyDown={(e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send(); } }}
                disabled={!user || !profile}
                aria-label="Message input"
              />
              <Button tone={tone} onClick={send} disabled={!draft.trim() || sending || !user || !profile}>
                <Send className="mr-2 h-4 w-4"/> Send
              </Button>
            </div>
            <div className={`mt-2 text-[11px] ${tone.textMuted}`}>
              Be kind and specific. Staff may respond during working hours.
            </div>
          </div>
        </Card>
      </Section>

      <footer className={`border-top ${tone.divider} ${tone.panelBg}`}>
        <Section className="py-6">
          <div className={`text-xs ${tone.textMuted}`}>© {new Date().getFullYear()} Readease • Doubts to School</div>
        </Section>
      </footer>
    </div>
  );
}
