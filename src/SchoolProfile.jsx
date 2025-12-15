// SchoolProfile.jsx
import React from "react";
import {
  Sun, Moon, Building2, User2, Mail, School, ShieldCheck, Globe,
  Layers, Users, HardDrive, ArrowLeft, LogOut, Edit, MessageSquare, CheckCircle2, Eye, Send, RefreshCw
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "./supabaseClient";

/* ==============================================
   Readease – School Profile + Doubts Inbox
   - Verifies auth and loads profile (role must be 'School')
   - Loads school row (optional)
   - Doubts panel (reads from public.school_doubts)
   - NEW: “Reply page” button -> /reply (Ree)
   ============================================== */

const TOKENS = {
  dark: {
    pageBg: "bg-[#0B0B0F]",
    text: "text-white",
    textMuted: "text-white/80",
    border: "border-white/10",
    chipBg: "bg-white/5",
    chipRing: "border-white/15",
    panelBg: "bg-black/40",
    starfield: "bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.06),transparent_60%)]",
    card: "rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-[0_8px_30px_rgba(0,0,0,0.12)]",
    buttonPrimary: "text-black bg-white hover:bg-white/90 ring-2 ring-white/0 hover:ring-white/30 shadow-lg shadow-black/10",
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
    starfield: "bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.045),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.035),transparent_60%)]",
    card: "rounded-3xl border border-black/10 bg-white backdrop-blur shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
    buttonPrimary: "text-white bg-[#0B0B0F] hover:bg-[#14141b] ring-2 ring-black/0 hover:ring-black/10",
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

const Card = ({ tone, className = "", children }) => (
  <div className={`group relative overflow-hidden ${tone.card} transition-all duration-300 ${className}`}>
    <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity">
      <div className={`absolute -inset-[1px] rounded-3xl bg-gradient-to-b ${tone.glowBorder} blur-[6px]`} />
    </div>
    {children}
  </div>
);

const Row = ({ tone, icon: Icon, label, value }) => (
  <div className={`flex items-center justify-between rounded-2xl px-4 py-3 ${tone.chipBg} ${tone.border} text-sm`}>
    <div className="flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4 opacity-80" />}
      <span className="opacity-80">{label}</span>
    </div>
    <div className="font-semibold">{value || "—"}</div>
  </div>
);

function StatusPill({ status }) {
  const base = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] border";
  if (status === "replied") return <span className={`${base} border-emerald-500/30 bg-emerald-500/15`}><CheckCircle2 className="h-3.5 w-3.5"/> Replied</span>;
  if (status === "seen")    return <span className={`${base} border-indigo-500/30 bg-indigo-500/15`}><Eye className="h-3.5 w-3.5"/> Seen</span>;
  if (status === "error")   return <span className={`${base} border-red-500/30 bg-red-500/15`}>Error</span>;
  return <span className={`${base} border-yellow-500/30 bg-yellow-500/15`}>New</span>;
}

function QuickReplyRow({ row, tone, onDone }) {
  const [text, setText] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function markSeen() {
    setSaving(true);
    const { error } = await supabase
      .from("school_doubts")
      .update({ status: "seen", updated_at: new Date().toISOString() })
      .eq("id", row.id);
    setSaving(false);
    if (error) return alert(error.message);
    onDone?.();
  }

  async function sendReply() {
    if (!text.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("school_doubts")
      .update({ reply: text.trim(), status: "replied", updated_at: new Date().toISOString() })
      .eq("id", row.id);
    setSaving(false);
    if (error) return alert(error.message);
    setText("");
    onDone?.();
  }

  return (
    <div className="mt-3 flex items-center gap-2">
      <input
        className={`flex-1 rounded-xl px-3 py-2 ${tone.inputBg} ${tone.border} outline-none text-sm`}
        placeholder="Type a reply…"
        value={text}
        onChange={(e)=>setText(e.target.value)}
      />
      <button onClick={markSeen} disabled={saving} className={`rounded-xl px-3 py-2 text-sm ${tone.buttonGhost}`}>
        <Eye className="h-4 w-4 mr-1 inline" /> Mark seen
      </button>
      <button onClick={sendReply} disabled={!text.trim() || saving} className={`rounded-xl px-3 py-2 text-sm ${tone.buttonPrimary}`}>
        <Send className="h-4 w-4 mr-1 inline" /> Send reply
      </button>
    </div>
  );
}

export default function SchoolProfile() {
  const [dark, setDark] = React.useState(() => {
    const saved = localStorage.getItem("readease-theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return true;
  });
  const tone = dark ? TOKENS.dark : TOKENS.light;
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const [email, setEmail] = React.useState("");
  const [profile, setProfile] = React.useState(null);   // {full_name, role, school}
  const [schoolRow, setSchoolRow] = React.useState(null); // {name, region}

  // Doubts state
  const [doubts, setDoubts] = React.useState([]);
  const [loadingDoubts, setLoadingDoubts] = React.useState(false);
  const [dbErr, setDbErr] = React.useState("");
  const [refreshSpin, setRefreshSpin] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("readease-theme", dark ? "dark" : "light");
  }, [dark]);

  // Load profile + school
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");

        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        const user = userData?.user;
        if (!user) { navigate("/login", { replace: true }); return; }
        if (mounted) setEmail(user.email || "");

        const { data: prof, error: profErr } = await supabase
          .from("profiles")
          .select("full_name, role, school, created_at")
          .eq("id", user.id)
          .maybeSingle();
        if (profErr) throw profErr;

        if (!prof || prof.role !== "School") {
          navigate("/Studentdashboard", { replace: true });
          return;
        }
        if (mounted) setProfile(prof);

        if (prof?.school) {
          const { data: s, error: sErr } = await supabase
            .from("schools")
            .select("id, name, region, created_at")
            .eq("name", prof.school)
            .maybeSingle();
          if (!sErr && mounted) setSchoolRow(s || null);
        }
      } catch (e) {
        console.error(e);
        if (mounted) setError(e.message || "Failed to load school profile.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [navigate]);

  // Fetch doubts for current school
  const fetchDoubts = React.useCallback(async () => {
    setLoadingDoubts(true);
    setDbErr("");
    try {
      const { data, error } = await supabase
        .from("school_doubts")
        .select("id, user_id, school, grade, message, status, reply, created_at, updated_at")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Get names/grades for all user_ids in one call
      const ids = [...new Set((data || []).map(r => r.user_id).filter(Boolean))];
      let namesById = {};
      if (ids.length) {
        const { data: profs, error: pErr } = await supabase
          .from("profiles")
          .select("id, full_name, grade")
          .in("id", ids);
        if (pErr) throw pErr;
        namesById = Object.fromEntries((profs || []).map(p => [p.id, { name: p.full_name || "Student", grade: p.grade }]));
      }

      const rows = (data || []).map(r => ({
        ...r,
        studentName: namesById[r.user_id]?.name || "Student",
        studentGrade: namesById[r.user_id]?.grade || r.grade || "",
      }));

      setDoubts(rows);
    } catch (e) {
      console.error(e);
      setDbErr(e.message || "Failed to load doubts");
      setDoubts([]);
    } finally {
      setLoadingDoubts(false);
    }
  }, []);

  // Fetch once profile ready
  React.useEffect(() => { fetchDoubts(); }, [fetchDoubts]);

  // Realtime subscription (catch-all for table)
  React.useEffect(() => {
    const ch = supabase
      .channel("school_doubts_live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "school_doubts" },
        () => fetchDoubts()
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchDoubts]);

  async function logout() {
    try { await supabase.auth.signOut(); } catch {}
    localStorage.removeItem("readease.session");
    navigate("/login", { replace: true });
  }

  const schoolName = schoolRow?.name || profile?.school || "Your School";
  const adminName = profile?.full_name || "Admin";
  const region = schoolRow?.region || "—";
  const role = profile?.role || "School";

  async function manualRefresh() {
    setRefreshSpin(true);
    await fetchDoubts();
    setTimeout(()=>setRefreshSpin(false), 400);
  }

  return (
    <div className={`min-h-screen ${tone.pageBg} ${tone.text}`}>
      <div className={`pointer-events-none fixed inset-0 ${tone.starfield}`} />

      {/* Top bar */}
      <div className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`mt-4 rounded-2xl ${tone.border} ${tone.panelBg} px-4 py-3 backdrop-blur`}>
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${dark ? "bg-white text-black" : "bg-[#0B0B0F] text-white"} font-black`}>R</div>
                <span className={`text-sm font-semibold tracking-wide ${tone.text}`}>Readease</span>
              </Link>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/SchoolDashboardGradeFlow")}
                  className={`hidden sm:inline-flex rounded-2xl px-4 py-2 text-sm ${tone.buttonGhost}`}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Dashboard
                </button>

                {/* Doubts anchor in the same page */}
                
                {/* NEW: Reply page button -> /reply (Ree) */}
                <button
                  onClick={() => navigate("/reply")}
                  className={`hidden sm:inline-flex rounded-2xl px-4 py-2 text-sm ${tone.buttonPrimary}`}
                  title="Open reply page"
                >
                  <Send className="mr-2 h-4 w-4" /> Reply page
                </button>

                <button
                  aria-label="Toggle theme"
                  onClick={() => setDark((d) => !d)}
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

      <Section className="pt-36 pb-6">
        <div className={`inline-flex items-center gap-2 rounded-full ${tone.chipRing} ${tone.chipBg} px-3 py-1 text-xs ${tone.textMuted} backdrop-blur`}>
          <ShieldCheck className="h-3.5 w-3.5" /> Organization Profile
        </div>
        <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold">
          {loading ? "Loading…" : schoolName}
        </h1>
        <p className={`mt-2 ${tone.textMuted}`}>Manage your school identity, regions, and admin contacts.</p>
      </Section>

      <Section className="pb-20">
        {loading ? (
          <div className={`rounded-3xl ${tone.card} p-8 text-center`}>Loading profile…</div>
        ) : error ? (
          <div className={`rounded-3xl ${tone.card} p-8 text-center text-red-400`}>{error}</div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Left column */}
            <div className="lg:col-span-2 grid gap-4">
              <Card tone={tone} className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Building2 className="h-5 w-5" /> School details
                  </h2>
                  <button
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm ${tone.buttonGhost}`}
                    onClick={() => alert("Edit profile coming soon")}
                  >
                    <Edit className="h-4 w-4" /> Edit
                  </button>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Row tone={tone} icon={School} label="School name" value={schoolName} />
                  <Row tone={tone} icon={User2} label="Admin contact" value={adminName} />
                  <Row tone={tone} icon={Mail} label="Contact email" value={email} />
                  <Row tone={tone} icon={Globe} label="Region" value={region} />
                </div>
              </Card>

              {/* ======= DOUBTS PANEL ======= */}
              <Card tone={tone} className="p-6" id="doubts">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" /> Doubts from Students
                  </h2>
                  <div className="flex items-center gap-2">
                    <button onClick={manualRefresh} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm ${tone.buttonGhost}`}>
                      <RefreshCw className={`h-4 w-4 ${refreshSpin ? "animate-spin" : ""}`} /> Refresh
                    </button>
                    {/* Another quick access to Reply page */}
                    <button
                      onClick={() => navigate("/reply")}
                      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm ${tone.buttonPrimary}`}
                    >
                      <Send className="h-4 w-4" /> Reply page
                    </button>
                  </div>
                </div>

                {dbErr && <div className="mt-3 text-sm text-red-400">{dbErr}</div>}

                <div className="mt-4 grid gap-3">
                  {loadingDoubts ? (
                    <div className="text-sm opacity-70">Loading doubts…</div>
                  ) : doubts.length === 0 ? (
                    <div className="text-sm opacity-70">No doubts found.</div>
                  ) : (
                    doubts.map(d => (
                      <div key={d.id} className={`rounded-2xl px-4 py-3 ${tone.chipBg} ${tone.border}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold">
                              {d.studentName} {d.studentGrade ? `• Grade ${d.studentGrade}` : ""}
                            </div>
                            <div className="text-xs opacity-70">{new Date(d.created_at).toLocaleString()}</div>
                          </div>
                          <StatusPill status={d.status} />
                        </div>

                        <div className="mt-2 text-sm whitespace-pre-wrap">{d.message}</div>

                        {d.reply ? (
                          <div className="mt-3 text-sm rounded-xl px-3 py-2 border">
                            <b>Reply:</b> {d.reply}
                          </div>
                        ) : null}

                        <QuickReplyRow row={d} tone={tone} onDone={fetchDoubts} />
                      </div>
                    ))
                  )}
                </div>
              </Card>
              {/* ======= /DOUBTS PANEL ======= */}
            </div>

            {/* Right column */}
            <div className="grid gap-4">
              <Card tone={tone} className="p-6">
                <h2 className="text-lg font-semibold">Actions</h2>
                <div className="mt-4 grid gap-2">
                  <button
                    className={`inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm ${tone.buttonPrimary}`}
                    onClick={() => navigate("/SchoolDashboardGradeFlow")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to dashboard
                  </button>

                  {/* NEW: Reply page action */}
                  <button
                    className={`inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm ${tone.buttonPrimary}`}
                    onClick={() => navigate("/reply")}
                    title="Open reply page"
                  >
                    <Send className="mr-2 h-4 w-4" /> Reply page
                  </button>

                  <button
                    className={`inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm ${tone.buttonGhost}`}
                    onClick={logout}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </button>
                </div>
              </Card>

              <Card tone={tone} className="p-6">
                <h2 className="text-lg font-semibold">Role</h2>
                <div className={`mt-3 rounded-2xl ${tone.chipBg} ${tone.border} px-4 py-3 text-sm flex items-center justify-between`}>
                  <span className="opacity-80 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> Current role
                  </span>
                  <span className="font-semibold">{role}</span>
                </div>
              </Card>
            </div>
          </div>
        )}
      </Section>

      <footer className={`border-t ${tone.divider} ${tone.panelBg}`}>
        <Section className="py-6">
          <div className={`text-xs ${tone.textMuted}`}>© {new Date().getFullYear()} Readease • School Profile</div>
        </Section>
      </footer>
    </div>
  );
}
