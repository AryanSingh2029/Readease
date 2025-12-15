// src/pages/Notes.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, Moon, NotebookPen, FileText, Image as ImageIcon, Link2, Download,
  ExternalLink, Search, Filter, Calendar, X, FolderOpen, ArrowLeft, Upload
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

/* ================== Tokens ================== */
const TOKENS = {
  dark: {
    pageBg: "bg-[#0B0B0F]", text: "text-white", textMuted: "text-white/80",
    border: "border-white/10", chipBg: "bg-white/5", chipRing: "border-white/15",
    panelBg: "bg-black/40",
    starfield:
      "bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.06),transparent_60%)]",
    card: "rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-[0_8px_30px_rgba(0,0,0,0.12)]",
    cardHover: "hover:-translate-y-1 hover:border-white/20",
    buttonPrimary: "text-black bg-white hover:bg-white/90 ring-2 ring-white/0 hover:ring-white/30 shadow-lg shadow-black/10",
    buttonGhost: "text-white/90 bg-white/0 hover:bg-white/10 ring-1 ring-white/15",
    divider: "border-white/10",
    glowBorder: "from-white/40 via-white/10 to-transparent",
    inputBg: "bg-white/5", inputText: "text-white",
  },
  light: {
    pageBg: "bg-[#F7F8FB]", text: "text-[#0B0B0F]", textMuted: "text-[#0B0B0F]/70",
    border: "border-black/10", chipBg: "bg-white", chipRing: "border-black/10",
    panelBg: "bg-white/70",
    starfield:
      "bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.045),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.035),transparent_60%)]",
    card: "rounded-3xl border border-black/10 bg-white backdrop-blur shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
    cardHover: "hover:-translate-y-1 hover:border-black/20",
    buttonPrimary: "text-white bg-[#0B0B0F] hover:bg-[#14141b] ring-2 ring-black/0 hover:ring-black/10 shadow-lg shadow-black/10",
    buttonGhost: "text-[#0B0B0F] bg-white hover:bg-[#f1f2f6] ring-1 ring-black/10",
    divider: "border-black/10",
    glowBorder: "from-[#0B0B0F]/30 via-[#0B0B0F]/10 to-transparent",
    inputBg: "bg-white", inputText: "text-[#0B0B0F]",
  },
};

const GRADES = ["7","8","9","10","11","12"];

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

const Button = ({ tone, children, variant = "primary", className = "", ...props }) => {
  const base = "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2";
  const styles = variant === "primary" ? tone.buttonPrimary : tone.buttonGhost;
  return <button className={`${base} ${styles} ${className}`} {...props}>{children}</button>;
};

function Navbar({ tone, dark, toggleTheme, onBack }) {
  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`mt-4 rounded-2xl ${tone.border} ${tone.panelBg} px-4 py-3 backdrop-blur`}>
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone.pageBg.includes('#0B0B0F') ? 'bg-white text-black' : 'bg-[#0B0B0F] text-white'} font-black`}>R</div>
              <span className={`text-sm font-semibold tracking-wide ${tone.text}`}>Readease</span>
            </a>
            <div className="flex items-center gap-2">
              <button className={`${tone.buttonGhost} hidden sm:inline-flex rounded-2xl px-4 py-2 text-sm`}
                title="Back" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </button>
              <button aria-label="Toggle theme" onClick={toggleTheme}
                className={`inline-flex items-center justify-center rounded-2xl px-3 py-3 text-sm font-semibold transition ${tone.buttonGhost}`}
                title={dark ? "Switch to light" : "Switch to dark"}>
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function typeIcon(type) {
  if (type === "pdf" || type === "doc") return <FileText className="h-4 w-4" />;
  if (type === "image") return <ImageIcon className="h-4 w-4" />;
  return <Link2 className="h-4 w-4" />;
}

export default function Notes() {
  const navigate = useNavigate();
  const [dark, setDark] = React.useState(() => (localStorage.getItem("readease-theme") ?? "dark") === "dark");
  const tone = dark ? TOKENS.dark : TOKENS.light;

  // Current user
  const [profile, setProfile] = React.useState(null); // {id, full_name, role, grade, school}
  const isSchool = (profile?.role || "").toLowerCase() === "school";
  const isStudent = (profile?.role || "").toLowerCase() === "student";

  // List & UI
  const [notes, setNotes] = React.useState([]); // [{name, title, subject, signedUrl, updated_at, type}]
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [subject, setSubject] = React.useState("All");
  const [sort, setSort] = React.useState("newest");
  const [selected, setSelected] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [toast, setToast] = React.useState("");

  // Upload (school only, optional)
  const [upTitle, setUpTitle] = React.useState("");
  const [upSubject, setUpSubject] = React.useState("");
  const [upGrade, setUpGrade] = React.useState("");
  const [file, setFile] = React.useState(null);
  const [uploadOpen, setUploadOpen] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("readease-theme", dark ? "dark" : "light");
  }, [dark]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  /* Load profile */
  React.useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return navigate("/signin"); }
      const { data: p, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, grade, school")
        .eq("id", user.id).single();
      if (error) { setLoading(false); showToast("Failed to load profile"); return; }
      setProfile(p);
      setLoading(false);
    })();
  }, [navigate]);

  /* Fetch notes from STORAGE (bucket-per-grade) */
  const fetchNotes = React.useCallback(async () => {
    if (!profile) return;
    // Students: always use their grade; School: show nothing here (or you can add a dropdown if you want)
    const gradeToUse = isStudent ? String(profile.grade || "").replace(/\D/g, "") : String(upGrade || "").replace(/\D/g, "");
    const bucket = `notes_g${gradeToUse}`;
    if (!/^notes_g(7|8|9|10|11|12)$/.test(bucket)) { setNotes([]); return; }

    setLoading(true);
    try {
      const { data: files, error } = await supabase.storage
        .from(bucket)
        .list("", { limit: 200, sortBy: { column: "updated_at", order: "desc" } });
      if (error) throw error;

      const rows = await Promise.all((files || []).map(async (f) => {
        // derive subject/title from filename: subject__title__uuid.ext
        const base = f.name.replace(/\.(pdf|pptx?|png|jpe?g|webp|docx?|bin)$/i,"");
        const parts = base.split("__");
        const subj = parts[0]?.replace(/_/g," ") || "General";
        const ttl  = parts[1]?.replace(/_/g," ") || f.name;

        const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(f.name, 600);
        const ext = (f.name.split(".").pop() || "").toLowerCase();
        const type = ["png","jpg","jpeg","webp"].includes(ext) ? "image" : (ext === "pdf" ? "pdf" : "file");

        return {
          name: f.name,
          subject: subj,
          title: ttl,
          signedUrl: signed?.signedUrl,
          updated_at: f.updated_at,
          type
        };
      }));

      setNotes(rows);
    } catch (e) {
      console.error(e);
      showToast("Failed to load notes");
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [profile, isStudent, upGrade]);

  React.useEffect(() => { fetchNotes(); }, [fetchNotes]);

  /* Subjects list from data */
  const subjects = React.useMemo(() => ["All", ...Array.from(new Set(notes.map(n => n.subject).filter(Boolean)) )], [notes]);

  /* Filters & sort */
  const filtered = React.useMemo(() => {
    let data = notes.filter(n =>
      (subject === "All" || n.subject === subject) &&
      (n.title || "").toLowerCase().includes(query.toLowerCase())
    );
    data.sort((a,b) => {
      if (sort === "newest") return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
      if (sort === "oldest") return new Date(a.updated_at || 0) - new Date(b.updated_at || 0);
      return (a.title || "").localeCompare(b.title || "");
    });
    return data;
  }, [notes, subject, query, sort]);

  /* School upload → to bucket based on chosen grade */
  const onUpload = async () => {
    if (!isSchool) return;
    if (!file || !upSubject || !upGrade) { return showToast("Fill subject, grade & choose a file"); }
    setBusy(true);
    try {
      const gradeDigits = String(upGrade).replace(/\D/g, "");
      const bucket = `notes_g${gradeDigits}`;
      if (!/^notes_g(7|8|9|10|11|12)$/.test(bucket)) throw new Error("Grade must be 7–12");

      const ext = (file.name.split(".").pop() || "bin").toLowerCase();
      const safe = (s) => (s || "").trim().replace(/\s+/g, "_").slice(0, 60) || "notes";
      const key = `${safe(upSubject)}__${safe(upTitle)}__${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage.from(bucket).upload(key, file, {
        upsert: false,
        cacheControl: "3600",
        contentType: file.type || undefined
      });
      if (upErr) throw upErr;

      showToast("Uploaded");
      setUploadOpen(false);
      setUpTitle(""); setUpSubject(""); setUpGrade(""); setFile(null);
      fetchNotes(); // if viewing same grade (for school, you can set upGrade to match)
    } catch (e) {
      console.error(e);
      showToast(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`min-h-screen ${tone.pageBg} ${tone.text}`}>
      <div className={`pointer-events-none fixed inset-0 ${tone.starfield}`} />
      <Navbar
        tone={tone}
        dark={dark}
        toggleTheme={() => setDark(d => !d)}
        onBack={() => navigate(isSchool ? "/Schooldashboard" : "/Studentdashboard")}
      />

      {/* Header */}
      <Section className="pt-36 pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className={`inline-flex items-center gap-2 rounded-full ${tone.chipRing} ${tone.chipBg} px-3 py-1 text-xs ${tone.textMuted} backdrop-blur`}>
              <NotebookPen className="h-3.5 w-3.5" /> Notes from teacher
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold">Class resources</h1>
            <p className={`mt-2 ${tone.textMuted}`}>Slides, PDFs, images, and helpful links shared with your class.</p>
          </div>

          {isSchool && (
            <Button tone={tone} onClick={() => setUploadOpen(true)}>
              <Upload className="mr-2 h-4 w-4" /> Upload note
            </Button>
          )}
        </div>
      </Section>

      {/* Toolbar */}
      <Section className="pb-4">
        <Card tone={tone} className="p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className={`flex items-center gap-2 rounded-2xl ${tone.inputBg} ${tone.border} px-3 py-2`}>
              <Search className="h-4 w-4 opacity-70" />
              <input
                className={`w-full bg-transparent outline-none ${tone.inputText} text-sm`}
                placeholder="Search title..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className={`flex items-center gap-2 rounded-2xl ${tone.inputBg} ${tone.border} px-3 py-2`}>
              <Filter className="h-4 w-4 opacity-70" />
              <select className={`w-full bg-transparent outline-none ${tone.inputText} text-sm`} value={subject} onChange={(e) => setSubject(e.target.value)}>
                {subjects.map(s => <option key={s} className="text-black">{s}</option>)}
              </select>
            </div>
            <div className={`flex items-center gap-2 rounded-2xl ${tone.inputBg} ${tone.border} px-3 py-2`}>
              <Calendar className="h-4 w-4 opacity-70" />
              <select className={`w-full bg-transparent outline-none ${tone.inputText} text-sm`} value={sort} onChange={(e) => setSort(e.target.value)}>
                <option className="text-black" value="newest">Newest first</option>
                <option className="text-black" value="oldest">Oldest first</option>
                <option className="text-black" value="title">Title A→Z</option>
              </select>
            </div>
          </div>
        </Card>
      </Section>

      {/* Notes grid */}
      <Section className="pb-20">
        {loading ? (
          <div className={`rounded-3xl ${tone.card} p-10 text-center`}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className={`rounded-3xl ${tone.card} p-10 text-center`}>
            <FolderOpen className="mx-auto h-8 w-8 opacity-70" />
            <p className="mt-3 text-sm opacity-80">No notes match your search.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(note => (
              <Card key={note.name} tone={tone} className="p-5 cursor-pointer" onClick={() => setSelected(note)}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <span className="inline-flex items-center justify-center rounded-xl px-2 py-1 text-xs border border-white/10 bg-white/5">
                        {typeIcon(note.type)}
                      </span>
                      {note.title}
                    </p>
                    <p className={`mt-1 text-xs ${tone.textMuted}`}>{note.subject}</p>
                  </div>
                </div>
                <div className={`mt-3 text-xs ${tone.textMuted}`}>Updated <span className="opacity-100">{note.updated_at ? new Date(note.updated_at).toLocaleDateString() : "—"}</span></div>
                <div className="mt-4 flex gap-2">
                  <Button tone={tone} onClick={(e) => { e.stopPropagation(); setSelected(note); }}>View</Button>
                  <Button tone={tone} variant="ghost" onClick={(e) => { e.stopPropagation(); window.open(note.signedUrl, "_blank"); }}>
                    Open <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>

      {/* Modal viewer */}
      <AnimatePresence>
        {selected && (
          <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setSelected(null)} />
            <motion.div
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}
              transition={{ type: "spring", stiffness: 140, damping: 18 }}
              className={`relative w-full max-w-3xl ${tone.card} p-5`}
            >
              <button className={`absolute right-3 top-3 inline-flex items-center justify-center rounded-xl px-2.5 py-2 text-sm ${tone.buttonGhost}`}
                onClick={() => setSelected(null)} aria-label="Close">
                <X className="h-4 w-4" />
              </button>

              <div className="pr-10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">{typeIcon(selected.type)} {selected.title}</h3>
                    <p className={`mt-1 text-xs ${tone.textMuted}`}>{selected.subject} • {selected.updated_at ? new Date(selected.updated_at).toLocaleDateString() : "—"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button tone={tone} variant="ghost" onClick={() => window.open(selected.signedUrl, "_blank")}>
                      Open externally <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                    <Button tone={tone} variant="ghost" onClick={() => window.open(selected.signedUrl, "_blank")}>
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                  </div>
                </div>

                <div className={`mt-4 rounded-2xl ${tone.chipBg} ${tone.border} p-3`} style={{ height: 380, overflow: "hidden" }}>
                  {selected.type === "image" ? (
                    <img src={selected.signedUrl} alt={selected.title} className="h-full w-full object-contain rounded-xl" />
                  ) : selected.type === "pdf" ? (
                    <iframe title="Preview" src={selected.signedUrl} className="h-full w-full rounded-xl" />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-center">
                      <Link2 className="h-6 w-6 opacity-70" />
                      <p className={`mt-2 text-sm ${tone.textMuted}`}>This is a file link. Open it in a new tab to read.</p>
                      <Button tone={tone} className="mt-3" onClick={() => window.open(selected.signedUrl, "_blank")}>Open link</Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload modal (school) */}
      <AnimatePresence>
        {uploadOpen && isSchool && (
          <motion.div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setUploadOpen(false)} />
            <motion.div
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}
              transition={{ type: "spring", stiffness: 140, damping: 18 }}
              className={`relative w-full max-w-lg ${tone.card} p-5`}
            >
              <button className={`absolute right-3 top-3 inline-flex items-center justify-center rounded-xl px-2.5 py-2 text-sm ${tone.buttonGhost}`}
                onClick={() => setUploadOpen(false)} aria-label="Close">
                <X className="h-4 w-4" />
              </button>

              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Upload className="h-5 w-5" /> Upload note</h3>

              <div className="space-y-3">
                <div className={`rounded-2xl ${tone.inputBg} ${tone.border} px-3 py-2`}>
                  <input className={`w-full bg-transparent outline-none ${tone.inputText} text-sm`} placeholder="Title (optional)"
                    value={upTitle} onChange={(e) => setUpTitle(e.target.value)} />
                </div>
                <div className={`rounded-2xl ${tone.inputBg} ${tone.border} px-3 py-2`}>
                  <input className={`w-full bg-transparent outline-none ${tone.inputText} text-sm`} placeholder="Subject"
                    value={upSubject} onChange={(e) => setUpSubject(e.target.value)} />
                </div>
                <div className={`rounded-2xl ${tone.inputBg} ${tone.border} px-3 py-2`}>
                  <select className={`w-full bg-transparent outline-none ${tone.inputText} text-sm`}
                    value={upGrade} onChange={(e) => setUpGrade(e.target.value)}>
                    <option value="" className="text-black">Select Grade</option>
                    {GRADES.map(g => <option key={g} value={g} className="text-black">{g}</option>)}
                  </select>
                </div>
                <div className={`rounded-2xl ${tone.inputBg} ${tone.border} px-3 py-2`}>
                  <input type="file" accept=".pdf,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.doc,.docx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className={`w-full bg-transparent outline-none ${tone.inputText} text-sm`} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button tone={tone} variant="ghost" onClick={() => setUploadOpen(false)}>Cancel</Button>
                  <Button tone={tone} onClick={onUpload} disabled={busy}>{busy ? "Uploading…" : "Upload"}</Button>
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

      <footer className={`border-t ${tone.divider} ${tone.panelBg}`}>
        <Section className="py-6">
          <div className={`text-xs ${tone.textMuted}`}>© {new Date().getFullYear()} Readease • Notes</div>
        </Section>
      </footer>
    </div>
  );
}
