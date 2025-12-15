import React from "react";
import { motion } from "framer-motion";
import {
  Sun, Moon, ArrowLeft, RefreshCw, MessageSquare, CheckCircle2, Eye,
  Send, Filter as FilterIcon, Search, ShieldCheck
} from "lucide-react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

/* Readease – School Doubts Inbox (robust to schema)
   Works with table: public.school_doubts
   Minimum columns: id, message, status, reply, created_at, updated_at
   Optional columns: user_id, school, grade  (auto-used when present)
*/

const TOKENS = {
  dark: {
    pageBg: "bg-[#0B0B0F]", text: "text-white", textMuted: "text-white/80",
    border: "border-white/10", chipBg: "bg-white/5", chipRing: "border-white/15",
    panelBg: "bg-black/40",
    starfield: "bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.06),transparent_60%)]",
    card: "rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-[0_8px_30px_rgba(0,0,0,0.12)]",
    cardHover: "hover:-translate-y-0.5 hover:border-white/20",
    buttonPrimary: "text-black bg-white hover:bg-white/90 ring-2 ring-white/0 hover:ring-white/30 shadow-lg shadow-black/10",
    buttonGhost: "text-white/90 bg-white/0 hover:bg-white/10 ring-1 ring-white/15",
    divider: "border-white/10", glowBorder: "from-white/40 via-white/10 to-transparent",
    inputBg: "bg-white/5", inputText: "text-white",
  },
  light: {
    pageBg: "bg-[#F7F8FB]", text: "text-[#0B0B0F]", textMuted: "text-[#0B0B0F]/70",
    border: "border-black/10", chipBg: "bg-white", chipRing: "border-black/10",
    panelBg: "bg-white/70",
    starfield: "bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.045),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.035),transparent_60%)]",
    card: "rounded-3xl border border-black/10 bg-white backdrop-blur shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
    cardHover: "hover:-translate-y-0.5 hover:border-black/20",
    buttonPrimary: "text-white bg-[#0B0B0F] hover:bg-[#14141b] ring-2 ring-black/0 hover:ring-black/10",
    buttonGhost: "text-[#0B0B0F] bg-white hover:bg-[#f1f2f6] ring-1 ring-black/10",
    divider: "border-black/10", glowBorder: "from-[#0B0B0F]/30 via-[#0B0B0F]/10 to-transparent",
    inputBg: "bg-white", inputText: "text-[#0B0B0F]",
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
    <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity">
      <div className={`absolute -inset-[1px] rounded-3xl bg-gradient-to-b ${tone.glowBorder} blur-[6px]`} />
    </div>
    {children}
  </motion.div>
);

const Button = ({ tone, children, variant = "primary", className = "", disabled=false, ...props }) => {
  const base = `inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`;
  const styles = variant === "primary" ? tone.buttonPrimary : tone.buttonGhost;
  return <button className={`${base} ${styles} ${className}`} disabled={disabled} {...props}>{children}</button>;
};

function Navbar({ tone, dark, toggleTheme }) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`mt-4 rounded-2xl ${tone.border} ${tone.panelBg} px-4 py-3 backdrop-blur`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button tone={tone} variant="ghost" onClick={() => navigate(-1)}>
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

const StatusPill = ({ status }) => {
  const base = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] border";
  if ((status || "").toLowerCase() === "replied") return <span className={`${base} border-emerald-500/30 bg-emerald-500/15`}><CheckCircle2 className="h-3.5 w-3.5"/> Replied</span>;
  if ((status || "").toLowerCase() === "seen") return <span className={`${base} border-indigo-500/30 bg-indigo-500/15`}><Eye className="h-3.5 w-3.5"/> Seen</span>;
  return <span className={`${base} border-yellow-500/30 bg-yellow-500/15`}>New</span>;
};

export default function SchoolDoubts(){
  const [dark, setDark] = React.useState(() => localStorage.getItem("readease-theme") !== "light");
  const tone = dark ? TOKENS.dark : TOKENS.light;

  const [profile, setProfile] = React.useState(null); // {id, role, school, full_name}
  const [loading, setLoading] = React.useState(true);
  const [errorText, setErrorText] = React.useState("");

  const [doubts, setDoubts] = React.useState([]);
  const [userMap, setUserMap] = React.useState({}); // id -> {full_name, grade, section}
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState("all"); // all | new | seen | replied
  const [replyDrafts, setReplyDrafts] = React.useState({});
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("readease-theme", dark ? "dark" : "light");
  }, [dark]);

  // Load current user profile (to confirm role)
  React.useEffect(() => {
    (async () => {
      setLoading(true);
      setErrorText("");
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not signed in.");
        const { data: prof, error } = await supabase
          .from("profiles")
          .select("id, role, school, full_name")
          .eq("id", user.id)
          .single();
        if (error) throw error;
        if ((prof?.role || "").toLowerCase() !== "school") throw new Error("Only school accounts can view the inbox.");
        setProfile(prof);
      } catch (e) {
        setErrorText(e.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fetchDoubts = React.useCallback(async () => {
    if (!profile) return;
    setRefreshing(true);
    setErrorText("");
    try {
      // Be schema-safe: select("*") and don't filter by school (RLS/policy may already scope rows).
      const { data, error } = await supabase
        .from("school_doubts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      setDoubts(data || []);

      // If user_id exists on rows, enrich names/grades
      const ids = [...new Set((data || []).map(r => r.user_id).filter(Boolean))];
      if (ids.length) {
        const { data: users, error: uerr } = await supabase
          .from("profiles")
          .select("id, full_name, grade, section")
          .in("id", ids);
        if (!uerr) {
          setUserMap(Object.fromEntries((users || []).map(u => [u.id, u])));
        }
      } else {
        setUserMap({});
      }

      // seed drafts once
      setReplyDrafts(prev => {
        const next = { ...prev };
        (data || []).forEach(r => { if (next[r.id] == null) next[r.id] = r.reply || ""; });
        return next;
      });
    } catch (e) {
      setErrorText(e.message || "Failed to load doubts.");
      setDoubts([]);
    } finally {
      setRefreshing(false);
    }
  }, [profile]);

  React.useEffect(() => { if (profile) fetchDoubts(); }, [profile, fetchDoubts]);

  // Basic polling
  React.useEffect(() => {
    if (!profile) return;
    const t = setInterval(fetchDoubts, 10000);
    return () => clearInterval(t);
  }, [profile, fetchDoubts]);

  async function markSeen(id){
    setDoubts(prev => prev.map(d => d.id === id ? { ...d, status: "seen" } : d));
    const { error } = await supabase.from("school_doubts").update({ status: "seen" }).eq("id", id);
    if (error) setErrorText(error.message);
  }

  async function markResolved(id){
    setDoubts(prev => prev.map(d => d.id === id ? { ...d, status: "replied" } : d));
    const { error } = await supabase.from("school_doubts").update({ status: "replied" }).eq("id", id);
    if (error) setErrorText(error.message);
  }

  async function sendReply(id){
    const text = (replyDrafts[id] || "").trim();
    if (!text) return;
    setDoubts(prev => prev.map(d => d.id === id ? { ...d, reply: text, status: "replied", updated_at: new Date().toISOString() } : d));
    const { error } = await supabase.from("school_doubts").update({ reply: text, status: "replied" }).eq("id", id);
    if (error) setErrorText(error.message);
  }

  const filtered = React.useMemo(() => {
    let list = doubts;
    if (filter !== "all") list = list.filter(d => (d.status || "new").toLowerCase() === filter);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(d => (
        (d.message || "").toLowerCase().includes(q) ||
        (d.reply || "").toLowerCase().includes(q) ||
        ((userMap[d.user_id]?.full_name || "").toLowerCase().includes(q))
      ));
    }
    return list;
  }, [doubts, filter, query, userMap]);

  return (
    <div className={`min-h-screen ${tone.pageBg} ${tone.text}`}>
      <div className={`pointer-events-none fixed inset-0 ${tone.starfield}`} />
      <Navbar tone={tone} dark={dark} toggleTheme={() => setDark(d => !d)} />

      <Section className="pt-36 pb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className={`inline-flex items-center gap-2 rounded-full ${tone.chipRing} ${tone.chipBg} px-3 py-1 text-xs ${tone.textMuted} backdrop-blur`}>
              <MessageSquare className="h-3.5 w-3.5"/> Doubts • Student queries
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold">Student doubts inbox</h1>
            <p className={`mt-2 ${tone.textMuted}`}>
              Replies are visible to the students. <ShieldCheck className="inline h-4 w-4 mx-1"/> Follow school policy.
            </p>
          </div>
          <div className="flex gap-2">
            <div className={`hidden sm:flex items-center gap-2 rounded-2xl ${tone.inputBg} ${tone.border} px-3 py-2`}>
              <Search className="h-4 w-4 opacity-70"/>
              <input
                className={`w-60 bg-transparent outline-none ${tone.inputText} text-sm`}
                placeholder="Search by name or text…"
                value={query}
                onChange={(e)=>setQuery(e.target.value)}
              />
            </div>
            <Button tone={tone} variant="ghost" onClick={fetchDoubts}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}/> Refresh
            </Button>
          </div>
        </div>

        {errorText && (
          <div className="mt-3 text-sm text-red-400">{errorText}</div>
        )}

        <div className="mt-3 flex items-center gap-2 text-xs">
          {[
            {key:'all', label:'All'},
            {key:'new', label:'New'},
            {key:'seen', label:'Seen'},
            {key:'replied', label:'Replied'},
          ].map(t => (
            <button key={t.key}
              onClick={()=>setFilter(t.key)}
              className={`rounded-full px-3 py-1 border ${filter===t.key ? 'bg-emerald-500/20 border-emerald-400/30' : `${tone.chipBg} ${tone.border}`}`}
            >
              <FilterIcon className="inline h-3.5 w-3.5 mr-1"/> {t.label}
            </button>
          ))}
        </div>
      </Section>

      <Section className="pb-20">
        <Card tone={tone} className="p-5">
          {loading ? (
            <div className="text-sm opacity-70">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm opacity-70">No doubts found.</div>
          ) : (
            <div className="grid gap-3">
              {filtered.map((row) => {
                const student = userMap[row.user_id];
                const name = student?.full_name || "Student";
                const metaGrade = row.grade || student?.grade || "—";
                const when = row.created_at ? new Date(row.created_at).toLocaleString() : "";
                return (
                  <div key={row.id} className={`rounded-2xl ${tone.chipBg} ${tone.border} p-4`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-sm font-semibold truncate max-w-[60vw]">{name}</div>
                          <span className="text-xs opacity-70">Grade {metaGrade}</span>
                          <span className="text-xs opacity-70">• {when}</span>
                          <StatusPill status={row.status || 'new'} />
                        </div>
                        <div className="mt-2 text-sm leading-6 whitespace-pre-wrap">{row.message}</div>
                        {row.reply ? (
                          <div className="mt-3 text-sm">
                            <div className="opacity-70 text-xs mb-1">Your reply</div>
                            <div className={`rounded-2xl px-3 py-2 border border-emerald-400/30 bg-emerald-500/15`}>{row.reply}</div>
                          </div>
                        ) : null}
                        {/* Reply composer */}
                        <div className={`mt-3 flex items-center gap-2 rounded-2xl ${tone.inputBg} ${tone.border} px-3 py-2`}>
                          <input
                            className={`flex-1 bg-transparent outline-none ${tone.inputText} text-sm`}
                            placeholder="Type a reply…"
                            value={replyDrafts[row.id] ?? ''}
                            onChange={(e)=>setReplyDrafts(d => ({...d, [row.id]: e.target.value}))}
                            onKeyDown={(e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendReply(row.id); } }}
                          />
                          <Button tone={tone} onClick={()=>sendReply(row.id)} disabled={!(replyDrafts[row.id]||'').trim()}>
                            <Send className="mr-2 h-4 w-4"/> Send
                          </Button>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex flex-col gap-2">
                        <Button tone={tone} variant="ghost" onClick={()=>markSeen(row.id)}>
                          <Eye className="mr-2 h-4 w-4"/> Mark seen
                        </Button>
                        <Button tone={tone} variant="ghost" onClick={()=>markResolved(row.id)}>
                          <CheckCircle2 className="mr-2 h-4 w-4"/> Mark resolved
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
        <div className={`mt-3 text-[11px] ${tone.textMuted}`}>
          Tip: This page selects <code>*</code> so it works whether or not you’ve added <code>user_id</code>/<code>school</code>/<code>grade</code>.
          If RLS still hides rows, add a policy allowing school staff to <em>select</em> from <code>school_doubts</code>.
        </div>
      </Section>

      <footer className={`border-top ${tone.divider} ${tone.panelBg}`}>
        <Section className="py-6">
          <div className={`text-xs ${tone.textMuted}`}>© {new Date().getFullYear()} Readease • School Doubts</div>
        </Section>
      </footer>
    </div>
  );
}
