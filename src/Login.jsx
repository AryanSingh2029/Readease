// Login.jsx (role-enforced with Supabase)
import React from "react";
import { motion } from "framer-motion";
import {
  Sun, Moon, Mail, Lock, Eye, EyeOff, ShieldCheck, Sparkles,
  KeyRound, ArrowLeft, School, ChevronDown
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

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
      "text-white bg-[#0B0B0F] hover:bg-[#14141b] ring-2 ring-black/0 hover:ring-black/10",
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
              <Link to="/" className={`hidden sm:inline-flex rounded-2xl px-4 py-2 text-sm ${tone.buttonGhost}`}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Home
              </Link>
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

export default function Login_RoleAware() {
  const [dark, setDark] = React.useState(() => {
    const saved = localStorage.getItem("readease-theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return true;
  });
  const tone = dark ? TOKENS.dark : TOKENS.light;

  const [showPw, setShowPw] = React.useState(false);
  const [form, setForm] = React.useState({ email: "", password: "", remember: true, role: "Student" });
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1) Supabase sign-in
      const { data, error: signErr } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });
      if (signErr) throw signErr;

      const user = data.user;
      if (!user) throw new Error("No user returned from Supabase.");

      // 2) Get role from profiles (fallback to user_metadata.role)
      let profileRole = user?.user_metadata?.role || null;

      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("role, full_name, school, grade")
        .eq("id", user.id)
        .maybeSingle();

      if (!profErr && prof) profileRole = prof.role || profileRole;

      if (!profileRole) {
        await supabase.auth.signOut();
        throw new Error("Your account role is not set. Please sign up again.");
      }

      // 3) Enforce role against the selected dropdown
      if (form.role !== profileRole) {
        await supabase.auth.signOut();
        throw new Error(
          `This account is '${profileRole}'. Please select '${profileRole}' in the role dropdown to log in.`
        );
      }

      // 4) Optional: store minimal session locally
      localStorage.setItem(
        "readease.session",
        JSON.stringify({
          email: user.email,
          role: profileRole,
          name: prof?.full_name || user.email?.split("@")[0],
          school: prof?.school || "",
          grade: prof?.grade || "",
        })
      );

      // 5) Route by role (match your App.jsx exact paths)
      if (profileRole === "Student") {
        navigate("/Studentdashboard");
      } else {
        navigate("/SchooldashboardGradeFlow");
      }
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("readease-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className={`min-h-screen ${tone.pageBg} ${tone.text}`}>
      <div className={`pointer-events-none fixed inset-0 ${tone.starfield}`} />
      <Navbar tone={tone} dark={dark} toggleTheme={() => setDark((d) => !d)} />

      <Section className="pt-36 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left copy */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className={`inline-flex items-center gap-2 rounded-full ${tone.chipRing} ${tone.chipBg} px-3 py-1 text-xs ${tone.textMuted} backdrop-blur`}>
              <Sparkles className="h-3.5 w-3.5" /> Welcome back
            </div>
            <h1 className={`mt-3 text-3xl sm:text-4xl font-extrabold ${tone.text}`}>Log in to Readease</h1>
            <p className={`mt-3 max-w-xl ${tone.textMuted}`}>
              Continue your reading journey with OCR + simplification + read-aloud. Teachers can jump into dashboards and act fast.
            </p>
            <ul className={`mt-6 grid gap-2 text-sm ${tone.textMuted}`}>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Role-based access & audit</li>
              <li className="flex items-center gap-2"><KeyRound className="h-4 w-4" /> SSO-ready, password or magic link</li>
            </ul>
          </motion.div>

          {/* Right: Form */}
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
              {/* Role selector (enforced against profile on submit) */}
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

              <Field tone={tone} label="Email" hint="you@school.edu" icon={Mail} name="email" value={form.email} onChange={onChange} autoComplete="email" type="email" />

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
                    autoComplete="current-password"
                    placeholder="Your password"
                    required
                  />
                  <button type="button" onClick={() => setShowPw((s) => !s)} className="opacity-70 hover:opacity-100">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              <div className="mt-1 flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" name="remember" checked={form.remember} onChange={onChange} className="h-4 w-4 rounded" />
                  <span className={`${tone.textMuted}`}>Remember me</span>
                </label>
                <Link to="/forgot" className="underline opacity-90 hover:opacity-100">Forgot password?</Link>
              </div>

              {error && <div className="text-sm text-red-400">{error}</div>}

              <div className="mt-3 flex flex-col sm:flex-row gap-3">
                <Button tone={tone} type="submit" variant="primary" className="w-full sm:w-auto" disabled={loading}>
                  {loading ? "Logging in..." : "Log in"}
                </Button>
              </div>

              <p className={`mt-2 text-sm ${tone.textMuted}`}>
                New to Readease? <Link to="/signup" className="underline">Create an account</Link>
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
