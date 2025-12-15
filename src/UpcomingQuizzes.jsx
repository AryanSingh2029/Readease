import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, Moon,
  ClipboardList, ShieldCheck,
  Filter, Search, Calendar, Clock, X, ArrowRight, ArrowLeft,
  Plus, Edit3, Trash2
} from "lucide-react";
import { supabase } from "./supabaseClient"; // if default export, use: import supabase from "./supabase";

// ==============================================
// Readease – Upcoming Quizzes (Student + School)
// Table used: public.quizzes(
//   id uuid pk, title text, subject text, description text,
//   grade text, school text, created_by uuid, created_at timestamptz
// )
// No quiz_at column is required.
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
    cardHover:
      "hover:-translate-y-1 hover:border-white/20",
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
    cardHover:
      "hover:-translate-y-1 hover:border-black/20",
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
              <a href="/" className="flex items-center gap-2">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone.pageBg.includes('#0B0B0F') ? 'bg-white text-black' : 'bg-[#0B0B0F] text-white'} font-black`}>R</div>
                <span className={`text-sm font-semibold tracking-wide`}>Readease</span>
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Button tone={tone} variant="ghost" onClick={() => window.history.back()}>
                <ArrowLeft className="mr-2 h-4 w-4"/> Back
              </Button>
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

/* ----- helpers ----- */
function isUpcoming(iso) { 
  // Treat no time as "upcoming/TBD"
  return !iso || new Date(iso) >= new Date(); 
}
function statusFromTime(iso) {
  if (!iso) return "scheduled";                // no time => scheduled
  return new Date(iso) > new Date() ? "scheduled" : "closed";
}

function StatusPill({ iso }) {
  const s = statusFromTime(iso);
  const base = "inline-flex items-center rounded-full px-2.5 py-1 text-xs";
  if (s === 'scheduled') return <span className={`${base} bg-amber-500/15 text-amber-300 border border-amber-400/30`}>Scheduled</span>;
  return <span className={`${base} bg-rose-500/15 text-rose-300 border border-rose-400/30`}>Over</span>;
}

function CountdownTo({ to }) {
  const [left, setLeft] = React.useState(() => new Date(to) - new Date());
  React.useEffect(() => {
    const id = setInterval(() => setLeft(new Date(to) - new Date()), 1000);
    return () => clearInterval(id);
  }, [to]);
  if (!to) return <span className="text-xs opacity-70">TBD</span>;
  if (left <= 0) return <span className="text-xs opacity-70">0m</span>;
  const s = Math.floor(left / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return <span className="text-xs opacity-90">{h}h {m}m {sec}s</span>;
}

/* ----- Component ----- */
export default function UpcomingQuizzes() {
  const [dark, setDark] = React.useState(() => {
    const saved = localStorage.getItem("readease-theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return true;
  });
  const tone = dark ? TOKENS.dark : TOKENS.light;

  // user profile
  const [profile, setProfile] = React.useState(null); // {id, full_name, role, grade, school}
  const isSchool = profile?.role === "school";

  // data
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // filters
  const [query, setQuery] = React.useState("");
  const [subject, setSubject] = React.useState("All");
  const [status, setStatus] = React.useState("All"); // Upcoming | All | Past
  const [sort, setSort] = React.useState("soonest");

  // modal + form (school)
  const [openEdit, setOpenEdit] = React.useState(false);
  const [editing, setEditing] = React.useState(null); // quiz row or null
  const [title, setTitle] = React.useState("");
  const [subj, setSubj] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [grade, setGrade] = React.useState("");
  const [when, setWhen] = React.useState(""); // datetime-local (optional, not saved)

  const [busy, setBusy] = React.useState(false);
  const [toast, setToast] = React.useState("");

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("readease-theme", dark ? "dark" : "light");
  }, [dark]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  // load profile
  React.useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        showToast("Please sign in");
        return;
      }
      const { data: p, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, grade, school")
        .eq("id", user.id)
        .single();
      if (error) {
        setLoading(false);
        showToast("Failed to load profile");
        return;
      }
      setProfile(p);
      setLoading(false);
    })();
  }, []);

  // fetch quizzes filtered by school (+ grade for students)
  const fetchQuizzes = React.useCallback(async () => {
    if (!profile?.school) return;
    setLoading(true);

    let q = supabase
      .from("quizzes")
      .select("id, title, subject, description, grade, school, created_by, created_at")
      .eq("school", profile.school)
      .order("created_at", { ascending: false });

    if (profile?.role === "student" && profile?.grade) {
      q = q.eq("grade", profile.grade);
    }

    const { data, error } = await q;

    if (error) {
      setLoading(false);
      showToast("Failed to load quizzes");
      return;
    }

    // Shape records so UI can work without quiz_at
    const shaped = (data || []).map(r => ({
      ...r,
      quiz_at: null,             // no date stored → treat as TBD
      description: r.description ?? "",
    }));

    setRows(shaped);
    setLoading(false);
  }, [profile?.school, profile?.role, profile?.grade]);

  React.useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  // subjects for filter
  const subjects = React.useMemo(() => {
    const s = Array.from(new Set(rows.map(r => r.subject).filter(Boolean)));
    return ["All", ...s];
  }, [rows]);

  // filtered/sorted view
  const filtered = React.useMemo(() => {
    let list = rows.slice();

    if (subject !== "All") list = list.filter(r => (r.subject || "") === subject);
    if (query) {
      const needle = query.toLowerCase();
      list = list.filter(r =>
        (r.title || "").toLowerCase().includes(needle) ||
        (r.description || "").toLowerCase().includes(needle)
      );
    }

    if (status === "Upcoming") list = list.filter(r => isUpcoming(r.quiz_at));
    if (status === "Past")     list = list.filter(r => r.quiz_at && !isUpcoming(r.quiz_at));

    list.sort((a, b) => {
      if (sort === "title") return (a.title || "").localeCompare(b.title || "");
      if (sort === "latest") {
        // latest date first, items with no date go last
        const ta = a.quiz_at ? new Date(a.quiz_at).getTime() : -Infinity;
        const tb = b.quiz_at ? new Date(b.quiz_at).getTime() : -Infinity;
        return tb - ta;
      }
      // soonest: earliest future date first, no-date at end
      const ta = a.quiz_at ? new Date(a.quiz_at).getTime() : Infinity;
      const tb = b.quiz_at ? new Date(b.quiz_at).getTime() : Infinity;
      return ta - tb;
    });

    return list;
  }, [rows, subject, query, status, sort]);

  // open modal for create/edit
  const openCreate = () => {
    setEditing(null);
    setTitle(""); setSubj(""); setDesc(""); setGrade(""); setWhen("");
    setOpenEdit(true);
  };
  const openUpdate = (row) => {
    setEditing(row);
    setTitle(row.title || "");
    setSubj(row.subject || "");
    setDesc(row.description || "");
    setGrade(row.grade || "");
    setWhen(""); // no stored date
    setOpenEdit(true);
  };

  // save (create/edit) – NO quiz_at persisted
  const onSave = async () => {
    if (!isSchool) return;
    if (!title || !subj || !grade) {
      return showToast("Please fill title, subject and grade");
    }
    setBusy(true);
    try {
      if (!editing) {
        const { error } = await supabase.from("quizzes").insert({
          title: title.trim(),
          subject: subj.trim(),
          description: desc?.trim() || null,
          grade,
          school: profile.school,
          created_by: profile.id
        });
        if (error) throw error;
        showToast("Quiz added");
      } else {
        const { error } = await supabase.from("quizzes").update({
          title: title.trim(),
          subject: subj.trim(),
          description: desc?.trim() || null,
          grade
        }).eq("id", editing.id);
        if (error) throw error;
        showToast("Quiz updated");
      }
      setOpenEdit(false);
      fetchQuizzes();
    } catch (e) {
      showToast(e.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  // delete
  const onDelete = async (row) => {
    if (!isSchool) return;
    if (!confirm(`Delete quiz "${row.title}"?`)) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("quizzes").delete().eq("id", row.id);
      if (error) throw error;
      showToast("Deleted");
      fetchQuizzes();
    } catch (e) {
      showToast(e.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const [selected, setSelected] = React.useState(null);

  return (
    <div className={`min-h-screen ${tone.pageBg} ${tone.text}`}>
      <div className={`pointer-events-none fixed inset-0 ${tone.starfield}`} />
      <Navbar tone={tone} dark={dark} toggleTheme={() => setDark(d => !d)} />

      {/* Header */}
      <Section className="pt-36 pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className={`inline-flex items-center gap-2 rounded-full ${tone.chipRing} ${tone.chipBg} px-3 py-1 text-xs ${tone.textMuted} backdrop-blur`}>
              <ClipboardList className="h-3.5 w-3.5" /> Upcoming quizzes
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold">Assessments</h1>
            <p className={`mt-2 ${tone.textMuted}`}>See dates and details for your class. (Timezone: your device)</p>
          </div>
          {isSchool && (
            <Button tone={tone} onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Add quiz
            </Button>
          )}
        </div>
      </Section>

      {/* Toolbar */}
      <Section className="pb-4">
        <Card tone={tone} className="p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className={`flex items-center gap-2 rounded-2xl ${tone.inputBg} ${tone.border} px-3 py-2`}>
              <Search className="h-4 w-4 opacity-70"/>
              <input
                className={`w-full bg-transparent outline-none ${tone.inputText} text-sm`}
                placeholder="Search title or description..."
                value={query}
                onChange={(e)=>setQuery(e.target.value)}
              />
            </div>
            <div className={`flex items-center gap-2 rounded-2xl ${tone.inputBg} ${tone.border} px-3 py-2`}>
              <Filter className="h-4 w-4 opacity-70"/>
              <select className={`w-full bg-transparent outline-none ${tone.inputText} text-sm`} value={subject} onChange={(e)=>setSubject(e.target.value)}>
                {subjects.map(s => <option key={s} className="text-black">{s}</option>)}
              </select>
            </div>
            <div className={`flex items-center gap-2 rounded-2xl ${tone.inputBg} ${tone.border} px-3 py-2`}>
              <Calendar className="h-4 w-4 opacity-70"/>
              <select className={`w-full bg-transparent outline-none ${tone.inputText} text-sm`} value={status} onChange={(e)=>setStatus(e.target.value)}>
                {['Upcoming','All','Past'].map(s => <option key={s} className="text-black">{s}</option>)}
              </select>
            </div>
            <div className={`flex items-center gap-2 rounded-2xl ${tone.inputBg} ${tone.border} px-3 py-2`}>
              <Clock className="h-4 w-4 opacity-70"/>
              <select className={`w-full bg-transparent outline-none ${tone.inputText} text-sm`} value={sort} onChange={(e)=>setSort(e.target.value)}>
                <option className="text-black" value="soonest">Date - soonest</option>
                <option className="text-black" value="latest">Date - latest</option>
                <option className="text-black" value="title">Title A→Z</option>
              </select>
            </div>
          </div>
        </Card>
      </Section>

      {/* Grid */}
      <Section className="pb-20">
        {loading ? (
          <div className={`rounded-3xl ${tone.card} p-10 text-center`}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className={`rounded-3xl ${tone.card} p-10 text-center`}>
            <ClipboardList className="mx-auto h-8 w-8 opacity-70"/>
            <p className="mt-3 text-sm opacity-80">No quizzes match your filters.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(q => {
              const s = statusFromTime(q.quiz_at);
              const upcoming = s === "scheduled";
              return (
                <Card key={q.id} tone={tone} className="p-5 cursor-pointer" onClick={()=>setSelected(q)}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold flex items-center gap-2">
                        {q.title}
                      </p>
                      <p className={`mt-1 text-xs ${tone.textMuted}`}>{q.subject || "General"}</p>
                    </div>
                    <StatusPill iso={q.quiz_at} />
                  </div>

                  <div className={`mt-3 text-xs ${tone.textMuted}`}>
                    When: {q.quiz_at ? new Date(q.quiz_at).toLocaleString() : "TBD"}
                  </div>

                  <div className="mt-3">
                    <div className={`inline-flex items-center gap-2 rounded-full ${tone.chipBg} ${tone.border} px-2.5 py-1 text-[11px]`}>
                      <ShieldCheck className="h-3.5 w-3.5"/> Standard instructions apply
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    {upcoming ? (
                      q.quiz_at
                        ? <div className="text-xs opacity-90">Starts in <CountdownTo to={q.quiz_at} /></div>
                        : <div className="text-xs opacity-70">Date TBD</div>
                    ) : (
                      <div className="text-xs opacity-70">Quiz time passed</div>
                    )}

                    <div className="flex gap-2">
                      <Button tone={tone} disabled={!upcoming || !q.quiz_at} onClick={(e)=>{e.stopPropagation(); alert(`Attempt stub for ${q.title}`);}}>
                        Attempt <ArrowRight className="ml-2 h-4 w-4"/>
                      </Button>

                      {isSchool && (
                        <>
                          <Button tone={tone} variant="ghost" onClick={(e)=>{e.stopPropagation(); openUpdate(q);}}>
                            <Edit3 className="h-4 w-4"/>
                          </Button>
                          <Button tone={tone} variant="ghost" onClick={(e)=>{e.stopPropagation(); onDelete(q);}}>
                            <Trash2 className="h-4 w-4"/>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Section>

      {/* Details modal */}
      <AnimatePresence>
        {selected && (
          <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60" onClick={()=>setSelected(null)} />
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ type: 'spring', stiffness: 140, damping: 18 }} className={`relative w-full max-w-2xl ${tone.card} p-5`}>
              <button className={`absolute right-3 top-3 inline-flex items-center justify-center rounded-xl px-2.5 py-2 text-sm ${tone.buttonGhost}`} onClick={()=>setSelected(null)} aria-label="Close">
                <X className="h-4 w-4"/>
              </button>
              <div className="pr-8">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2"><ClipboardList className="h-5 w-5"/> {selected.title}</h3>
                    <p className={`mt-1 text-xs ${tone.textMuted}`}>{selected.subject || "General"} • {selected.quiz_at ? new Date(selected.quiz_at).toLocaleString() : "TBD"}</p>
                  </div>
                  <StatusPill iso={selected.quiz_at} />
                </div>
                {selected.description && <p className={`mt-3 text-sm ${tone.textMuted}`}>{selected.description}</p>}
                <div className={`mt-4 text-xs ${tone.textMuted} flex items-center gap-2`}>
                  <ShieldCheck className="h-4 w-4"/> Exam rules and accommodations are set by your school.
                </div>
                <div className="mt-5 flex gap-2">
                  <Button tone={tone} onClick={()=>alert(`Attempt stub for ${selected.title}`)} disabled={statusFromTime(selected.quiz_at) !== 'scheduled' || !selected.quiz_at}>
                    Attempt when it starts
                  </Button>
                  <Button tone={tone} variant="ghost" onClick={()=>setSelected(null)}>
                    <ArrowLeft className="mr-2 h-4 w-4"/> Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit modal (School) */}
      <AnimatePresence>
        {openEdit && isSchool && (
          <motion.div className="fixed inset-0 z-[70] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60" onClick={()=>setOpenEdit(false)} />
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ type: 'spring', stiffness: 140, damping: 18 }} className={`relative w-full max-w-lg ${tone.card} p-5`}>
              <button className={`absolute right-3 top-3 inline-flex items-center justify-center rounded-xl px-2.5 py-2 text-sm ${tone.buttonGhost}`} onClick={()=>setOpenEdit(false)} aria-label="Close">
                <X className="h-4 w-4"/>
              </button>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                {editing ? <><Edit3 className="h-5 w-5"/> Edit quiz</> : <><Plus className="h-5 w-5"/> Add quiz</>}
              </h3>

              <div className="space-y-3">
                <div className={`rounded-2xl ${tone.inputBg} ${tone.border} px-3 py-2`}>
                  <input className={`w-full bg-transparent outline-none ${tone.inputText} text-sm`} placeholder="Title"
                         value={title} onChange={(e)=>setTitle(e.target.value)} />
                </div>
                <div className={`rounded-2xl ${tone.inputBg} ${tone.border} px-3 py-2`}>
                  <input className={`w-full bg-transparent outline-none ${tone.inputText} text-sm`} placeholder="Subject"
                         value={subj} onChange={(e)=>setSubj(e.target.value)} />
                </div>
                <div className={`rounded-2xl ${tone.inputBg} ${tone.border} px-3 py-2`}>
                  <textarea className={`w-full bg-transparent outline-none ${tone.inputText} text-sm`} placeholder="Description (optional)"
                            rows={3} value={desc} onChange={(e)=>setDesc(e.target.value)} />
                </div>

                {/* Optional UI-only date field (not saved) */}
                <div className={`rounded-2xl ${tone.inputBg} ${tone.border} px-3 py-2`}>
                  <input type="datetime-local" className={`w-full bg-transparent outline-none ${tone.inputText} text-sm`}
                         value={when} onChange={(e)=>setWhen(e.target.value)} />
                  <p className="mt-1 text-[11px] opacity-70">This date is only for display right now.</p>
                </div>

                <div className={`rounded-2xl ${tone.inputBg} ${tone.border} px-3 py-2`}>
                  <input className={`w-full bg-transparent outline-none ${tone.inputText} text-sm`} placeholder="Grade (e.g. 10)"
                         value={grade} onChange={(e)=>setGrade(e.target.value)} />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button tone={tone} variant="ghost" onClick={()=>setOpenEdit(false)}>Cancel</Button>
                  <Button tone={tone} onClick={onSave} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!!toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[80]">
          <div className="rounded-xl px-4 py-2 bg-black/80 text-white text-sm">{toast}</div>
        </div>
      )}

      <footer className={`border-top ${tone.divider} ${tone.panelBg}`}>
        <Section className="py-6">
          <div className={`text-xs ${tone.textMuted}`}>© {new Date().getFullYear()} Readease • Upcoming Quizzes</div>
        </Section>
      </footer>
    </div>
  );
}
