// StudentProfile.jsx
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sun, Moon, ArrowLeft, User2, School, BadgeCheck, LogOut,
} from "lucide-react";
import { supabase } from "./supabaseClient";

// ==============================================
// Readease – Student Profile (Supabase-backed)
// - Fetches current user via supabase.auth.getUser()
// - Loads profile from public.profiles (id = user.id)
// - Redirects to /login if not authed
// - Redirects to School dashboard if role !== 'Student'
// - Logout uses supabase.auth.signOut()
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

const Card = ({ tone, className = "", children }) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    transition={{ type: "spring", stiffness: 220, damping: 20 }}
    className={`group relative overflow-hidden ${tone.card} transition-all duration-300 ${className}`}
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
            <Link to="/Studentdashboard" className="flex items-center gap-2">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${dark ? "bg-white text-black" : "bg-[#0B0B0F] text-white"} font-black`}>R</div>
              <span className={`text-sm font-semibold tracking-wide ${tone.text}`}>Readease</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link to="/Studentdashboard" className={`hidden sm:inline-flex rounded-2xl px-4 py-2 text-sm ${tone.buttonGhost}`}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Dashboard
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

export default function StudentProfile() {
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
  const [profile, setProfile] = React.useState(null);
  const [email, setEmail] = React.useState("");

  // Theme persistence
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("readease-theme", dark ? "dark" : "light");
  }, [dark]);

  // Load user + profile
  React.useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        const user = userData?.user;
        if (!user) {
          navigate("/login", { replace: true });
          return;
        }

        setEmail(user.email || "");

        // Get profile
        const { data: prof, error: profErr } = await supabase
          .from("profiles")
          .select("full_name, role, school, grade, created_at")
          .eq("id", user.id)
          .maybeSingle();

        if (profErr) throw profErr;

        // If user is not a Student, redirect to their dashboard
        if (prof && prof.role && prof.role !== "Student") {
          navigate("/SchooldashboardGradeFlow", { replace: true });
          return;
        }

        if (mounted) setProfile(prof || { full_name: "Student", role: "Student", school: "—", grade: "—" });
      } catch (e) {
        console.error(e);
        if (mounted) setError(e.message || "Failed to load profile.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [navigate]);

  async function logout() {
    try {
      await supabase.auth.signOut();
    } catch {}
    localStorage.removeItem("readease.session"); // just in case you still keep it
    navigate("/login", { replace: true });
  }

  const name = profile?.full_name || "Student";
  const role = profile?.role || "Student";
  const school = profile?.school || "—";
  const grade = profile?.grade || "—";

  return (
    <div className={`min-h-screen ${tone.pageBg} ${tone.text}`}>
      <div className={`pointer-events-none fixed inset-0 ${tone.starfield}`} />
      <Navbar tone={tone} dark={dark} toggleTheme={() => setDark((d) => !d)} />

      <Section className="pt-36 pb-10">
        {loading ? (
          <div className={`rounded-3xl ${tone.card} p-8 text-center`}>Loading profile…</div>
        ) : error ? (
          <div className={`rounded-3xl ${tone.card} p-8 text-center text-red-400`}>{error}</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left: Identity summary */}
            <Card tone={tone} className="p-6 lg:col-span-2">
              <div className="flex items-start gap-4">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${tone.chipBg} ${tone.border}`}>
                  <User2 className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl font-extrabold">{name}</h1>
                  <p className={`mt-1 text-sm ${tone.textMuted}`}>{email || "—"}</p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className={`rounded-2xl ${tone.chipBg} ${tone.border} px-4 py-3 text-sm`}>
                      <div className="flex items-center gap-2 font-semibold"><BadgeCheck className="h-4 w-4"/> Role</div>
                      <div className={`mt-1 ${tone.textMuted}`}>{role}</div>
                    </div>
                    <div className={`rounded-2xl ${tone.chipBg} ${tone.border} px-4 py-3 text-sm`}>
                      <div className="flex items-center gap-2 font-semibold"><School className="h-4 w-4"/> School</div>
                      <div className={`mt-1 ${tone.textMuted}`}>{school}</div>
                    </div>
                    <div className={`rounded-2xl ${tone.chipBg} ${tone.border} px-4 py-3 text-sm`}>
                      <div className="flex items-center gap-2 font-semibold"><BadgeCheck className="h-4 w-4"/> Grade / Section</div>
                      <div className={`mt-1 ${tone.textMuted}`}>{grade}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Right: Actions */}
            <Card tone={tone} className="p-6">
              <h2 className="text-lg font-semibold">Account actions</h2>
              <div className="mt-4 grid gap-3">
                <Button tone={tone} variant="ghost" className="justify-start" onClick={() => navigate("/Studentdashboard")}>
                  <ArrowLeft className="mr-2 h-4 w-4"/> Back to dashboard
                </Button>
                <Button tone={tone} variant="ghost" className="justify-start" onClick={() => navigate("/settings")}>
                  <User2 className="mr-2 h-4 w-4"/> Profile settings (soon)
                </Button>
                <Button tone={tone} className="justify-start" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4"/> Log out
                </Button>
              </div>
            </Card>
          </div>
        )}
      </Section>

      <footer className={`border-t ${tone.divider} ${tone.panelBg}`}>
        <Section className="py-6">
          <div className={`text-xs ${tone.textMuted}`}>© {new Date().getFullYear()} Readease • Profile</div>
        </Section>
      </footer>
    </div>
  );
}
