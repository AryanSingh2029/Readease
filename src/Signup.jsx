// Signup.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  Sun, Moon, School, User2, Mail, Lock, ChevronDown,
  CheckCircle2, Eye, EyeOff, ShieldCheck, Sparkles
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

// ==============================================
// Readease – Signup Page (Supabase + school list from profiles)
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
    buttonPrimary:
      "text-black bg-white hover:bg-white/90 ring-2 ring-white/0 hover:ring-white/30 shadow-lg shadow-black/10",
    buttonGhost: "text-white/90 bg-white/0 hover:bg-white/10 ring-1 ring-white/15",
    inputBg: "bg-white/5",
    inputText: "text-white",
    inputPlaceholder: "placeholder-white/50",
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
    buttonPrimary:
      "text-white bg-[#0B0B0F] hover:bg-[#14141b] ring-2 ring-black/0 hover:ring-black/10 shadow-lg shadow-black/10",
    buttonGhost: "text-[#0B0B0F] bg-white hover:bg-[#f1f2f6] ring-1 ring-black/10",
    inputBg: "bg-white",
    inputText: "text-[#0B0B0F]",
    inputPlaceholder: "placeholder-black/50",
    divider: "border-black/10",
    glowBorder: "from-[#0B0B0F]/30 via-[#0B0B0F]/10 to-transparent",
  },
};

const Section = ({ className = "", children }) => (
  <section className={`relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{children}</section>
);

const Button = ({ tone, children, type = "button", variant = "primary", className = "", ...props }) => {
  const base = "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0";
  const styles = variant === "primary" ? tone.buttonPrimary : tone.buttonGhost;
  return (
    <button type={type} className={`${base} ${styles} ${className}`} {...props}>
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
            <Link to="/" className="flex items-center gap-2">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${dark ? "bg-white text-black" : "bg-[#0B0B0F] text-white"} font-black`}>R</div>
              <span className={`text-sm font-semibold tracking-wide ${tone.text}`}>Readease</span>
            </Link>
            <div className="flex items-center gap-2">
              <button
                aria-label="Toggle theme"
                onClick={toggleTheme}
                className={`inline-flex items-center justify-center rounded-2xl px-3 py-3 text-sm font-semibold transition ${tone.buttonGhost}`}
                title={dark ? "Switch to light" : "Switch to dark"}
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <Link to="/" className={`hidden sm:inline-flex rounded-2xl px-4 py-2 text-sm ${tone.buttonGhost}`}>Back to Home</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ tone, label, hint, icon: Icon, type = "text", name, value, onChange, autoComplete, children, required = true }) {
  return (
    <label className="block">
      <span className={`text-sm font-medium ${tone.text}`}>{label}</span>
      <div className={`mt-1.5 flex items-center gap-2 ${tone.card} ${tone.inputBg} px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-400/50 transition`}>
        {Icon && <Icon className="h-4 w-4 opacity-70" />}
        {children ? (
          children
        ) : (
          <input
            className={`w-full bg-transparent outline-none ${tone.inputText} ${tone.inputPlaceholder} text-sm`}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            autoComplete={autoComplete}
            placeholder={hint}
            required={required}
          />
        )}
      </div>
    </label>
  );
}

const SECTION_OPTIONS = ["LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

export default function ReadeaseSignup_RoleAware() {
  const [dark, setDark] = React.useState(() => {
    const saved = localStorage.getItem("readease-theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return true;
  });
  const tone = dark ? TOKENS.dark : TOKENS.light;

  const [showPw, setShowPw] = React.useState(false);
  const [showPw2, setShowPw2] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // NEW: school list state (populated from profiles where role='School')
  const [schools, setSchools] = React.useState([]);
  const [schoolsStatus, setSchoolsStatus] = React.useState("loading"); // loading | ok | empty | error

  const [form, setForm] = React.useState({
    fullName: "",
    email: "",
    role: "Student", // Student | School
    school: "",
    section: "",
    password: "",
    confirm: "",
    accept: false,
  });

  const navigate = useNavigate();

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  // 🔹 Load schools from profiles (role = 'School'), dedupe client-side
  React.useEffect(() => {
  (async () => {
    try {
      setSchoolsStatus("loading");

      // Preferred: distinct schools via RPC (works for anon)
      const { data: rpc, error: eRpc } = await supabase
        .rpc("get_schools_from_profiles");

      if (eRpc) throw eRpc;

      const names = (rpc || []).map(r => (r.name || "").trim()).filter(Boolean);
      if (names.length) {
        setSchools(names);
        setSchoolsStatus("ok");
      } else {
        setSchools([]);
        setSchoolsStatus("empty");
      }
    } catch (e) {
      console.error(e);
      setSchools([]);
      setSchoolsStatus("error");
    }
  })();
}, []);


  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.role === "Student" && !form.section) {
      setError("Please select your Section/Class.");
      return;
    }
    if (form.role === "Student" && !form.school) {
      setError("Please choose your School from the list.");
      return;
    }

    try {
      setLoading(true);

      // 1) Create auth user
      const { data, error: signErr } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
            role: form.role,
            school: form.school,
            grade: form.role === "Student" ? form.section : null,
          },
        },
      });
      if (signErr) throw signErr;

      const user = data.user;
      if (!user) {
        navigate("/login");
        return;
      }

      // 2) Upsert profile row
      const { error: profErr } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: form.fullName,
          role: form.role,
          school: form.school,
          grade: form.role === "Student" ? form.section : null,
        });
      if (profErr) throw profErr;

      alert("Account created! Please log in.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong while creating your account.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("readease-theme", dark ? "dark" : "light");
  }, [dark]);

  const isStudent = form.role === "Student";

  return (
    <div className={`min-h-screen ${tone.pageBg} ${tone.text}`}>
      <div className={`pointer-events-none fixed inset-0 ${tone.starfield}`} />
      <Navbar tone={tone} dark={dark} toggleTheme={() => setDark((d) => !d)} />

      <Section className="pt-36 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left copy */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className={`inline-flex items-center gap-2 rounded-full ${tone.chipRing} ${tone.chipBg} px-3 py-1 text-xs ${tone.textMuted} backdrop-blur`}>
              <Sparkles className="h-3.5 w-3.5" /> Accessibility-first signup
            </div>
            <h1 className={`mt-3 text-3xl sm:text-4xl font-extrabold ${tone.text}`}>Create your Readease account</h1>
            <p className={`mt-3 max-w-xl ${tone.textMuted}`}>
              Join your school on Readease to simplify reading, listen with word-level highlighting, and get personalized practice.
              Teachers get dashboards; students get clarity.
            </p>

            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {["Role-based access", "School roster sync", "Built-in accommodations", "Low-bandwidth ready"].map((t, i) => (
                <div key={i} className={`flex items-center gap-2 rounded-2xl ${tone.chipBg} ${tone.border} px-4 py-3 text-sm ${tone.textMuted}`}>
                  <CheckCircle2 className="h-4 w-4" /> {t}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.form
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`relative ${tone.card} p-6 sm:p-8`}
          >
            <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition-opacity">
              <div className={`absolute -inset-[1px] rounded-3xl bg-gradient-to-b ${tone.glowBorder} blur-[6px]`} />
            </div>

            <div className="grid gap-4">
              <Field tone={tone} label="Full name" hint="Aryan Singh" icon={User2} name="fullName" value={form.fullName} onChange={onChange} autoComplete="name" />
              <Field tone={tone} label="Email" hint="you@school.edu" icon={Mail} name="email" value={form.email} onChange={onChange} autoComplete="email" type="email" />

              {/* Role */}
              <label className="block">
                <span className={`text-sm font-medium ${tone.text}`}>Role</span>
                <div className={`mt-1.5 flex items-center gap-2 ${tone.card} ${tone.inputBg} px-3 py-2`}>
                  <School className="h-4 w-4 opacity-70" />
                  <select
                    name="role"
                    value={form.role}
                    onChange={onChange}
                    className={`w-full bg-transparent outline-none ${tone.inputText} text-sm`}
                  >
                    <option className="text-black">Student</option>
                    <option className="text-black">School</option>
                  </select>
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </div>
              </label>

              {/* School + Section */}
              <div className={`grid ${isStudent ? "sm:grid-cols-2" : "grid-cols-1"} gap-4`}>
                {/* If STUDENT → dropdown from DB. If SCHOOL → free text (can register new school). */}
                {isStudent ? (
                  <label className="block">
                    <span className={`text-sm font-medium ${tone.text}`}>School</span>
                    <div className={`mt-1.5 flex items-center gap-2 ${tone.card} ${tone.inputBg} px-3 py-2`}>
                      <School className="h-4 w-4 opacity-70" />
                      <select
                        name="school"
                        value={form.school}
                        onChange={onChange}
                        className={`w-full bg-transparent outline-none ${tone.inputText} text-sm`}
                        required
                        disabled={schoolsStatus === "loading" || schoolsStatus === "error"}
                      >
                        {schoolsStatus === "loading" && <option className="text-black">Loading schools…</option>}
                        {schoolsStatus === "error" && <option className="text-black">Failed to load schools</option>}
                        {schoolsStatus === "empty" && <option className="text-black">No schools yet</option>}
                        {schoolsStatus === "ok" && (
                          <>
                            <option className="text-black" value="">Choose…</option>
                            {schools.map((s) => (
                              <option key={s} className="text-black" value={s}>{s}</option>
                            ))}
                          </>
                        )}
                      </select>
                      <ChevronDown className="h-4 w-4 opacity-70" />
                    </div>
                  </label>
                ) : (
                  <Field
                    tone={tone}
                    label="School"
                    hint="Enter your school/institution name"
                    icon={School}
                    name="school"
                    value={form.school}
                    onChange={onChange}
                    autoComplete="organization"
                  />
                )}

                {isStudent && (
                  <label className="block">
                    <span className={`text-sm font-medium ${tone.text}`}>Section / Class</span>
                    <div className={`mt-1.5 flex items-center gap-2 ${tone.card} ${tone.inputBg} px-3 py-2`}>
                      <User2 className="h-4 w-4 opacity-70" />
                      <select
                        name="section"
                        value={form.section}
                        onChange={onChange}
                        className={`w-full bg-transparent outline-none ${tone.inputText} text-sm`}
                        required
                      >
                        <option className="text-black" value="">Choose…</option>
                        {SECTION_OPTIONS.map((opt) => (
                          <option key={opt} className="text-black" value={opt}>{opt}</option>
                        ))}
                      </select>
                      <ChevronDown className="h-4 w-4 opacity-70" />
                    </div>
                  </label>
                )}
              </div>

              {/* Password */}
              <label className="block">
                <span className={`text-sm font-medium ${tone.text}`}>Password</span>
                <div className={`mt-1.5 flex items-center gap-2 ${tone.card} ${tone.inputBg} px-3 py-2`}>
                  <Lock className="h-4 w-4 opacity-70" />
                  <input
                    className={`w-full bg-transparent outline-none ${tone.inputText} ${tone.inputPlaceholder} text-sm`}
                    type={showPw ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    required
                  />
                  <button type="button" onClick={() => setShowPw((s) => !s)} className="opacity-70 hover:opacity-100">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              <label className="block">
                <span className={`text-sm font-medium ${tone.text}`}>Confirm password</span>
                <div className={`mt-1.5 flex items-center gap-2 ${tone.card} ${tone.inputBg} px-3 py-2`}>
                  <Lock className="h-4 w-4 opacity-70" />
                  <input
                    className={`w-full bg-transparent outline-none ${tone.inputText} ${tone.inputPlaceholder} text-sm`}
                    type={showPw2 ? "text" : "password"}
                    name="confirm"
                    value={form.confirm}
                    onChange={onChange}
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    required
                  />
                  <button type="button" onClick={() => setShowPw2((s) => !s)} className="opacity-70 hover:opacity-100">
                    {showPw2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              <label className="mt-2 flex items-start gap-3 text-sm">
                <input type="checkbox" name="accept" checked={form.accept} onChange={onChange} className="mt-1 h-4 w-4 rounded" required />
                <span className={`${tone.textMuted}`}>
                  I agree to the <a className="underline" href="#">Terms</a> and <a className="underline" href="#">Privacy Policy</a>. Readease is designed with
                  <span className="inline-flex items-center gap-1 ml-1"><ShieldCheck className="h-4 w-4" /> privacy & consent</span> by default.
                </span>
              </label>

              {error && <div className="mt-2 text-sm text-red-400">{error}</div>}

              <div className="mt-3 flex flex-col sm:flex-row gap-3">
                <Button tone={tone} type="submit" variant="primary" className="w-full sm:w-auto" disabled={loading}>
                  {loading ? "Creating..." : "Create account"}
                </Button>
              </div>

              <p className={`mt-2 text-sm ${tone.textMuted}`}>
                Already have an account? <Link to="/login" className="underline">Log in</Link>
              </p>
            </div>
          </motion.form>
        </div>
      </Section>

      <footer className={`mt-6 border-t ${tone.divider} ${tone.panelBg}`}>
        <Section className="py-6">
          <div className={`text-xs ${tone.textMuted}`}>© {new Date().getFullYear()} Readease • Accessibility-first learning for dyslexic readers.</div>
        </Section>
      </footer>
    </div>
  );
}
