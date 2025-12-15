// src/SimplifyDoc.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  Sun, Moon, ArrowLeft, Upload, FileUp, Wand2,
  Volume2, Pause, StopCircle, SlidersHorizontal,
  Highlighter, Eye, Type
} from "lucide-react";

/* =========================
   Helpers: Local module loaders
   ========================= */
async function ocrImage(fileOrCanvas, lang = "eng", onStatus = () => {}) {
  const T = await import("tesseract.js");
  const worker = await T.createWorker(lang, 1, {
    logger: (m) => m.status === "recognizing text" && onStatus(`Recognizing: ${Math.round(m.progress * 100)}%`)
  });
  const { data: { text } } = await worker.recognize(fileOrCanvas);
  await worker.terminate();
  return text || "";
}

async function extractPdfWithOcr(file, lang = "eng", onStatus = () => {}) {
  // Local pdf.js + local worker
  const pdfjsLib = await import("pdfjs-dist/build/pdf");
  const workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

  let out = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    onStatus(`Processing PDF page ${i}/${pdf.numPages}…`);
    const page = await pdf.getPage(i);

    // Try fast text layer
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(it => ("str" in it ? it.str : "")).join(" ").trim();

    if (pageText.length > 30) {
      out += pageText + "\n\n";
      continue;
    }

    // Fallback OCR
    const viewport = page.getViewport({ scale: 1.6 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width; canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    await page.render({ canvasContext: ctx, viewport }).promise;
    out += (await ocrImage(canvas, lang, onStatus)) + "\n\n";
  }
  return out.trim();
}

async function extractDocx(file) {
  // Mammoth browser build from npm
  const mammoth = await import("mammoth/mammoth.browser.js");
  const buf = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
  return value || "";
}

/* =========================
   Gemini helpers (uses .env.local)
   ========================= */
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_EP = GEMINI_KEY
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`
  : null;

const LANGUAGE_MAP = { eng: "English", hin: "Hindi", tam: "Tamil" };

async function geminiFormat(text, lang = "eng") {
  if (!GEMINI_EP) return text;
  const prompt =
`You correct OCR text for readability, preserving meaning.
Language: ${LANGUAGE_MAP[lang] || "Original"}.
Tasks:
- Fix OCR errors (split/merged words, punctuation, stray hyphens).
- Keep original meaning; restore paragraphs.
- Do NOT add opinions or remove facts.
Output only the cleaned text.`;
  const body = {
    contents: [{ parts: [{ text }] }],
    systemInstruction: { parts: [{ text: prompt }] },
    generationConfig: { temperature: 0.2, topP: 0.9, maxOutputTokens: 2048 }
  };
  const r = await fetch(GEMINI_EP, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const j = await r.json();
  if (j?.error) throw new Error(`Gemini API (format): ${j.error.message || "Unknown error"}`);
  return j?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text;
}

async function geminiSummarize(text, lang = "eng") {
  if (!GEMINI_EP) return text;
  const prompt =
`Summarize clearly in ${LANGUAGE_MAP[lang] || "the same language"} for a general audience.
Constraints:
- Summarize the whole document nicely and present in a flow so we can understand the story 
- Prefer bullet points if it improves clarity.
- Target length: ~8–20 short sentences (or bullets).
- Do not change the language.
Output only the summary.`;
  const body = {
    contents: [{ parts: [{ text }] }],
    systemInstruction: { parts: [{ text: prompt }] },
    generationConfig: { temperature: 0.3, topP: 0.9, maxOutputTokens: 640 }
  };
  const r = await fetch(GEMINI_EP, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const j = await r.json();
  if (j?.error) throw new Error(`Gemini API (summarize): ${j.error.message || "Unknown error"}`);
  return j?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text;
}

/* =========================
   Local extractive summarizer (fallback/booster)
   ========================= */
const STOPWORDS = {
  eng: new Set("a an the and or but if then with without within to from by on in at of for as is are was were be been being it its this that those these there here about above below over under again further once only very more most some such no nor not than too can will just into between after before during each other same own yourself himself herself themselves ourselves".split(/\s+/)),
  hin: new Set("और पर में है हैं था थे थी तो से को की का के यह ये वह वे जो तक भी ही आदि जैसे तथा।".split(/\s+/)),
  tam: new Set("மற்றும் அது இது அவர் அவர்கள் ஆகிறது உள்ள உள்ளனர் என்று இந்த அந்த ஒரு இரண்டு மேலும் மிகவும் மட்டும் போன்றவை போன்ற".split(/\s+/))
};
function smartSummarize(text, lang = "eng", maxSentences = 8) {
  const clean = text.replace(/\s+/g, " ").trim();
  const sents = clean.split(/(?<=[.?!।])\s+/).filter(Boolean);
  if (sents.length <= maxSentences) return clean;

  const stop = STOPWORDS[lang] || STOPWORDS.eng;
  const words = clean.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  const freq = new Map();
  for (const w of words) {
    if (stop.has(w)) continue;
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  // sentence score = sum of word frequencies (normalized) + small positional bonus
  const scored = sents.map((s, idx) => {
    const tokens = s.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
    const score = tokens.reduce((acc, w) => acc + (freq.get(w) || 0), 0) / Math.log(2 + tokens.length);
    return { s, idx, score: score + (1 / (1 + idx * 0.15)) };
  });
  scored.sort((a, b) => b.score - a.score);
  const picked = scored.slice(0, maxSentences).sort((a, b) => a.idx - b.idx).map(o => o.s.trim());
  return picked.join(" ");
}

/* =========================
   UI tokens / primitives
   ========================= */
const TOKENS = {
  dark: {
    pageBg: "bg-[#0B0B0F]", text: "text-white", textMuted: "text-white/80",
    border: "border-white/10", chipBg: "bg-white/5", chipRing: "border-white/15",
    panelBg: "bg-black/40",
    starfield:
      "bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.06),transparent_60%)]",
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
    starfield:
      "bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.045),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.035),transparent_60%)]",
    card: "rounded-3xl border border-black/10 bg-white backdrop-blur shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
    cardHover: "hover:-translate-y-0.5 hover:border-black/20",
    buttonPrimary: "text-white bg-[#0B0B0F] hover:bg-[#14141b] ring-2 ring-black/0 hover:ring-black/10 shadow-lg shadow-black/10",
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
                <span className="text-sm font-semibold tracking-wide">Readease</span>
              </a>
            </div>
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
  );
}

/* =========================
   Simplifier + ruler
   ========================= */
const SIMPLE_MAP = new Map([
  [/(utilize|use)/gi, "use"], [/(commence|begin)/gi, "start"], [/(terminate|cease|stop)/gi, "stop"],
  [/(assistance|aid)/gi, "help"], [/(approximately|around)/gi, "about"], [/(purchase|acquire|obtain)/gi, "get"],
  [/(however)/gi, "but"],
]);
function simplifyText(text, level){
  if(!text) return "";
  let out = text;
  SIMPLE_MAP.forEach((simple, re) => { out = out.replace(re, simple); });
  const sentences = out.split(/(?<=[.!?।])\s+/).map(s => s.trim()).filter(Boolean);
  const maxLen = [28, 24, 20, 16, 12][Math.min(Math.max(level-1,0),4)];
  out = sentences.map(s => s.split(/\s+/).slice(0, maxLen).join(" ")).join(" ").replace(/\s+/g, " ").trim();
  return out;
}
function overlayTint(kind){
  switch(kind){
    case 'cream': return 'rgba(253,244,226,0.55)';
    case 'blue':  return 'rgba(209,227,255,0.45)';
    case 'gray':  return 'rgba(180,180,180,0.35)';
    default:      return 'transparent';
  }
}
function ReadingRuler({ enabled, color = "rgba(255,255,255,0.06)" }){
  const ref = React.useRef(null);
  const [y, setY] = React.useState(0);
  React.useEffect(() => {
    if(!enabled) return;
    const el = ref.current?.parentElement;
    if(!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      setY(e.clientY - rect.top - 16);
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, [enabled]);
  if(!enabled) return null;
  return <div ref={ref} className="pointer-events-none absolute inset-x-2" style={{ top: y, height: 32, background: color, borderRadius: 12 }} />;
}

/* =========================
   TTS helpers (multilingual, boundary highlighting)
   ========================= */
function getLangTag(lang) {
  // Map OCR/lang selector to BCP-47 tags that browsers/voices commonly expose
  switch (lang) {
    case "hin": return "hi-IN";
    case "tam": return "ta-IN";
    default:    return "en-IN"; // Indian English first; browsers fall back automatically if missing
  }
}
function pickVoiceFor(langTag, voices) {
  // Try exact match; then startsWith language; then any en/hi/ta; else first voice
  const exact = voices.find(v => v.lang?.toLowerCase() === langTag.toLowerCase());
  if (exact) return exact;
  const base = langTag.split("-")[0];
  const starts = voices.find(v => v.lang?.toLowerCase().startsWith(base));
  if (starts) return starts;
  if (base !== "en") {
    const en = voices.find(v => v.lang?.toLowerCase().startsWith("en"));
    if (en) return en;
  }
  return voices[0] || null;
}

/* =========================
   Dropzone using local + improved summarization
   ========================= */
function Dropzone({ tone, lang, onResult, setStatus }) {
  const [drag, setDrag] = React.useState(false);
  const inputRef = React.useRef(null);

  async function processFiles(files){
    if(!files || !files.length) return;
    const f = files[0];
    try {
      setStatus("Extracting…");
      let raw = "";
      if (f.type.startsWith("image/")) {
        raw = await ocrImage(f, lang, setStatus);
      } else if (f.type === "application/pdf") {
        raw = await extractPdfWithOcr(f, lang, setStatus);
      } else if (f.name.toLowerCase().endsWith(".docx")) {
        raw = await extractDocx(f);
      } else {
        raw = await f.text();
      }

      setStatus("Cleaning text…");
      const formatted = await geminiFormat(raw, lang);

      // Local high-quality extractive summary first
      let localSummary = formatted;
      if (formatted.length > 420) {
        localSummary = smartSummarize(formatted, lang, 8);
      }

      // Optionally paraphrase via Gemini for simpler language
      setStatus("Summarizing…");
      const simplified = await geminiSummarize(localSummary, lang);

      onResult({ raw: formatted, simplified });
    } catch (e) {
      alert(`Could not extract/summarize this file.\n\n${e?.message || ""}`);
      // Fallback to local-only if Gemini failed after extraction:
      try {
        if (setStatus) setStatus("Using local fallback…");
        const localText = await (async () => {
          // if 'raw' didn't exist (e.g., thrown before), just no-op:
          return typeof raw === "string" && raw ? raw : "";
        })();
        if (localText) {
          const cleaned = localText; // we already cleaned if format step passed
          const localSummary = smartSummarize(cleaned || localText, lang, 8);
          onResult({ raw: cleaned || localText, simplified: localSummary });
        }
      } catch {}
    } finally {
      setStatus("");
    }
  }

  return (
    <div
      onDragOver={(e)=>{ e.preventDefault(); setDrag(true); }}
      onDragLeave={()=>setDrag(false)}
      onDrop={(e)=>{ e.preventDefault(); setDrag(false); processFiles(e.dataTransfer.files); }}
      className={`relative rounded-3xl border-2 border-dashed p-8 text-sm transition ${drag ? 'border-emerald-400/70 bg-emerald-400/5' : 'border-white/15'} ${tone.inputBg}`}
    >
      <div className="flex items-center justify-center gap-3 text-center flex-col">
        <FileUp className="h-6 w-6 opacity-80"/>
        <div className="opacity-90">Drop your <b>PNG/JPG</b>, <b>PDF</b>, or <b>DOCX</b> here</div>
        <div className="opacity-60">or</div>
        <Button tone={tone} variant="ghost" onClick={()=>inputRef.current?.click()}><Upload className="mr-2 h-4 w-4"/>Choose file</Button>
        <input ref={inputRef} type="file" accept="image/*,application/pdf,.docx" className="hidden" onChange={(e)=> processFiles(e.target.files)} />
      </div>
    </div>
  );
}

/* =========================
   Main component
   ========================= */
export default function SimplifyDoc(){
  const [dark, setDark] = React.useState(() => localStorage.getItem("readease-theme") !== "light");
  const tone = dark ? TOKENS.dark : TOKENS.light;
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("readease-theme", dark ? "dark" : "light");
  }, [dark]);

  const [level, setLevel] = React.useState(3);
  const [overlay, setOverlay] = React.useState('none');
  const [useDyslexic, setUseDyslexic] = React.useState(true);
  const [wordSpace, setWordSpace] = React.useState(0.08);
  const [lineSpace, setLineSpace] = React.useState(1.65);
  const [ruler, setRuler] = React.useState(false);
  const [lang, setLang] = React.useState("eng");

  const [extracted, setExtracted] = React.useState("");
  const [result, setResult] = React.useState("");
  const [status, setStatus] = React.useState("");

  function handleResult({ raw, simplified }) {
    setExtracted(raw || "");
    const base = simplified || raw || "";
    setResult(simplifyText(base, level));
  }

  // ====== TTS (multilingual with boundary highlighting) ======
  const [reading, setReading] = React.useState(false);
  const [wordIndex, setWordIndex] = React.useState(-1);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const voicesRef = React.useRef([]);
  const utterRef = React.useRef(null);
  const wordBoundariesRef = React.useRef([]);

  React.useEffect(() => {
    if (!synth) return;
    function loadVoices() {
      const v = synth.getVoices() || [];
      voicesRef.current = v;
    }
    loadVoices();
    synth.addEventListener?.('voiceschanged', loadVoices);
    return () => synth.removeEventListener?.('voiceschanged', loadVoices);
  }, [synth]);

  function buildWordBoundaries(text) {
    // Map char index -> word index for onboundary callbacks
    const parts = text.split(/\s+/);
    const boundaries = [];
    let idx = 0;
    parts.forEach((w, i) => {
      boundaries.push({ start: idx, i });
      idx += w.length + 1; // +1 for space
    });
    return boundaries;
  }

  function getLangBadge() {
    return (
      <span className={`text-xs px-2 py-1 rounded-lg ${
        GEMINI_EP ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-400/30'
      }`}>
        {GEMINI_EP ? 'Gemini ✓' : 'Local-only'}
      </span>
    );
  }

  function startTTS(){
    if(!result || !synth) {
      alert("Speech Synthesis is not available in this browser.");
      return;
    }
    stopTTS();

    const langTag = getLangTag(lang);
    const voice = pickVoiceFor(langTag, voicesRef.current);
    const utter = new SpeechSynthesisUtterance(result);
    utter.lang = voice?.lang || langTag;
    if (voice) utter.voice = voice;

    // Rate slightly slower for higher difficulty
    utter.rate = Math.max(0.8, 1.0 - (level - 3) * 0.05);
    utter.onend = () => { setReading(false); setWordIndex(-1); utterRef.current = null; };

    // Accurate highlighting using boundary events
    wordBoundariesRef.current = buildWordBoundaries(result);
    utter.onboundary = (ev) => {
      if (ev.name === "word" || ev.charIndex >= 0) {
        const charIdx = ev.charIndex ?? 0;
        const list = wordBoundariesRef.current;
        let i = 0;
        while (i + 1 < list.length && list[i + 1].start <= charIdx) i++;
        setWordIndex(list[i]?.i ?? -1);
      }
    };

    utterRef.current = utter;
    setReading(true);
    synth.speak(utter);
  }
  function pauseTTS(){ try{ synth?.pause(); }catch{} setReading(false); }
  function resumeTTS(){ try{ synth?.resume(); }catch{} setReading(true); }
  function stopTTS(){ try{ synth?.cancel(); }catch{} setReading(false); setWordIndex(-1); utterRef.current = null; }

  return (
    <div className={`min-h-screen ${tone.pageBg} ${tone.text}`}>
      <div className={`pointer-events-none fixed inset-0 ${tone.starfield}`} />
      <Navbar tone={tone} dark={dark} toggleTheme={() => setDark(d => !d)} />

      <Section className="pt-36 pb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className={`inline-flex items-center gap-2 rounded-full ${tone.chipRing} ${tone.chipBg} px-3 py-1 text-xs ${tone.textMuted} backdrop-blur`}>
              <Wand2 className="h-3.5 w-3.5"/> Simplify a document
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold">Drop a file → extract → simplify → listen</h1>
            <p className={`mt-2 ${tone.textMuted}`}>
              Works fully local: Tesseract (images), pdf.js (PDF with OCR fallback), Mammoth (DOCX). Gemini is optional via <code>VITE_GEMINI_API_KEY</code>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={lang}
              onChange={(e)=> setLang(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm text-black"
              title="OCR / LLM / TTS language"
            >
              <option value="eng">English</option>
              <option value="hin">Hindi</option>
              <option value="tam">Tamil</option>
            </select>
            {getLangBadge()}
          </div>
        </div>
      </Section>

        <Section className="pb-20">
          <div className="grid gap-4 lg:grid-cols-[420px,1fr]">
            <Card tone={tone} className="p-5">
              <Dropzone tone={tone} lang={lang} onResult={handleResult} setStatus={setStatus} />

              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold flex items-center gap-2"><SlidersHorizontal className="h-4 w-4"/> Reading level</label>
                  <span className="text-xs opacity-70">{level} / 5</span>
                </div>
                <input
                  type="range" min={1} max={5} value={level}
                  onChange={(e)=>{ const v=Number(e.target.value); setLevel(v); if(extracted) setResult(simplifyText(extracted, v)); }}
                  className="w-full"
                />
              </div>

              <div className="mt-5 grid gap-3">
                <label className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><Type className="h-4 w-4"/> Dyslexia-friendly font</span>
                  <input type="checkbox" checked={useDyslexic} onChange={(e)=> setUseDyslexic(e.target.checked)} />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span>Word spacing</span>
                  <input type="range" min={0} max={0.24} step={0.02} value={wordSpace} onChange={(e)=>setWordSpace(Number(e.target.value))} />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span>Line spacing</span>
                  <input type="range" min={1.2} max={2} step={0.05} value={lineSpace} onChange={(e)=>setLineSpace(Number(e.target.value))} />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><Highlighter className="h-4 w-4"/> Color overlay</span>
                  <select value={overlay} onChange={(e)=> setOverlay(e.target.value)} className="rounded-xl px-2 py-1 text-sm text-black">
                    <option value="none">None</option>
                    <option value="cream">Cream</option>
                    <option value="blue">Blue</option>
                    <option value="gray">Gray</option>
                  </select>
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><Eye className="h-4 w-4"/> Reading ruler</span>
                  <input type="checkbox" checked={ruler} onChange={(e)=>setRuler(e.target.checked)} />
                </label>
              </div>

              <div className="mt-5 flex gap-2">
                <Button tone={tone} onClick={()=>{ if(!extracted){ alert('Drop a file first.'); return; } setResult(simplifyText(extracted, level)); }}>
                  <Wand2 className="mr-2 h-4 w-4"/> Re-simplify
                </Button>
                <Button tone={tone} variant="ghost" onClick={()=>{ setExtracted(''); setResult(''); setStatus(''); setWordIndex(-1); }}>Clear</Button>
              </div>

              <div className="mt-4 text-xs opacity-70">
                Everything loads from <code>localhost</code>; Chrome/Edge may require a click before audio can play.
              </div>
            </Card>

            <Card tone={tone} className="relative p-0 overflow-hidden">
              <div className="absolute inset-0 pointer-events-none" style={{ background: overlayTint(overlay) }} />
              <div className="p-5 pb-3 border-b border-white/10 flex items-center justify-between">
                <div className="text-sm opacity-80">Simplified text</div>
                <div className="flex items-center gap-2">
                  {!result ? null : !reading ? (
                    <Button tone={tone} onClick={startTTS}><Volume2 className="mr-2 h-4 w-4"/>Read aloud</Button>
                  ) : (
                    <>
                      <Button tone={tone} variant="ghost" onClick={pauseTTS}><Pause className="mr-2 h-4 w-4"/>Pause</Button>
                      <Button tone={tone} variant="ghost" onClick={resumeTTS}>Resume</Button>
                      <Button tone={tone} variant="ghost" onClick={stopTTS}><StopCircle className="mr-2 h-4 w-4"/>Stop</Button>
                    </>
                  )}
                </div>
              </div>

              <div className="relative h-[60vh] overflow-y-auto p-6">
                <ReadingRuler enabled={ruler} />
                {!result ? (
                  <div className="text-sm opacity-70">Drop a file on the left. The simplified text will appear here.</div>
                ) : (
                  <div
                    className="text-[1.05rem]"
                    style={{
                      letterSpacing: useDyslexic ? '0.4px' : '0px',
                      wordSpacing: `${wordSpace}em`,
                      lineHeight: lineSpace,
                      fontWeight: useDyslexic ? 600 : 500
                    }}
                  >
                    {result.split(/(\s+)/).map((w, i) => (
                      <span key={i} className={i/2 === wordIndex ? 'bg-emerald-400/30 rounded-md px-0.5' : ''}>{w}</span>
                    ))}
                  </div>
                )}
              </div>

              {!!status && (
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
                  <div className="rounded-xl px-4 py-3 bg-white/90 text-black text-sm font-medium shadow">
                    {status}
                  </div>
                </div>
              )}

              <div className="border-t border-white/10 p-4 text-xs opacity-70">
                © {new Date().getFullYear()} Readease • Simplify a Doc
              </div>
            </Card>
          </div>
        </Section>
    </div>
  );
}
