import React from "react";
import { motion } from "framer-motion";
import { supabase } from "./supabaseClient";
import {
  Sun, Moon, ArrowLeft, ChevronDown,
  Users, BookOpen, ClipboardList,
  ListTree, Eye, X, User2, Upload, RefreshCw, FileText, ExternalLink, Plus
} from "lucide-react";

/* ================== Tokens ================== */
const TOKENS = {
  dark: {
    pageBg: "bg-[#0B0B0F]", text: "text-white", textMuted: "text-white/80",
    border: "border-white/10", chipBg: "bg-white/5", chipRing: "border-white/15",
    panelBg: "bg-black/40",
    starfield: "bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.06),transparent_60%)]",
    card: "rounded-3xl border border-white/10 bg-white/5 backdrop-blur",
    cardHover: "hover:-translate-y-0.5 hover:border-white/20",
    buttonPrimary: "text-black bg-white hover:bg-white/90 ring-2 ring-white/0 hover:ring-white/30",
    buttonGhost: "text-white/90 bg-white/0 hover:bg-white/10 ring-1 ring-white/15",
    divider: "border-white/10", glowBorder: "from-white/40 via-white/10 to-transparent",
    inputBg: "bg-white/5", inputText: "text-white",
  },
  light: {
    pageBg: "bg-[#F7F8FB]", text: "text-[#0B0B0F]", textMuted: "text-[#0B0B0F]/70",
    border: "border-black/10", chipBg: "bg-white", chipRing: "border-black/10",
    panelBg: "bg-white/70",
    starfield: "bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.045),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.035),transparent_60%)]",
    card: "rounded-3xl border border-black/10 bg-white backdrop-blur",
    cardHover: "hover:-translate-y-0.5 hover:border-black/20",
    buttonPrimary: "text-white bg-[#0B0B0F] hover:bg-[#14141b] ring-2 ring-black/0 hover:ring-black/10",
    buttonGhost: "text-[#0B0B0F] bg-white hover:bg-[#f1f2f6] ring-1 ring-black/10",
    divider: "border-black/10", glowBorder: "from-[#0B0B0F]/30 via-[#0B0B0F]/10 to-transparent",
    inputBg: "bg-white", inputText: "text-[#0B0B0F]",
  },
};

const GRADES = ["LKG","UKG","1","2","3","4","5","6","7","8","9","10","11","12"];

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

/* =============== Profile Button =============== */
function ProfileButton({ tone }){
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onDocClick = (e) => { if(ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={()=>setOpen(o=>!o)} className={`inline-flex items-center gap-2 rounded-full px-3 py-2 ${tone.buttonGhost}`} title="Account">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400/90 to-emerald-300/70 flex items-center justify-center text-black font-bold">S</div>
      </button>
      {open && (
        <div className={`absolute right-0 mt-2 w-44 ${tone.card} p-2`}>
          <a href="/schoolprofile" className={`flex items-center gap-2 rounded-xl px-3 py-2 ${tone.buttonGhost}`}>
            <User2 className="h-4 w-4"/> Profile
          </a>
        </div>
      )}
    </div>
  );
}

/* ===== Create Quiz Modal (simple: no time fields) ===== */
function CreateQuizModal({ open, onClose, tone, grade,school, onCreated }) {
  const [title, setTitle] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [qs, setQs] = React.useState([{ q:"", A:"", B:"", C:"", D:"", ans:"A" }]);
  const [busy, setBusy] = React.useState(false);
  const [toast, setToast] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setTitle(""); setSubject("");
      setQs([{ q:"", A:"", B:"", C:"", D:"", ans:"A" }]);
      setToast("");
    }
  }, [open]);

  const addQ = () => setQs(s => [...s, { q:"", A:"", B:"", C:"", D:"", ans:"A" }]);
  const delQ = (i) => setQs(s => s.length>1 ? s.filter((_,idx)=>idx!==i) : s);
  const setField = (i, key, val) => setQs(s => s.map((row,idx)=> idx===i ? {...row, [key]: val} : row));
  const showToast = (m) => { setToast(m); setTimeout(()=>setToast(""), 2200); };

const save = async () => {
  if (!title || !qs.length || !qs[0].q) return showToast("Add a title and at least one MCQ");
  setBusy(true);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");

    // build JSON payload
    const normalized = qs.map((row, idx) => {
      const ans = String(row.ans || "").toUpperCase();
      if (!["A","B","C","D"].includes(ans)) throw new Error(`Q${idx+1}: select correct option`);
      if (!row.q?.trim()) throw new Error(`Q${idx+1}: missing question`);
      return {
        q_no: idx + 1,
        question: row.q.trim(),
        options: {
          A: String(row.A ?? ""),
          B: String(row.B ?? ""),
          C: String(row.C ?? ""),
          D: String(row.D ?? "")
        },
        correct_option: ans
      };
    });

    const { error } = await supabase
      .from("quizzes")
      .insert([{
        title: title.trim(),
        subject: subject?.trim() || null,
        grade,
        school,                // you’re already passing this prop
        created_by: user.id,
        questions_json: { questions: normalized },
        questions_count: normalized.length
      }]);

    if (error) throw error;

    onCreated?.();
    onClose();
    alert("Quiz created 🎉");
  } catch (e) {
    console.error(e);
    showToast(e.message || "Save failed");
  } finally {
    setBusy(false);
  }
};


  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className={`relative w-full max-w-3xl ${tone.card} p-6`}>
        <button onClick={onClose} className={`absolute right-3 top-3 ${tone.buttonGhost} rounded-xl px-2 py-1`}><X className="h-4 w-4"/></button>
        <div className="text-lg font-semibold mb-3 flex items-center gap-2"><Plus className="h-5 w-5"/> Create quiz • Grade {grade}</div>

        <div className="grid gap-3 text-sm md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="opacity-80">Title</span>
            <input value={title} onChange={e=>setTitle(e.target.value)} className={`mt-1 w-full rounded-xl px-3 py-2 ${tone.inputBg} ${tone.border} outline-none ${tone.inputText}`} placeholder="e.g., Science – Ecosystems MCQ"/>
          </label>
          <label className="block">
            <span className="opacity-80">Subject</span>
            <input value={subject} onChange={e=>setSubject(e.target.value)} className={`mt-1 w-full rounded-xl px-3 py-2 ${tone.inputBg} ${tone.border} outline-none ${tone.inputText}`} placeholder="Science"/>
          </label>
        </div>

        {/* MCQs */}
        <div className="mt-4">
          <div className="text-sm font-semibold mb-2">MCQs</div>
          <div className="grid gap-3">
            {qs.map((row, i) => (
              <div key={i} className={`rounded-2xl ${tone.inputBg} ${tone.border} p-3`}>
                <div className="flex items-center justify-between">
                  <div className="text-xs opacity-70">Question {i+1}</div>
                  <button className={`${tone.buttonGhost} rounded-xl px-2 py-1`} onClick={()=>delQ(i)} disabled={qs.length===1}>Remove</button>
                </div>
                <input className={`mt-2 w-full bg-transparent outline-none ${tone.inputText} text-sm`} placeholder="Enter question" value={row.q} onChange={(e)=>setField(i,'q',e.target.value)}/>
                <div className="mt-2 grid sm:grid-cols-2 gap-2">
                  {["A","B","C","D"].map(opt => (
                    <label key={opt} className="flex items-center gap-2">
                      <input type="radio" name={`correct-${i}`} checked={row.ans === opt} onChange={()=>setField(i,'ans',opt)}/>
                      <input className={`flex-1 rounded-xl px-3 py-2 ${tone.inputBg} ${tone.border} outline-none ${tone.inputText} text-sm`} placeholder={`Option ${opt}`} value={row[opt]} onChange={(e)=>setField(i, opt, e.target.value)} />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between">
            <button className={`${tone.buttonGhost} rounded-2xl px-3 py-2`} onClick={addQ}>+ Add question</button>
            <div className="flex gap-2">
              <button className={`${tone.buttonGhost} rounded-2xl px-4 py-2`} onClick={onClose}>Cancel</button>
              <button className={`${tone.buttonPrimary} rounded-2xl px-4 py-2`} onClick={save} disabled={busy}>{busy ? "Saving…" : "Create quiz"}</button>
            </div>
          </div>
          {!!toast && <div className="mt-2 text-xs opacity-80">{toast}</div>}
        </div>
      </div>
    </div>
  );
}

/* ============== Upload Notes Modal (BUCKET-PER-GRADE) ============== */
function UploadNotesModal({ open, onClose, tone, grade, onUploaded }) {
  const [title, setTitle] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [file, setFile] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [toast, setToast] = React.useState("");

  React.useEffect(()=>{ if(!open){ setTitle(""); setSubject(""); setFile(null); setToast(""); }},[open]);
  const showToast = (m) => { setToast(m); setTimeout(()=>setToast(""), 2200); };

  const upload = async () => {
    if (!file || !grade) { showToast("Pick a file and grade"); return; }
    const gradeDigits = String(grade).replace(/\D/g, "");
    const bucket = `notes_g${gradeDigits}`;
    if (!/^notes_g(7|8|9|10|11|12)$/.test(bucket)) {
      showToast("Select grade 7–12 for notes"); return;
    }

    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      // ensure uploader is a school account (policy also enforces this)
      const { data: prof, error: pErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (pErr) throw pErr;
      if ((prof?.role || "").toLowerCase() !== "school") {
        throw new Error("Only school accounts can upload notes");
      }

      // filename: [subject]__[title]__uuid.ext (spaces -> _)
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
      const safe = (s) => (s || "").trim().replace(/\s+/g, "_").slice(0, 60) || "notes";
      const key = `${safe(subject)}__${safe(title)}__${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(key, file, { cacheControl: "3600", upsert: false, contentType: file.type || undefined });
      if (upErr) throw upErr;

      onUploaded?.();
      onClose();
      alert("Notes uploaded 🎉");
    } catch (e) {
      console.error(e);
      showToast(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className={`relative w-full max-w-lg ${tone.card} p-6`}>
        <button onClick={onClose} className={`absolute right-3 top-3 ${tone.buttonGhost} rounded-xl px-2 py-1`}><X className="h-4 w-4"/></button>
        <div className="text-lg font-semibold mb-3 flex items-center gap-2"><Upload className="h-5 w-5"/> Upload notes • Grade {grade}</div>
        <div className="grid gap-3 text-sm">
          <div className={`rounded-2xl ${tone.inputBg} ${tone.border} px-3 py-2`}>
            <input className={`w-full bg-transparent outline-none ${tone.inputText} text-sm`} placeholder="Title (optional)" value={title} onChange={(e)=>setTitle(e.target.value)} />
          </div>
          <div className={`rounded-2xl ${tone.inputBg} ${tone.border} px-3 py-2`}>
            <input className={`w-full bg-transparent outline-none ${tone.inputText} text-sm`} placeholder="Subject (e.g., Science)" value={subject} onChange={(e)=>setSubject(e.target.value)} />
          </div>
          <label className="block">
            <span className="text-xs opacity-80">File (PDF, PPT/PPTX, images)</span>
            <input type="file" accept=".pdf,.ppt,.pptx,.png,.jpg,.jpeg,.webp" className="mt-1 block w-full text-sm" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className={`${tone.buttonGhost} rounded-2xl px-4 py-2`}>Cancel</button>
          <button onClick={upload} className={`${tone.buttonPrimary} rounded-2xl px-4 py-2`} disabled={busy || !file}>{busy ? "Uploading…" : "Upload"}</button>
        </div>
        {!!toast && <div className="mt-2 text-xs opacity-80">{toast}</div>}
      </div>
    </div>
  );
}

/* ===================== Main ===================== */
export default function SchoolDashboardGradeFlow(){
  const [dark, setDark] = React.useState(() => localStorage.getItem("readease-theme") !== "light");
  const tone = dark ? TOKENS.dark : TOKENS.light;

  const [profile, setProfile] = React.useState(null); // {id, role, school, full_name}
  const [grade, setGrade] = React.useState("10");

  // Students
  const [students, setStudents] = React.useState([]);
  const [loadingStudents, setLoadingStudents] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState(null);

  const [studentCount, setStudentCount] = React.useState(0);
const [loadingStudentCount, setLoadingStudentCount] = React.useState(false);



  // Quizzes
  const [quizzes, setQuizzes] = React.useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = React.useState(false);

  // Notes (from Storage)
  const [notes, setNotes] = React.useState([]); // [{name, signedUrl, subject, title, updated_at}]
  const [loadingNotes, setLoadingNotes] = React.useState(false);

  // Modals
  const [openCreateQuiz, setOpenCreateQuiz] = React.useState(false);
  const [openUpload, setOpenUpload] = React.useState(false);

  const [toast, setToast] = React.useState("");
  const showToast = (m) => { setToast(m); setTimeout(()=>setToast(""), 2200); };

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("readease-theme", dark ? "dark" : "light");
  }, [dark]);

  // Load school profile (used for filters)
  React.useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { showToast("Please sign in"); return; }
      const { data: p, error } = await supabase.from("profiles").select("id, role, school, full_name, grade").eq("id", user.id).single();
      if (error) { showToast("Failed to load profile"); return; }
      setProfile(p);
    })();
  }, []);

  // Fetch students (exact grade + same school)
  const fetchStudents = React.useCallback(async () => {
    if (!profile?.school) return;
    setLoadingStudents(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, grade, section, school, role")
      .eq("role", "student")
      .eq("school", profile.school)
      .eq("grade", grade)
      .order("full_name", { ascending: true });
    if (error) {
      console.error(error);
      showToast("Failed to load students");
      setStudents([]);
    } else {
      setStudents(data || []);
      setSelectedId(prev => (data?.length ? (data.find(s => s.id === prev)?.id || data[0].id) : null));
    }
    setLoadingStudents(false);
  }, [profile?.school, grade]);

  // ➕ ADD: count-only fetch for selected grade
const fetchStudentCount = React.useCallback(async () => {
  if (!profile?.school || !grade) return;
  setLoadingStudentCount(true);

  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true }) // head:true = no rows returned, only count
    .eq("role", "student")
    .eq("school", profile.school)
    .eq("grade", grade);

  if (error) {
    console.error(error);
    setStudentCount(0);
    showToast("Failed to load student count");
  } else {
    setStudentCount(count ?? 0);
  }
  setLoadingStudentCount(false);
}, [profile?.school, grade]);


  // Fetch quizzes (simple)
  const fetchQuizzes = React.useCallback(async () => {
    if (!profile?.school) return;
    setLoadingQuizzes(true);
    const { data, error } = await supabase
      .from("quizzes")
      .select("id, title, subject, grade, created_at")
      .eq("school", profile.school)
      .eq("grade", grade)
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      showToast("Failed to load quizzes");
      setQuizzes([]);
    } else {
      setQuizzes(data || []);
    }
    setLoadingQuizzes(false);
  }, [profile?.school, grade]);

  // Fetch notes for grade (from Storage bucket notes_g{grade})
  const fetchNotes = React.useCallback(async () => {
    const g = String(grade).replace(/\D/g, "");
    const bucket = `notes_g${g}`;
    if (!/^notes_g(7|8|9|10|11|12)$/.test(bucket)) { setNotes([]); return; }

    setLoadingNotes(true);
    try {
      const { data: files, error } = await supabase.storage
        .from(bucket)
        .list("", { limit: 200, sortBy: { column: "updated_at", order: "desc" } });
      if (error) throw error;

      const rows = await Promise.all((files || []).map(async (f) => {
        const { data, error: urlErr } = await supabase.storage
          .from(bucket)
          .createSignedUrl(f.name, 600);
        if (urlErr) throw urlErr;

        const base = f.name.replace(/\.(pdf|pptx?|png|jpe?g|webp|bin)$/i,"");
        const parts = base.split("__"); // [subject, title, uuid]
        const subject = parts[0]?.replace(/_/g," ") || "General";
        const title = parts[1]?.replace(/_/g," ") || f.name;

        return {
          name: f.name,
          signedUrl: data.signedUrl,
          updated_at: f.updated_at,
          subject,
          title
        };
      }));

      setNotes(rows);
    } catch (e) {
      console.error(e);
      showToast("Failed to load notes");
      setNotes([]);
    } finally {
      setLoadingNotes(false);
    }
  }, [grade]);

  React.useEffect(() => { fetchStudents(); fetchQuizzes(); fetchNotes(); fetchStudentCount();}, [fetchStudents, fetchQuizzes, fetchNotes,fetchStudentCount]);

  const selectedStudent = React.useMemo(() => students.find(s => s.id === selectedId) || null, [students, selectedId]);

  return (
    <div className={`min-h-screen ${tone.pageBg} ${tone.text}`}>
      <div className={`pointer-events-none fixed inset-0 ${tone.starfield}`} />

      {/* NAV */}
      <div className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`mt-4 rounded-2xl ${tone.border} ${tone.panelBg} px-4 py-3 backdrop-blur`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button tone={tone} variant="ghost" onClick={() => window.history.back()}>
                  <ArrowLeft className="mr-2 h-4 w-4"/> Back
                </Button>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone.pageBg.includes('#0B0B0F') ? 'bg-white text-black' : 'bg-[#0B0B0F] text-white'} font-black`}>R</div>
                <span className={`text-sm font-semibold tracking-wide`}>Readease • School</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-2 rounded-2xl ${tone.inputBg} ${tone.border} px-3 py-2`}>
                  <ListTree className="h-4 w-4 opacity-70"/>
                  <select value={grade} onChange={e=>setGrade(e.target.value)} className={`bg-transparent outline-none ${tone.inputText} text-sm`}>
                    {GRADES.map(g => <option key={g} value={g} className="text-black">Grade {g}</option>)}
                  </select>
                </div>

                <Button tone={tone} variant="ghost" onClick={()=>{ fetchStudents(); fetchQuizzes(); fetchNotes(); fetchStudentCount(); }}>
                  <RefreshCw className="mr-2 h-4 w-4"/> Refresh
                </Button>
                   
                <Button tone={tone} variant="ghost" onClick={()=>setOpenUpload(true)}>
                  <Upload className="mr-2 h-4 w-4"/> Upload notes
                </Button>

                <Button tone={tone} onClick={()=>setOpenCreateQuiz(true)}>
                  <Plus className="mr-2 h-4 w-4"/> Create quiz
                </Button>

                <button aria-label="Toggle theme" onClick={()=>setDark(d=>!d)} className={`inline-flex items-center justify-center rounded-2xl px-3 py-3 text-sm font-semibold transition ${tone.buttonGhost}`}>
                  {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <ProfileButton tone={tone} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <Section className="pt-36 pb-20">
        <div className="grid gap-4 xl:grid-cols-[360px,1fr]">
          {/* LEFT: Students in grade */}
          <Card tone={tone} className="p-5">
  <div className="flex items-center justify-between">
    <div className="text-sm font-semibold flex items-center gap-2">
      <Users className="h-4 w-4" />
      Students • Grade {grade}
      <span className="text-xs opacity-70">
        {loadingStudentCount ? "(…)" : `(${studentCount})`}
      </span>
    </div>
  </div>

  {loadingStudents ? (
    <div className="mt-3 text-sm opacity-70">Loading…</div>
  ) : students.length === 0 ? (
    <div className="mt-3 text-sm opacity-70">
      Registered Students will Appear here.
    </div>
  ) : (
    <div className="mt-3 grid gap-2">
      {students.map((s) => (
        <div
          key={s.id}
          className={`flex items-center justify-between rounded-2xl px-4 py-3 ${tone.chipBg} ${tone.border}`}
        >
          <div>
            <div className="font-medium text-sm">{s.full_name || "Student"}</div>
            <div className="text-xs opacity-70">
              Grade {s.grade}
              {s.section ? ` • Section ${s.section}` : ""}
            </div>
          </div>
          <Button tone={tone} variant="ghost" onClick={() => setSelectedId(s.id)}>
            <Eye className="mr-2 h-4 w-4" />
            See
          </Button>
        </div>
      ))}
    </div>
  )}
</Card>


          {/* RIGHT: Quizzes + Notes */}
          <div className="grid gap-4">
            {/* Quizzes */}
            <Card tone={tone} className="p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold flex items-center gap-2"><ClipboardList className="h-4 w-4"/> Quizzes • Grade {grade}</div>
                <Button tone={tone} variant="ghost" onClick={fetchQuizzes}>Refresh</Button>
              </div>
              <div className="mt-3 grid gap-2">
                {loadingQuizzes ? (
                  <div className="text-sm opacity-70">Loading…</div>
                ) : quizzes.length === 0 ? (
                  <div className="text-sm opacity-70">No quizzes yet for this grade.</div>
                ) : (
                  quizzes.map(q => (
                    <div key={q.id} className={`rounded-2xl ${tone.chipBg} ${tone.border} px-4 py-3`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{q.title}</div>
                          <div className="text-xs opacity-70">{q.subject || "General"}</div>
                        </div>
                        <div className="text-xs opacity-70">
                          Created {q.created_at ? new Date(q.created_at).toLocaleString() : "—"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Notes (from Storage) */}
            <Card tone={tone} className="p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold flex items-center gap-2"><BookOpen className="h-4 w-4"/> Notes • Grade {grade}</div>
                <div className="flex gap-2">
                  <Button tone={tone} variant="ghost" onClick={fetchNotes}>Refresh</Button>
                  <Button tone={tone} variant="ghost" onClick={()=>setOpenUpload(true)}><Upload className="mr-2 h-4 w-4"/>Upload</Button>
                </div>
              </div>
              <div className="mt-3 grid gap-2">
                {loadingNotes ? (
                  <div className="text-sm opacity-70">Loading…</div>
                ) : notes.length === 0 ? (
                  <div className="text-sm opacity-70">No notes uploaded for this grade yet.</div>
                ) : (
                  notes.map(n => (
                    <div key={n.name} className={`rounded-2xl ${tone.chipBg} ${tone.border} px-4 py-3 flex items-center justify-between`}>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center rounded-xl px-2 py-1 text-[11px] border border-white/10 bg-white/5">
                          <FileText className="h-4 w-4"/>
                        </span>
                        <div>
                          <div className="text-sm font-medium">{n.title || n.name}</div>
                          <div className="text-xs opacity-70">{n.subject || "General"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button tone={tone} variant="ghost" onClick={()=>window.open(n.signedUrl, "_blank")}><ExternalLink className="h-4 w-4"/></Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Selected student quick panel */}
            <Card tone={tone} className="p-5">
              {!selectedId ? (
                <div className="text-sm opacity-70">Select a student from the left to view details.</div>
              ) : (
                <>
                  <div className="text-sm opacity-80">Student</div>
                  <div className="text-xl font-extrabold">{selectedStudent?.full_name || "Student"}</div>
                  <div className="text-xs opacity-70">
                    Grade {selectedStudent?.grade || grade}
                    {selectedStudent?.section ? ` • Section ${selectedStudent?.section}` : ""}
                  </div>
                  <div className="mt-3 text-sm opacity-70">More analytics coming soon.</div>
                </>
              )}
            </Card>
          </div>
        </div>
      </Section>

      <footer className={`border-top ${tone.divider} ${tone.panelBg}`}>
        <Section className="py-6">
          <div className={`text-xs opacity-70`}>© {new Date().getFullYear()} Readease • School Dashboard</div>
        </Section>
      </footer>

      {/* Modals */}
      <CreateQuizModal
        open={openCreateQuiz}
        onClose={()=>setOpenCreateQuiz(false)}
        tone={tone}
        grade={grade}
        school={profile?.school}
        onCreated={() => { setOpenCreateQuiz(false); fetchQuizzes(); }}
      />
      <UploadNotesModal
        open={openUpload}
        onClose={()=>setOpenUpload(false)}
        tone={tone}
        grade={grade}
        onUploaded={() => { setOpenUpload(false); fetchNotes(); }}
      />

      {!!toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[80]">
          <div className="rounded-xl px-4 py-2 bg-black/80 text-white text-sm">{toast}</div>
        </div>
      )}
    </div>
  );
}
