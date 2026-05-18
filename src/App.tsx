import { useState, useEffect, useRef, useCallback } from "react";
import {
  BookOpen, Search, X, ArrowLeft, ArrowRight, ChevronRight,
  Feather, Flame, Wind, Compass, Anchor, Sun, Droplets, Star, Zap,
  Eye, EyeOff, Check, AlertCircle, LogOut, User, Mail, RefreshCw,
} from "lucide-react";
import {
  auth, googleProvider, firebaseError,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signInWithPopup, sendEmailVerification, sendPasswordResetEmail,
  updateProfile, signOut, onAuthStateChanged,
  type User as FirebaseUser,
} from "./firebase";
import PhilosopherQuiz from "./PhilosopherQuiz";
import PhilosophyTimeline from "./PhilosophyTimeline";

// ─── Types ─────────────────────────────────────────────────────────────────────

type SchoolId = "stoic" | "platonic" | "peripatetic" | "cynic" | "socratic" | "presocratic";
type PhilosopherId = "epictetus" | "aurelius" | "seneca" | "socrates" | "plato" | "aristotle" | "diogenes" | "heraclitus" | "pythagoras";
type Page = "auth" | "home" | "quiz" | "timeline" | PhilosopherId;

interface School { label: string; color: string; }
interface Philosopher {
  label: string; subtitle: string; years: string; color: string;
  icon: React.ElementType; school: SchoolId;
  born: string; died: string; bio: string; works: string[];
}
interface Quote { id: number; philosopher: PhilosopherId; text: string; source: string; }
interface AuthUser { name: string; email: string; }

// ─── Data ──────────────────────────────────────────────────────────────────────

const SCHOOLS: Record<SchoolId, School> = {
  stoic:       { label: "Stoic",        color: "#5a7a45" },
  platonic:    { label: "Platonic",     color: "#4a5fa0" },
  peripatetic: { label: "Peripatetic",  color: "#7a4d8a" },
  cynic:       { label: "Cynic",        color: "#8a5c30" },
  socratic:    { label: "Socratic",     color: "#2e7a7a" },
  presocratic: { label: "Pre-Socratic", color: "#8a7040" },
};

const PHILOSOPHERS: Record<PhilosopherId, Philosopher> = {
  epictetus:  { label: "Epictetus",       subtitle: "The Freed Slave",          years: "50–135 AD",    color: "#9c5c1a", icon: Flame,    school: "stoic",       born: "c. 50 AD, Hierapolis, Phrygia",         died: "c. 135 AD, Nicopolis, Greece",          bio: "Born into slavery in the Roman Empire, Epictetus gained his freedom and founded a philosophical school in Nicopolis. He never wrote anything himself — his teachings were recorded by his student Arrian. His philosophy centers on the distinction between what is 'up to us' and what is not.", works: ["Enchiridion", "Discourses", "Fragments"] },
  aurelius:   { label: "Marcus Aurelius", subtitle: "The Philosopher King",      years: "121–180 AD",   color: "#3d7a55", icon: Wind,     school: "stoic",       born: "April 26, 121 AD, Rome",                died: "March 17, 180 AD, Vindobona",           bio: "The last of the Five Good Emperors, Marcus Aurelius ruled the Roman Empire at its height while waging near-constant warfare on its borders. His Meditations were private notes written to himself — never intended for publication.", works: ["Meditations"] },
  seneca:     { label: "Seneca",          subtitle: "The Counselor",             years: "4 BC–65 AD",   color: "#5c4d8a", icon: Feather,  school: "stoic",       born: "c. 4 BC, Corduba, Roman Hispania",      died: "65 AD, Rome (forced suicide by Nero)",  bio: "Lucius Annaeus Seneca was a playwright, statesman, and the most prolific Stoic writer whose works survive. His Letters to Lucilius, written in his final years, are considered among the finest essays in Latin literature.", works: ["Letters to Lucilius", "On the Shortness of Life", "On Benefits", "On Providence", "On Anger", "On the Happy Life"] },
  socrates:   { label: "Socrates",        subtitle: "The Gadfly of Athens",      years: "470–399 BC",   color: "#2e7a7a", icon: Compass,  school: "socratic",    born: "c. 470 BC, Athens",                     died: "399 BC, Athens (executed by hemlock)",  bio: "Socrates wrote nothing. Everything we know of him comes through others — primarily Plato and Xenophon. He spent his life relentlessly questioning citizens about justice, virtue, and the good life.", works: ["Apology (via Plato)", "Memorabilia (via Xenophon)", "Attributed"] },
  plato:      { label: "Plato",           subtitle: "The Idealist",              years: "428–348 BC",   color: "#4a5fa0", icon: Star,     school: "platonic",    born: "c. 428 BC, Athens",                     died: "c. 348 BC, Athens",                     bio: "Born to a noble Athenian family, Plato was transformed by his encounter with Socrates. He founded the Academy in Athens — the world's first institution of higher learning. His Theory of Forms shaped Western philosophy for two millennia.", works: ["Republic", "Symposium", "Phaedo", "Meno", "Timaeus", "Attributed"] },
  aristotle:  { label: "Aristotle",       subtitle: "The Philosopher",           years: "384–322 BC",   color: "#7a4d8a", icon: Sun,      school: "peripatetic", born: "384 BC, Stagira, Macedonia",            died: "322 BC, Chalcis, Euboea",               bio: "Plato's most brilliant student spent 20 years at the Academy before becoming tutor to Alexander the Great. Aristotle founded his own school, the Lyceum, where he systematized virtually every field of human knowledge.", works: ["Nicomachean Ethics", "Politics", "Poetics", "On the Parts of Animals", "Metaphysics", "Attributed"] },
  diogenes:   { label: "Diogenes",        subtitle: "The Dog",                   years: "412–323 BC",   color: "#8a5c30", icon: Anchor,   school: "cynic",       born: "c. 412 BC, Sinope (modern Turkey)",     died: "c. 323 BC, Corinth",                    bio: "Exiled from his home city, Diogenes arrived in Athens and made a virtue of having nothing. He lived in a large ceramic jar in the marketplace and told Alexander the Great to stop blocking his sunlight. He called himself a 'dog' and wore it as a badge of honor.", works: ["Lives of the Eminent Philosophers (Diogenes Laërtius)", "Attributed"] },
  heraclitus: { label: "Heraclitus",      subtitle: "The Obscure",               years: "535–475 BC",   color: "#b05a18", icon: Zap,      school: "presocratic", born: "c. 535 BC, Ephesus (modern Turkey)",    died: "c. 475 BC, Ephesus",                    bio: "A solitary thinker who refused to simplify his ideas, Heraclitus earned the nickname 'the Obscure' in antiquity. His single written work is lost; only fragments survive. He believed the cosmos is defined by perpetual conflict and flux.", works: ["Fragments"] },
  pythagoras: { label: "Pythagoras",      subtitle: "The Mystic Mathematician",  years: "570–495 BC",   color: "#3d7a68", icon: Droplets, school: "presocratic", born: "c. 570 BC, Samos, Greece",              died: "c. 495 BC, Metapontum (modern Italy)",  bio: "Pythagoras founded a secretive religious brotherhood bound by strict rules and mathematical mysticism. He believed numbers were the ultimate reality underlying all existence. Like Socrates, he wrote nothing.", works: ["Golden Verses", "Attributed"] },
};

const QUOTES: Quote[] = [
  { id: 1,  philosopher: "epictetus",  text: "Make the best use of what is in your power, and take the rest as it happens.", source: "Enchiridion" },
  { id: 2,  philosopher: "epictetus",  text: "He is a wise man who does not grieve for the things which he has not, but rejoices for those which he has.", source: "Fragments" },
  { id: 3,  philosopher: "epictetus",  text: "Seek not the good in external things; seek it in yourself.", source: "Discourses" },
  { id: 4,  philosopher: "epictetus",  text: "It's not what happens to you, but how you react to it that matters.", source: "Enchiridion" },
  { id: 5,  philosopher: "epictetus",  text: "Wealth consists not in having great possessions, but in having few wants.", source: "Fragments" },
  { id: 6,  philosopher: "epictetus",  text: "No man is free who is not master of himself.", source: "Discourses" },
  { id: 7,  philosopher: "epictetus",  text: "People are not disturbed by things, but by the views they take of them.", source: "Enchiridion" },
  { id: 8,  philosopher: "epictetus",  text: "Other men's sins are before our eyes; our own are behind our back.", source: "Fragments" },
  { id: 9,  philosopher: "epictetus",  text: "First say to yourself what you would be; and then do what you have to do.", source: "Discourses" },
  { id: 10, philosopher: "epictetus",  text: "If you want to improve, be content to be thought foolish and stupid.", source: "Enchiridion" },
  { id: 11, philosopher: "aurelius",   text: "You have power over your mind, not outside events. Realize this, and you will find strength.", source: "Meditations" },
  { id: 12, philosopher: "aurelius",   text: "The impediment to action advances action. What stands in the way becomes the way.", source: "Meditations" },
  { id: 13, philosopher: "aurelius",   text: "Waste no more time arguing about what a good man should be. Be one.", source: "Meditations" },
  { id: 14, philosopher: "aurelius",   text: "Accept the things to which fate binds you, and love the people with whom fate brings you together.", source: "Meditations" },
  { id: 15, philosopher: "aurelius",   text: "Very little is needed to make a happy life; it is all within yourself.", source: "Meditations" },
  { id: 16, philosopher: "aurelius",   text: "It is not death that a man should fear, but he should fear never beginning to live.", source: "Meditations" },
  { id: 17, philosopher: "aurelius",   text: "Never esteem anything as of advantage to you that will make you break your word or lose your self-respect.", source: "Meditations" },
  { id: 18, philosopher: "aurelius",   text: "The best revenge is to be unlike him who performed the injury.", source: "Meditations" },
  { id: 19, philosopher: "seneca",     text: "We suffer more in imagination than in reality.", source: "Letters to Lucilius" },
  { id: 20, philosopher: "seneca",     text: "Difficulties strengthen the mind, as labor does the body.", source: "Letters to Lucilius" },
  { id: 21, philosopher: "seneca",     text: "If a man knows not to which port he sails, no wind is favorable.", source: "Letters to Lucilius" },
  { id: 22, philosopher: "seneca",     text: "To be everywhere is to be nowhere.", source: "Letters to Lucilius" },
  { id: 23, philosopher: "seneca",     text: "He who is brave is free.", source: "Letters to Lucilius" },
  { id: 24, philosopher: "seneca",     text: "Life is long if you know how to use it.", source: "On the Shortness of Life" },
  { id: 25, philosopher: "seneca",     text: "The whole future lies in uncertainty: live immediately.", source: "On the Shortness of Life" },
  { id: 26, philosopher: "seneca",     text: "A gem cannot be polished without friction, nor a man perfected without trials.", source: "On Providence" },
  { id: 27, philosopher: "seneca",     text: "Luck is what happens when preparation meets opportunity.", source: "On Benefits" },
  { id: 28, philosopher: "socrates",   text: "The unexamined life is not worth living.", source: "Apology (via Plato)" },
  { id: 29, philosopher: "socrates",   text: "I know that I know nothing.", source: "Apology (via Plato)" },
  { id: 30, philosopher: "socrates",   text: "Wonder is the beginning of wisdom.", source: "Apology (via Plato)" },
  { id: 31, philosopher: "socrates",   text: "To find yourself, think for yourself.", source: "Memorabilia (via Xenophon)" },
  { id: 32, philosopher: "socrates",   text: "Be kind, for everyone you meet is fighting a harder battle.", source: "Attributed" },
  { id: 33, philosopher: "socrates",   text: "Education is the kindling of a flame, not the filling of a vessel.", source: "Attributed" },
  { id: 34, philosopher: "socrates",   text: "Strong minds discuss ideas, average minds discuss events, weak minds discuss people.", source: "Attributed" },
  { id: 35, philosopher: "plato",      text: "The beginning is the most important part of the work.", source: "Republic" },
  { id: 36, philosopher: "plato",      text: "Human behavior flows from three main sources: desire, emotion, and knowledge.", source: "Republic" },
  { id: 37, philosopher: "plato",      text: "Necessity is the mother of invention.", source: "Republic" },
  { id: 38, philosopher: "plato",      text: "No one ever teaches well who wants to teach, or governs well who wants to govern.", source: "Republic" },
  { id: 39, philosopher: "plato",      text: "Opinion is the medium between knowledge and ignorance.", source: "Republic" },
  { id: 40, philosopher: "plato",      text: "At the touch of love, everyone becomes a poet.", source: "Symposium" },
  { id: 41, philosopher: "plato",      text: "We can easily forgive a child who is afraid of the dark; the real tragedy is when men are afraid of the light.", source: "Attributed" },
  { id: 42, philosopher: "plato",      text: "Wise men speak because they have something to say; fools because they have to say something.", source: "Attributed" },
  { id: 43, philosopher: "aristotle",  text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", source: "Nicomachean Ethics" },
  { id: 44, philosopher: "aristotle",  text: "It is the mark of an educated mind to be able to entertain a thought without accepting it.", source: "Nicomachean Ethics" },
  { id: 45, philosopher: "aristotle",  text: "Happiness is the meaning and the purpose of life, the whole aim and end of human existence.", source: "Nicomachean Ethics" },
  { id: 46, philosopher: "aristotle",  text: "Quality is not an act, it is a habit.", source: "Nicomachean Ethics" },
  { id: 47, philosopher: "aristotle",  text: "Pleasure in the job puts perfection in the work.", source: "Nicomachean Ethics" },
  { id: 48, philosopher: "aristotle",  text: "In all things of nature there is something of the marvelous.", source: "On the Parts of Animals" },
  { id: 49, philosopher: "aristotle",  text: "Knowing yourself is the beginning of all wisdom.", source: "Attributed" },
  { id: 50, philosopher: "aristotle",  text: "The more you know, the more you know you don't know.", source: "Attributed" },
  { id: 51, philosopher: "diogenes",   text: "I am a citizen of the world.", source: "Lives of the Eminent Philosophers" },
  { id: 52, philosopher: "diogenes",   text: "It takes a wise man to discover a wise man.", source: "Lives of the Eminent Philosophers" },
  { id: 53, philosopher: "diogenes",   text: "Man is the most intelligent of the animals — and the most silly.", source: "Lives of the Eminent Philosophers" },
  { id: 54, philosopher: "diogenes",   text: "Of what use is a philosopher who doesn't hurt anybody's feelings?", source: "Attributed" },
  { id: 55, philosopher: "diogenes",   text: "Blushing is the color of virtue.", source: "Lives of the Eminent Philosophers" },
  { id: 56, philosopher: "diogenes",   text: "The art of being a slave is to rule one's master.", source: "Lives of the Eminent Philosophers" },
  { id: 57, philosopher: "diogenes",   text: "I have nothing to ask but that you stand out of my sunlight.", source: "Attributed" },
  { id: 58, philosopher: "heraclitus", text: "No man ever steps in the same river twice, for it's not the same river and he's not the same man.", source: "Fragments" },
  { id: 59, philosopher: "heraclitus", text: "The only constant in life is change.", source: "Fragments" },
  { id: 60, philosopher: "heraclitus", text: "Character is destiny.", source: "Fragments" },
  { id: 61, philosopher: "heraclitus", text: "Much learning does not teach understanding.", source: "Fragments" },
  { id: 62, philosopher: "heraclitus", text: "The soul is dyed the color of its thoughts.", source: "Fragments" },
  { id: 63, philosopher: "heraclitus", text: "Eyes are more accurate witnesses than ears.", source: "Fragments" },
  { id: 64, philosopher: "heraclitus", text: "Dogs bark at what they don't understand.", source: "Fragments" },
  { id: 65, philosopher: "heraclitus", text: "Even sleepers are workers and collaborators in what goes on in the universe.", source: "Fragments" },
  { id: 66, philosopher: "pythagoras", text: "Above all things, reverence yourself.", source: "Golden Verses" },
  { id: 67, philosopher: "pythagoras", text: "Rest satisfied with doing well, and leave others to talk of you as they will.", source: "Golden Verses" },
  { id: 68, philosopher: "pythagoras", text: "Choose rather to be strong of soul than strong of body.", source: "Golden Verses" },
  { id: 69, philosopher: "pythagoras", text: "Do not say a little in many words but a great deal in a few.", source: "Attributed" },
  { id: 70, philosopher: "pythagoras", text: "Silence is better than unmeaning words.", source: "Attributed" },
  { id: 71, philosopher: "pythagoras", text: "The oldest, shortest words — yes and no — are those which require the most thought.", source: "Attributed" },
  { id: 72, philosopher: "pythagoras", text: "A thought is an idea in transit.", source: "Attributed" },
];

const PANEL_QUOTES = QUOTES.filter(q => [1, 11, 19, 28, 35, 43, 51, 58, 66].includes(q.id));

// ─── Hooks ─────────────────────────────────────────────────────────────────────

function useIntersection(ref: React.RefObject<HTMLElement | null>, threshold = 0.08) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return visible;
}

// ─── Auth: Rotating Panel Quote ───────────────────────────────────────────────

function PanelQuote() {
  const [idx, setIdx]     = useState(0);
  const [visible, setVis] = useState(true);
  useEffect(() => {
    const iv = setInterval(() => {
      setVis(false);
      setTimeout(() => { setIdx(i => (i + 1) % PANEL_QUOTES.length); setVis(true); }, 500);
    }, 6000);
    return () => clearInterval(iv);
  }, []);
  const q = PANEL_QUOTES[idx];
  const Icon = PHILOSOPHERS[q.philosopher].icon;
  return (
    <div className={`transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
      <div className="text-6xl leading-none text-white/10 font-serif mb-2 select-none">"</div>
      <p className="font-serif text-lg leading-relaxed text-white/90 italic mb-6">{q.text}</p>
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
          <Icon size={13} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
        </div>
        <div>
          <div className="font-serif text-sm text-white/88 font-medium">{PHILOSOPHERS[q.philosopher].label}</div>
          <div className="text-xs text-white/40 tracking-wide">{q.source}</div>
        </div>
      </div>
      <div className="flex gap-1 mt-7">
        {PANEL_QUOTES.map((_, i) => (
          <div key={i} className="h-[3px] rounded-full transition-all duration-400"
            style={{ background: i === idx ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.18)", width: i === idx ? "18px" : "6px" }} />
        ))}
      </div>
    </div>
  );
}

// ─── Auth: Left Decorative Panel ──────────────────────────────────────────────

function AuthLeftPanel() {
  return (
    <div className="relative flex flex-col justify-between p-10 h-full overflow-hidden"
      style={{ background: "linear-gradient(150deg,#2c1f0e 0%,#3d2a12 45%,#2a1d0c 100%)" }}>
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle,rgba(201,169,110,0.13) 0%,transparent 70%)" }} />
      <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle,rgba(201,169,110,0.08) 0%,transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(201,169,110,0.18)", border: "1px solid rgba(201,169,110,0.28)" }}>
          <BookOpen size={15} color="#c9a96e" strokeWidth={1.5} />
        </div>
        <div>
          <div className="font-serif text-sm font-medium" style={{ color: "#c9a96e" }}>The Philosopher's</div>
          <div className="text-xs tracking-widest uppercase" style={{ color: "rgba(201,169,110,0.5)" }}>Library</div>
        </div>
      </div>
      {/* Quote */}
      <div className="relative z-10"><PanelQuote /></div>
      {/* Footer */}
      <div className="relative z-10">
        <div className="h-px mb-4" style={{ background: "rgba(255,255,255,0.07)" }} />
        <p className="text-xs tracking-wide leading-relaxed" style={{ color: "rgba(255,255,255,0.25)" }}>
          9 philosophers · 72 aphorisms · Ancient wisdom for modern minds
        </p>
      </div>
    </div>
  );
}

// ─── Auth: Field ──────────────────────────────────────────────────────────────

interface FieldProps {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  error?: string; icon?: React.ReactNode; right?: React.ReactNode;
}

function Field({ label, type = "text", value, onChange, placeholder, error, icon, right }: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold tracking-widest uppercase transition-colors"
        style={{ color: focused ? "#5a3e10" : "#8a7860" }}>{label}</label>
      <div className="relative flex items-center">
        {icon && <div className="absolute left-3 pointer-events-none flex transition-colors"
          style={{ color: focused ? "#9c5c1a" : "#c0a880" }}>{icon}</div>}
        <input
          type={type} value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full rounded-lg text-sm transition-all"
          style={{
            padding: icon ? "0.7rem 2.5rem 0.7rem 2.35rem" : "0.7rem 2.5rem 0.7rem 0.85rem",
            fontFamily: "inherit", color: "#2c2418",
            background: focused ? "#fff" : "#faf7f2",
            border: error ? "1.5px solid #c0392b" : focused ? "1.5px solid #9c5c1a" : "1.5px solid #e0d8cc",
            outline: "none",
            boxShadow: focused ? "0 0 0 3px rgba(156,92,26,0.1)" : "none",
          }}
        />
        {right && <div className="absolute right-3">{right}</div>}
      </div>
      {error && (
        <div className="flex items-center gap-1">
          <AlertCircle size={11} color="#c0392b" />
          <span className="text-xs" style={{ color: "#c0392b" }}>{error}</span>
        </div>
      )}
    </div>
  );
}

// ─── Auth: Password Strength ──────────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    { label: "8+ chars", ok: password.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
  ];
  const score  = checks.filter(c => c.ok).length;
  const colors = ["#c0392b", "#e67e22", "#3d7a55"];
  const labels = ["Weak", "Fair", "Strong"];
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex-1 h-[3px] rounded-full transition-colors duration-300"
            style={{ background: i < score ? colors[score - 1] : "#e8e2d8" }} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {checks.map(c => (
            <div key={c.label} className="flex items-center gap-1">
              <Check size={9} color={c.ok ? "#3d7a55" : "#c0b49a"} strokeWidth={2.5} />
              <span className="text-xs" style={{ color: c.ok ? "#3d7a55" : "#b0a090" }}>{c.label}</span>
            </div>
          ))}
        </div>
        {score > 0 && <span className="text-xs font-semibold" style={{ color: colors[score - 1] }}>{labels[score - 1]}</span>}
      </div>
    </div>
  );
}

// ─── Auth: Shared icon SVGs ───────────────────────────────────────────────────

const EmailIconSvg  = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const LockIconSvg   = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const UserIconSvg   = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>;
const ShieldIconSvg = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

// ─── Auth: Shared sub-components ──────────────────────────────────────────────

function GoogleButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-medium border transition-colors disabled:opacity-60"
      style={{ background: "#faf7f2", borderColor: "#e0d8cc", color: "#4a3e2c", cursor: loading ? "not-allowed" : "pointer" }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#f5f0e8"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "#faf7f2"; }}>
      <svg width="15" height="15" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {loading ? "Signing in…" : "Continue with Google"}
    </button>
  );
}

function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px" style={{ background: "#e8e2d8" }} />
      <span className="text-xs tracking-widest" style={{ color: "#c0b09a" }}>OR</span>
      <div className="flex-1 h-px" style={{ background: "#e8e2d8" }} />
    </div>
  );
}

function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 mb-4 text-xs" style={{ background: "#fdf0f0", border: "1px solid #f5c6c6", color: "#c0392b" }}>
      <AlertCircle size={13} style={{ flexShrink: 0 }} /> {message}
    </div>
  );
}

function FormSuccess({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 mb-4 text-xs" style={{ background: "#f0fdf4", border: "1px solid #86efac", color: "#3d7a55" }}>
      <Check size={13} style={{ flexShrink: 0 }} /> {message}
    </div>
  );
}

function PrimaryButton({ onClick, loading, children }: { onClick: () => void; loading: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="flex items-center justify-center gap-2 w-full py-3 rounded-lg text-white text-sm font-semibold tracking-wide mt-5 transition-all disabled:opacity-70"
      style={{ background: "linear-gradient(135deg,#9c5c1a,#7a4010)", boxShadow: "0 2px 12px rgba(156,92,26,0.28)", cursor: loading ? "not-allowed" : "pointer" }}>
      {loading
        ? <><RefreshCw size={14} className="animate-spin" /> Please wait…</>
        : children
      }
    </button>
  );
}

// ─── Auth: Sign In Form ───────────────────────────────────────────────────────

function SignInForm({ onSuccess }: { onSuccess: (user: AuthUser) => void }) {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [gLoading, setGLoading]   = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [resetSent, setResetSent] = useState("");

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim())           e.email    = "Email is required.";
    else if (!email.includes("@")) e.email  = "Enter a valid email.";
    if (!password)               e.password = "Password is required.";
    return e;
  };

  const handleSignIn = async () => {
    const e = validate();
    if (Object.keys(e).length) { setFieldErrors(e); return; }
    setFieldErrors({}); setFormError(""); setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (!cred.user.emailVerified) {
        await signOut(auth);
        setFormError("Your email is not verified. Please check your inbox and click the verification link.");
        return;
      }
      onSuccess({ name: cred.user.displayName ?? email.split("@")[0], email: cred.user.email! });
    } catch (err: any) {
      setFormError(firebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setFormError(""); setGLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      onSuccess({ name: cred.user.displayName ?? "Friend", email: cred.user.email! });
    } catch (err: any) {
      setFormError(firebaseError(err.code));
    } finally {
      setGLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!email.includes("@")) { setFieldErrors({ email: "Enter your email above first." }); return; }
    setFieldErrors({}); setFormError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent("Password reset email sent — check your inbox.");
    } catch (err: any) {
      setFormError(firebaseError(err.code));
    }
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-serif text-2xl sm:text-3xl font-medium mb-1 leading-tight" style={{ color: "#1a1206" }}>Welcome back</h2>
        <p className="text-sm" style={{ color: "#8a7860" }}>Sign in to continue your philosophical journey.</p>
      </div>

      <GoogleButton onClick={handleGoogle} loading={gLoading} />
      <OrDivider />
      <FormError message={formError} />
      <FormSuccess message={resetSent} />

      <div className="flex flex-col gap-3">
        <Field label="Email" type="email" value={email}
          onChange={v => { setEmail(v); setFieldErrors(p => ({ ...p, email: "" })); setFormError(""); }}
          placeholder="you@example.com" error={fieldErrors.email} icon={EmailIconSvg} />
        <Field label="Password" type={showPass ? "text" : "password"} value={password}
          onChange={v => { setPassword(v); setFieldErrors(p => ({ ...p, password: "" })); setFormError(""); }}
          placeholder="Your password" error={fieldErrors.password} icon={LockIconSvg}
          right={
            <button onClick={() => setShowPass(s => !s)} className="flex p-0.5" style={{ background: "none", border: "none", cursor: "pointer", color: "#b0a090" }}>
              {showPass ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
            </button>
          }
        />
      </div>

      <div className="text-right mt-1.5">
        <button onClick={handleForgot} className="text-xs font-medium" style={{ background: "none", border: "none", cursor: "pointer", color: "#9c5c1a" }}>
          Forgot password?
        </button>
      </div>

      <PrimaryButton onClick={handleSignIn} loading={loading}>
        Sign In <ArrowRight size={14} strokeWidth={2} />
      </PrimaryButton>
    </div>
  );
}

// ─── Auth: Sign Up Form ───────────────────────────────────────────────────────

function SignUpForm({ onVerificationSent }: { onVerificationSent: (email: string) => void }) {
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [agreed, setAgreed]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [gLoading, setGLoading]   = useState(false);
  const [formError, setFormError] = useState("");
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name     = "Enter your full name.";
    if (!email.includes("@"))   e.email    = "Enter a valid email address.";
    if (password.length < 6)    e.password = "Password must be at least 6 characters.";
    if (password !== confirm)   e.confirm  = "Passwords do not match.";
    if (!agreed)                e.agreed   = "You must agree to continue.";
    return e;
  };

  const handleSignUp = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setFormError(""); setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name.trim() });
      await sendEmailVerification(cred.user);
      await signOut(auth); // sign out until they verify
      onVerificationSent(email);
    } catch (err: any) {
      setFormError(firebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setFormError(""); setGLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      // Google accounts are pre-verified — handled by App root
      onVerificationSent(cred.user.email!);
    } catch (err: any) {
      setFormError(firebaseError(err.code));
    } finally {
      setGLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-serif text-2xl sm:text-3xl font-medium mb-1 leading-tight" style={{ color: "#1a1206" }}>Begin your journey</h2>
        <p className="text-sm" style={{ color: "#8a7860" }}>Join thousands exploring ancient wisdom.</p>
      </div>

      <GoogleButton onClick={handleGoogle} loading={gLoading} />
      <OrDivider />
      <FormError message={formError} />

      <div className="flex flex-col gap-3">
        <Field label="Full Name" value={name} onChange={v => { setName(v); setErrors(p => ({ ...p, name: "" })); }} placeholder="Marcus Aurelius" error={errors.name} icon={UserIconSvg} />
        <Field label="Email" type="email" value={email} onChange={v => { setEmail(v); setErrors(p => ({ ...p, email: "" })); setFormError(""); }} placeholder="you@example.com" error={errors.email} icon={EmailIconSvg} />
        <div className="flex flex-col gap-1">
          <Field label="Password" type={showPass ? "text" : "password"} value={password}
            onChange={v => { setPassword(v); setErrors(p => ({ ...p, password: "" })); }}
            placeholder="Create a strong password" error={errors.password} icon={LockIconSvg}
            right={<button onClick={() => setShowPass(s => !s)} className="flex p-0.5" style={{ background: "none", border: "none", cursor: "pointer", color: "#b0a090" }}>
              {showPass ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
            </button>}
          />
          <PasswordStrength password={password} />
        </div>
        <Field label="Confirm Password" type={showConf ? "text" : "password"} value={confirm}
          onChange={v => { setConfirm(v); setErrors(p => ({ ...p, confirm: "" })); }}
          placeholder="Repeat your password" error={errors.confirm} icon={ShieldIconSvg}
          right={<button onClick={() => setShowConf(s => !s)} className="flex p-0.5" style={{ background: "none", border: "none", cursor: "pointer", color: "#b0a090" }}>
            {showConf ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
          </button>}
        />
      </div>

      {/* Terms */}
      <div className="flex items-start gap-2 mt-4">
        <button onClick={() => { setAgreed(a => !a); setErrors(p => ({ ...p, agreed: "" })); }}
          className="w-[17px] h-[17px] rounded flex items-center justify-center shrink-0 mt-0.5 transition-all"
          style={{ border: errors.agreed ? "1.5px solid #c0392b" : agreed ? "1.5px solid #9c5c1a" : "1.5px solid #d0c8bc", background: agreed ? "#9c5c1a" : "#faf7f2" }}>
          {agreed && <Check size={10} color="#fff" strokeWidth={3} />}
        </button>
        <div>
          <span className="text-xs leading-relaxed" style={{ color: "#6a5e50" }}>
            I agree to the{" "}
            <button className="text-xs font-semibold" style={{ background: "none", border: "none", cursor: "pointer", color: "#9c5c1a", padding: 0 }}>Terms of Service</button>
            {" "}and{" "}
            <button className="text-xs font-semibold" style={{ background: "none", border: "none", cursor: "pointer", color: "#9c5c1a", padding: 0 }}>Privacy Policy</button>
          </span>
          {errors.agreed && (
            <div className="flex items-center gap-1 mt-0.5">
              <AlertCircle size={10} color="#c0392b" />
              <span className="text-xs" style={{ color: "#c0392b" }}>{errors.agreed}</span>
            </div>
          )}
        </div>
      </div>

      <PrimaryButton onClick={handleSignUp} loading={loading}>
        Create Account <ArrowRight size={14} strokeWidth={2} />
      </PrimaryButton>
    </div>
  );
}

// ─── Auth: Verify Email Screen ────────────────────────────────────────────────

function VerifyEmailScreen({ email, onBack }: { email: string; onBack: () => void }) {
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    const u = auth.currentUser;
    if (u) {
      await sendEmailVerification(u);
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    }
  };

  return (
    <div className="text-center py-4">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ background: "#9c5c1a18", border: "2px solid #9c5c1a44" }}>
        <Mail size={24} color="#9c5c1a" strokeWidth={1.5} />
      </div>
      <h2 className="font-serif text-2xl font-medium mb-2" style={{ color: "#1a1206" }}>Check your inbox</h2>
      <p className="text-sm mb-1" style={{ color: "#8a7860" }}>A verification link was sent to:</p>
      <p className="text-sm font-semibold mb-4" style={{ color: "#4a3e2c" }}>{email}</p>
      <p className="text-xs leading-relaxed mb-6" style={{ color: "#a8977e" }}>
        Click the link in the email to verify your account, then come back and sign in.
      </p>
      {resent
        ? <p className="text-xs mb-4" style={{ color: "#3d7a55" }}>✓ Verification email resent!</p>
        : <button onClick={handleResend} className="text-xs font-medium mb-4 block mx-auto"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9c5c1a" }}>
            Didn't get it? Resend email
          </button>
      }
      <button onClick={onBack} className="text-xs" style={{ background: "none", border: "none", cursor: "pointer", color: "#b8a890" }}>
        ← Back to sign in
      </button>
    </div>
  );
}

// ─── Auth Page (tabbed Sign In / Sign Up) ─────────────────────────────────────

function AuthPage({ onSuccess }: { onSuccess: (user: AuthUser) => void }) {
  const [tab, setTab]               = useState<"signin" | "signup">("signin");
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Left panel — hidden on mobile */}
      <div className="hidden md:block w-[42%] shrink-0 min-h-screen">
        <AuthLeftPanel />
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:p-8 overflow-y-auto min-h-screen" style={{ background: "#f6f2eb" }}>
        <div className="w-full max-w-sm">

          {/* Tab switcher */}
          {!verifyEmail && (
            <div className="flex rounded-lg p-1 mb-4 gap-1" style={{ background: "#ede8e0" }}>
              {(["signin", "signup"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="flex-1 py-2 rounded-md text-xs font-semibold transition-all"
                  style={{
                    background: tab === t ? "#fff" : "transparent",
                    color: tab === t ? "#2c2418" : "#8a7860",
                    boxShadow: tab === t ? "0 1px 4px rgba(60,40,10,0.1)" : "none",
                    border: "none", cursor: "pointer",
                  }}>
                  {t === "signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>
          )}

          <div className="rounded-xl p-5 sm:p-7 border" style={{ background: "#fff", borderColor: "#e8e2d8", boxShadow: "0 4px 24px rgba(60,40,10,0.07)" }}>
            {verifyEmail
              ? <VerifyEmailScreen email={verifyEmail} onBack={() => { setVerifyEmail(null); setTab("signin"); }} />
              : tab === "signin"
                ? <SignInForm onSuccess={onSuccess} />
                : <SignUpForm onVerificationSent={em => setVerifyEmail(em)} />
            }
          </div>

          <p className="text-center mt-5 text-xs tracking-wide" style={{ color: "#b8a890" }}>
            The Philosopher's Library · Ancient Wisdom for Modern Minds
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Library: School Badge ────────────────────────────────────────────────────

function SchoolBadge({ schoolId }: { schoolId: SchoolId }) {
  const s = SCHOOLS[schoolId];
  return (
    <span className="text-xs font-semibold tracking-widest uppercase rounded px-1.5 py-0.5 whitespace-nowrap"
      style={{ color: s.color, background: `${s.color}18`, border: `1px solid ${s.color}40` }}>
      {s.label}
    </span>
  );
}

// ─── Library: Quote Preview (auto-rotating) ───────────────────────────────────

const INTERVAL_MS = 10000;

function QuotePreview({ philId, color }: { philId: PhilosopherId; color: string }) {
  const philQuotes = QUOTES.filter(q => q.philosopher === philId);
  const [activeIdx, setActiveIdx] = useState(() => Math.floor(Math.random() * philQuotes.length));
  const [fading, setFading]       = useState(false);

  useEffect(() => {
    const iv = setInterval(() => {
      setFading(true);
      setTimeout(() => { setActiveIdx(i => (i + 1) % philQuotes.length); setFading(false); }, 400);
    }, INTERVAL_MS);
    return () => clearInterval(iv);
  }, [philQuotes.length]);

  const quote = philQuotes[activeIdx];

  return (
    <div className="relative" style={{ minHeight: "90px" }}>
      {/* Progress bar */}
      <div className="absolute -bottom-3 left-0 right-0 h-[2px] rounded-full overflow-hidden" style={{ background: "#f0ebe3" }}>
        <div key={activeIdx} className="h-full rounded-full"
          style={{ background: `linear-gradient(to right,${color}88,${color})`, animation: `progress-fill ${INTERVAL_MS}ms linear forwards` }} />
      </div>
      {/* Dots */}
      <div className="flex gap-1 mb-2">
        {philQuotes.map((_, i) => (
          <div key={i} className="h-[5px] rounded-full transition-all duration-300 shrink-0"
            style={{ width: i === activeIdx ? "14px" : "5px", background: i === activeIdx ? color : "#e0d8cc" }} />
        ))}
      </div>
      {/* Quote text */}
      <div className="transition-all duration-300" style={{ opacity: fading ? 0 : 1, transform: fading ? "translateY(4px)" : "translateY(0)" }}>
        <p className="font-serif text-sm leading-relaxed italic overflow-hidden" style={{ color: "#4a3e2c", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
          <span className="not-italic text-xl leading-none align-[-0.2em] mr-0.5" style={{ color, opacity: 0.4 }}>"</span>
          {quote.text}
          <span className="not-italic text-xl leading-none align-[-0.2em] ml-0.5" style={{ color, opacity: 0.4 }}>"</span>
        </p>
        <p className="text-xs italic mt-1.5 tracking-wide" style={{ color: "#b8a890" }}>— {quote.source}</p>
      </div>
    </div>
  );
}

// ─── Library: Philosopher Card ────────────────────────────────────────────────

function PhilosopherCard({ id, onNavigate, index }: { id: PhilosopherId; onNavigate: (id: PhilosopherId) => void; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useIntersection(ref);
  const p    = PHILOSOPHERS[id];
  const Icon = p.icon;
  const count = QUOTES.filter(q => q.philosopher === id).length;

  return (
    <div ref={ref} onClick={() => onNavigate(id)}
      className="relative flex flex-col gap-3 rounded-lg p-4 sm:p-5 cursor-pointer overflow-hidden border transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.5s ease ${Math.min(index * 0.06, 0.4)}s, transform 0.5s ease ${Math.min(index * 0.06, 0.4)}s, box-shadow 0.2s, border-color 0.2s`,
        background: "#fff", borderColor: "#e8e2d8", boxShadow: "0 1px 4px rgba(60,40,10,0.05)",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = p.color + "80"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(60,40,10,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e2d8"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(60,40,10,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div className="absolute top-0 left-0 right-0 h-[3px] opacity-75" style={{ background: p.color }} />
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ border: `1.5px solid ${p.color}55`, background: `${p.color}12` }}>
          <Icon size={16} color={p.color} strokeWidth={1.5} />
        </div>
        <SchoolBadge schoolId={p.school} />
      </div>
      <div>
        <div className="font-serif text-xl mb-0.5" style={{ color: "#1a1206" }}>{p.label}</div>
        <div className="text-xs tracking-widest uppercase" style={{ color: "#a8977e" }}>{p.subtitle}</div>
      </div>
      <div className="border-t pt-3 pb-2" style={{ borderColor: "#f5f0e8" }}>
        <QuotePreview philId={id} color={p.color} />
      </div>
      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "#f0ebe3" }}>
        <span className="text-xs tracking-wide" style={{ color: "#b8a890" }}>{p.years} · {count} quotes</span>
        <div className="flex items-center gap-1 text-xs tracking-widest uppercase font-semibold" style={{ color: p.color }}>
          View works <ChevronRight size={12} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

// ─── Library: Home Page ───────────────────────────────────────────────────────

function HomePage({ onNavigate, user, onSignOut, onNavigateQuiz, onNavigateTimeline }: { onNavigate: (id: PhilosopherId) => void; user: AuthUser; onSignOut: () => void; onNavigateQuiz: () => void; onNavigateTimeline: () => void }) {
  const [heroVisible, setHeroVisible] = useState(false);
  const [search, setSearch]           = useState("");
  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 80); return () => clearTimeout(t); }, []);

  const ids = Object.keys(PHILOSOPHERS) as PhilosopherId[];
  const filtered = search
    ? ids.filter(id => PHILOSOPHERS[id].label.toLowerCase().includes(search.toLowerCase()) || PHILOSOPHERS[id].subtitle.toLowerCase().includes(search.toLowerCase()))
    : ids;

  return (
    <div>
      {/* Hero */}
      <section className="text-center py-12 sm:py-20 px-5 sm:px-8" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <p className="text-xs tracking-widest uppercase mb-4 transition-all duration-700"
          style={{ color: "#8b6914", opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(10px)" }}>
          Greek & Roman · Ancient Philosophy
        </p>
        <h1 className="font-serif font-normal leading-tight tracking-tight transition-all duration-800"
          style={{ fontSize: "clamp(2.8rem,7vw,4.8rem)", color: "#1a1206", opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(16px)", transitionDelay: "0.1s" }}>
          The Philosopher's<br /><em style={{ color: "#8b6914" }}>Library</em>
        </h1>
        <p className="font-serif italic leading-relaxed mt-6 transition-all duration-800"
          style={{ fontSize: "1.05rem", color: "#7a6e5a", maxWidth: "540px", margin: "1.5rem auto 0", opacity: heroVisible ? 1 : 0, transitionDelay: "0.25s" }}>
          From the symposia of Athens to the courts of Rome — words that have outlived empires.
        </p>
        <div className="flex items-center gap-4 mt-10 transition-all duration-800" style={{ maxWidth: "280px", margin: "2.5rem auto 0", opacity: heroVisible ? 1 : 0, transitionDelay: "0.38s" }}>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to right,transparent,#c9a96e77)" }} />
          <span className="text-xs tracking-widest" style={{ color: "#c9a96e" }}>Γνῶθι σεαυτόν</span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to left,transparent,#c9a96e77)" }} />
        </div>
        <p className="text-xs tracking-widest mt-1.5" style={{ color: "#c4ab85", opacity: heroVisible ? 1 : 0, transition: "opacity 0.8s 0.45s" }}>Know Thyself</p>
      </section>

      {/* Search */}
      <div className="max-w-md mx-auto mb-8 px-4 sm:px-6">
        <div className="relative flex items-center">
          <Search size={14} color="#b8a890" className="absolute left-4 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search philosophers, schools…"
            className="w-full rounded-full text-sm"
            style={{ padding: "0.55rem 2.4rem 0.55rem 2.5rem", background: "#fff", border: "1.5px solid #ddd6c6", color: "#2c2418", outline: "none", boxShadow: "0 1px 4px rgba(60,40,10,0.06)", fontFamily: "inherit" }} />
          {search && <button onClick={() => setSearch("")} className="absolute right-4 flex" style={{ background: "none", border: "none", cursor: "pointer" }}><X size={13} color="#b8a890" /></button>}
        </div>
      </div>

      {/* Quiz banner */}
      <div
        onClick={onNavigateQuiz}
        style={{ maxWidth: "1200px", margin: "0 auto 2rem", padding: "0 1rem sm:0 1.5rem" }}
      >
        <div
          className="mx-4 sm:mx-6 rounded-lg px-6 py-5 flex items-center justify-between gap-4 cursor-pointer border transition-all duration-200"
          style={{ background: "linear-gradient(135deg,rgba(44,36,24,0.95),rgba(29,22,14,0.98))", borderColor: "rgba(201,168,76,0.2)", position: "relative", overflow: "hidden" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)"; e.currentTarget.style.transform = "none"; }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right,transparent,rgba(201,168,76,0.4),transparent)" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 100% at 0% 50%,rgba(201,168,76,0.06),transparent)", pointerEvents: "none" }} />
          <div className="flex items-center gap-4">
            <div style={{ width: "42px", height: "42px", borderRadius: "50%", border: "1px solid rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Star size={18} color="#c9a84c" strokeWidth={1.5} />
            </div>
            <div>
              <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: "1.05rem", color: "#f4ede0", fontWeight: 400, marginBottom: "0.2rem" }}>
                Which Ancient Philosopher Are You?
              </p>
              <p style={{ fontSize: "0.78rem", color: "rgba(201,168,76,0.6)", letterSpacing: "0.06em" }}>
                Take the quiz · 12 questions · Discover your philosophical alignment
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#c9a84c", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
            <span className="hidden sm:inline">Begin</span> <ArrowRight size={15} strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* Timeline banner */}
      <div style={{ maxWidth: "1200px", margin: "0 auto 1.25rem", padding: "0 1rem" }}>
        <div
          onClick={onNavigateTimeline}
          className="mx-4 sm:mx-6 rounded-lg px-6 py-4 flex items-center justify-between gap-4 cursor-pointer border transition-all duration-200"
          style={{ background: "#ffffff", borderColor: "#e8e2d8", boxShadow: "0 1px 4px rgba(60,40,10,0.05)" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#b8922a66"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(60,40,10,0.09)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e2d8"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(60,40,10,0.05)"; e.currentTarget.style.transform = "none"; }}
        >
          <div className="flex items-center gap-4">
            <div style={{ width: "38px", height: "38px", borderRadius: "50%", border: "1.5px solid rgba(184,146,42,0.35)", background: "rgba(184,146,42,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Star size={16} color="#b8922a" strokeWidth={1.5} />
            </div>
            <div>
              <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: "1rem", color: "#2c2418", fontWeight: 500, marginBottom: "0.15rem" }}>
                Philosophy Timeline
              </p>
              <p style={{ fontSize: "0.74rem", color: "#8a7860", letterSpacing: "0.04em" }}>
                624 BC – 529 AD · 35 entries · From Thales to the fall of Rome
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#b8922a", fontSize: "0.74rem", letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0, fontWeight: 500 }}>
            <span className="hidden sm:inline">Explore</span> <ChevronRight size={15} strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* Philosopher grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="text-xs tracking-widest uppercase mb-5" style={{ color: "#b8a890" }}>
          {filtered.length} philosopher{filtered.length !== 1 ? "s" : ""} · {QUOTES.length} aphorisms
        </div>
        {filtered.length === 0
          ? <div className="text-center py-20"><p className="font-serif text-2xl italic" style={{ color: "#b8a890" }}>No philosopher found.</p></div>
          : <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(min(280px,100%),1fr))" }}>
              {filtered.map((id, i) => <PhilosopherCard key={id} id={id} onNavigate={onNavigate} index={i} />)}
            </div>
        }
      </main>
    </div>
  );
}

// ─── Library: Philosopher Detail ──────────────────────────────────────────────

function QuoteItem({ quote, index }: { quote: Quote; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useIntersection(ref);
  return (
    <div ref={ref} className="relative rounded p-4 sm:p-5 border transition-all"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-12px)", transition: `opacity 0.45s ease ${Math.min(index * 0.04, 0.3)}s, transform 0.45s ease ${Math.min(index * 0.04, 0.3)}s`, background: "#fff", borderColor: "#eee8de" }}>
      <div className="font-serif text-5xl leading-none absolute top-1 left-3 pointer-events-none select-none" style={{ color: "#d4c4a8", opacity: 0.6 }}>"</div>
      <p className="font-serif italic leading-relaxed pl-4" style={{ fontSize: "clamp(1rem,1.8vw,1.1rem)", color: "#2c2418" }}>{quote.text}</p>
    </div>
  );
}

function PhilosopherPage({ id, onBack }: { id: PhilosopherId; onBack: () => void }) {
  const p     = PHILOSOPHERS[id];
  const Icon  = p.icon;
  const school = SCHOOLS[p.school];
  const philQuotes = QUOTES.filter(q => q.philosopher === id);
  const workMap: Record<string, Quote[]> = {};
  philQuotes.forEach(q => { if (!workMap[q.source]) workMap[q.source] = []; workMap[q.source].push(q); });
  const [pageVisible, setPageVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setPageVisible(true), 60); return () => clearTimeout(t); }, []);

  return (
    <div className="transition-all duration-400" style={{ opacity: pageVisible ? 1 : 0, transform: pageVisible ? "translateY(0)" : "translateY(12px)" }}>
      {/* Hero */}
      <div className="border-b px-4 sm:px-6 py-8 sm:py-10" style={{ background: `linear-gradient(135deg,${p.color}14 0%,${p.color}06 60%,#f6f2eb 100%)`, borderColor: "#dfd7c9" }}>
        <div className="max-w-5xl mx-auto px-0">
          <button onClick={onBack} className="flex items-center gap-1.5 mb-8 text-xs font-semibold tracking-widest uppercase transition-colors"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#8a7860" }}
            onMouseEnter={e => (e.currentTarget.style.color = p.color)} onMouseLeave={e => (e.currentTarget.style.color = "#8a7860")}>
            <ArrowLeft size={14} strokeWidth={1.8} /> All Philosophers
          </button>
          <div className="flex items-start gap-6 flex-wrap">
            <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
              style={{ border: `2px solid ${p.color}55`, background: `${p.color}14` }}>
              <Icon size={26} color={p.color} strokeWidth={1.3} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="font-serif font-normal leading-none" style={{ fontSize: "clamp(1.6rem,5vw,3rem)", color: "#1a1206" }}>{p.label}</h1>
                <SchoolBadge schoolId={p.school} />
              </div>
              <p className="text-xs tracking-widest uppercase font-semibold mb-1" style={{ color: p.color }}>{p.subtitle}</p>
              <p className="text-xs tracking-wide" style={{ color: "#b8a890" }}>{p.years}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24 grid gap-8 phil-grid" style={{ gridTemplateColumns: "1fr" }}>
      <style>{`@media(min-width:768px){.phil-grid{grid-template-columns:1fr 300px!important}}`}</style>
        {/* Left */}
        <div>
          <h2 className="font-serif text-sm tracking-widest uppercase font-normal mb-7 flex items-center gap-2" style={{ color: "#8a7860" }}>
            <BookOpen size={14} color="#c4ab85" strokeWidth={1.5} /> Works & Aphorisms
          </h2>
          {Object.entries(workMap).map(([work, quotes], i) => {
            const ref = useRef<HTMLDivElement>(null);
            const visible = useIntersection(ref);
            return (
              <div key={work} ref={ref} className="mb-11 transition-all"
                style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)", transition: `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-[3px] h-5 rounded-full shrink-0" style={{ background: p.color, opacity: 0.7 }} />
                  <h3 className="font-serif text-xl font-normal italic" style={{ color: "#1a1206" }}>{work}</h3>
                  <span className="text-xs tracking-widest rounded px-2 py-0.5" style={{ color: "#b8a890", background: "#f0ebe3" }}>{quotes.length} quote{quotes.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex flex-col gap-3">
                  {quotes.map((q, qi) => <QuoteItem key={q.id} quote={q} index={qi} />)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4 md:sticky md:top-20 self-start">
          <div className="rounded-lg p-5 border" style={{ background: "#fff", borderColor: "#e8e2d8", boxShadow: "0 1px 4px rgba(60,40,10,0.05)" }}>
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#b8a890" }}>Biography</p>
            <p className="font-serif text-sm leading-relaxed italic" style={{ color: "#4a3e2c" }}>{p.bio}</p>
          </div>
          <div className="rounded-lg p-5 border" style={{ background: "#fff", borderColor: "#e8e2d8", boxShadow: "0 1px 4px rgba(60,40,10,0.05)" }}>
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#b8a890" }}>Vital Facts</p>
            {[
              { label: "Born", value: p.born },
              { label: "Died", value: p.died },
              { label: "School", value: school.label },
              { label: "Sources", value: `${Object.keys(workMap).length}` },
              { label: "Quotes", value: `${philQuotes.length}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-4 py-2 border-b" style={{ borderColor: "#f0ebe3" }}>
                <span className="text-xs tracking-wide uppercase shrink-0" style={{ color: "#b8a890" }}>{label}</span>
                <span className="font-serif text-sm text-right" style={{ color: "#3a3020" }}>{value}</span>
              </div>
            ))}
          </div>
          <div className="rounded-lg p-5 border" style={{ background: "#fff", borderColor: "#e8e2d8", boxShadow: "0 1px 4px rgba(60,40,10,0.05)" }}>
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#b8a890" }}>Works</p>
            {p.works.map(w => (
              <div key={w} className="flex items-center gap-2 py-1.5 border-b" style={{ borderColor: "#f5f0e8" }}>
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.color, opacity: 0.6 }} />
                <span className="font-serif text-sm" style={{ color: workMap[w] ? "#2c2418" : "#c0b49a", fontStyle: workMap[w] ? "italic" : "normal" }}>
                  {w} {workMap[w] && <span className="text-xs ml-1" style={{ color: p.color }}>({workMap[w].length})</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser]         = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [page, setPage]         = useState<Page>("auth");

  // Persist session across refreshes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        setUser({ name: firebaseUser.displayName ?? firebaseUser.email!.split("@")[0], email: firebaseUser.email! });
        setPage(p => p === "auth" ? "home" : p);
      } else {
        setUser(null);
        setPage("auth");
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const handleAuthSuccess = useCallback((u: AuthUser) => {
    setUser(u);
    setPage("home");
  }, []);

  const navigateToQuiz = useCallback(() => {
    setPage("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const navigateToTimeline = useCallback(() => {
    setPage("timeline");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const navigateTo = useCallback((id: PhilosopherId) => {
    setPage(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goHome = useCallback(() => {
    setPage("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    setPage("auth");
  }, []);

  const isPhilPage  = page !== "auth" && page !== "home" && page !== "quiz" && page !== "timeline";
  const currentPhil = isPhilPage ? PHILOSOPHERS[page as PhilosopherId] : null;

  // Show spinner while Firebase resolves the session
  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f6f2eb" }}>
      <RefreshCw size={24} color="#c9a96e" className="animate-spin" />
    </div>
  );

  if (page === "auth") return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Inter',sans-serif}
        ::selection{background:#c9a96e44}
        input{outline:none}
        input::placeholder{color:#c0b09a}
        button{outline:none}
        .font-serif{font-family:'Lora',Georgia,serif}
        @keyframes spin{to{transform:rotate(360deg)}}
        .animate-spin{animation:spin 0.8s linear infinite}
      `}</style>
      <AuthPage onSuccess={handleAuthSuccess} />
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Inter',sans-serif}
        ::selection{background:#c9a96e44}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:#f6f2eb}
        ::-webkit-scrollbar-thumb{background:#d4c9b4;border-radius:4px}
        input{outline:none}
        input::placeholder{color:#b8a890}
        button{outline:none}
        .font-serif{font-family:'Lora',Georgia,serif}
        @keyframes progress-fill{from{width:0%}to{width:100%}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .animate-spin{animation:spin 0.8s linear infinite}
      `}</style>

      <div className="min-h-screen" style={{ background: "#f6f2eb", color: "#2c2418" }}>
        {/* Ambient glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ width: "80vw", height: "45vh", background: "radial-gradient(ellipse,rgba(201,169,110,0.1) 0%,transparent 70%)", zIndex: 0 }} />

        <div className="relative" style={{ zIndex: 1 }}>
          {/* Header */}
          <header className="sticky top-0 border-b flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4" style={{ background: "rgba(246,242,235,0.94)", backdropFilter: "blur(12px)", borderColor: "#dfd7c9", zIndex: 10 }}>
            <button onClick={goHome} className="flex items-center gap-2" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <BookOpen size={16} color="#8b6914" strokeWidth={1.5} />
              <span className="text-xs tracking-widest uppercase font-semibold" style={{ color: "#8b6914" }}>Ancient Wisdom</span>
            </button>

            {/* Breadcrumb */}
            {(currentPhil || page === "quiz" || page === "timeline") && (
              <div className="flex items-center gap-1 text-xs tracking-wide" style={{ color: "#b8a890" }}>
                <span className="cursor-pointer underline decoration-[#ddd6c6]" onClick={goHome}>Home</span>
                <ChevronRight size={11} />
                <span className="font-semibold" style={{ color: currentPhil ? currentPhil.color : "#b8922a" }}>
                  {currentPhil ? currentPhil.label : page === "quiz" ? "Philosopher Quiz" : "Timeline"}
                </span>
              </div>
            )}

            {/* User + sign out */}
            <div className="flex items-center gap-3">
              {!currentPhil && (
                <span className="hidden sm:inline text-xs tracking-widest uppercase" style={{ color: "#b8a890" }}>{QUOTES.length} Aphorisms</span>
              )}
              {user && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "#8a7860" }}>
                    <User size={13} strokeWidth={1.8} />
                    <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                  </div>
                  <button onClick={handleSignOut} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border transition-colors"
                    style={{ background: "none", borderColor: "#d0c8bc", color: "#8a7860", cursor: "pointer" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#9c5c1a"; e.currentTarget.style.color = "#9c5c1a"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#d0c8bc"; e.currentTarget.style.color = "#8a7860"; }}>
                    <LogOut size={12} strokeWidth={1.8} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* Pages */}
          {page === "home"
            ? <HomePage onNavigate={navigateTo} user={user!} onSignOut={handleSignOut} onNavigateQuiz={navigateToQuiz} onNavigateTimeline={navigateToTimeline} />
            : page === "quiz"
            ? <PhilosopherQuiz onBack={goHome} />
            : page === "timeline"
            ? <PhilosophyTimeline onBack={goHome} />
            : <PhilosopherPage id={page as PhilosopherId} onBack={goHome} />
          }

          {/* Footer */}
          <footer className="border-t py-7 text-center" style={{ background: "#fff", borderColor: "#dfd7c9" }}>
            <p className="text-xs tracking-widest uppercase" style={{ color: "#c4b49a" }}>
              Ancient Philosophy · 6th Century BC – 2nd Century AD · {QUOTES.length} Aphorisms · 9 Thinkers
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
