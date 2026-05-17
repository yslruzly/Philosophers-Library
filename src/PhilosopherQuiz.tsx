import { useState, useEffect, useCallback } from "react";
import { ArrowRight, RefreshCw, Share2, Check } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SchoolKey = "stoic" | "epicurean" | "cynic" | "skeptic" | "platonic" | "aristotelian";
type QuizScreen = "intro" | "question" | "loading" | "result";

interface Answer {
  text: string;
  scores: Partial<Record<SchoolKey, number>>;
}

interface Question {
  text: string;
  answers: Answer[];
}

interface PhilosopherData {
  school: string;
  symbol: string;
  analysis: string;
  quote: { text: string; attr: string };
  beliefs: string[];
  strengths: string[];
  weaknesses: string[];
  relevance: string;
  philosopher: { name: string; years: string; desc: string };
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const QUESTIONS: Question[] = [
  {
    text: "What does it mean to live a truly good life?",
    answers: [
      { text: "To master one's inner world — desires, fears, and reactions.", scores: { stoic: 3, cynic: 1 } },
      { text: "To pursue pleasure wisely and avoid unnecessary pain.", scores: { epicurean: 3, skeptic: 1 } },
      { text: "To seek truth relentlessly, even at great personal cost.", scores: { platonic: 3, stoic: 1 } },
      { text: "To live virtuously and fulfil one's natural purpose.", scores: { aristotelian: 3, stoic: 1 } },
    ],
  },
  {
    text: "When suffering finds you, what is your instinct?",
    answers: [
      { text: "Endure it with reason. Suffering cannot touch the will.", scores: { stoic: 3, aristotelian: 1 } },
      { text: "Withdraw from it — most suffering is unnecessary and avoidable.", scores: { epicurean: 3, skeptic: 1 } },
      { text: "Reject the social structures that cause it.", scores: { cynic: 3, stoic: 1 } },
      { text: "Question whether it can be fully understood or judged at all.", scores: { skeptic: 3, platonic: 1 } },
    ],
  },
  {
    text: "Can human emotions be truly controlled?",
    answers: [
      { text: "Yes — through reason and relentless self-discipline.", scores: { stoic: 3, aristotelian: 1 } },
      { text: "They should be moderated, not suppressed. Balance is the ideal.", scores: { aristotelian: 3, epicurean: 1 } },
      { text: "Emotions are mostly illusions caused by false beliefs.", scores: { stoic: 2, epicurean: 2 } },
      { text: "I am uncertain. The nature of mind itself remains a mystery.", scores: { skeptic: 3, platonic: 1 } },
    ],
  },
  {
    text: "Where does your deepest loyalty lie?",
    answers: [
      { text: "To reason, truth, and the life of the mind.", scores: { platonic: 3, stoic: 1 } },
      { text: "To my own inner freedom and self-sufficiency.", scores: { stoic: 2, cynic: 2 } },
      { text: "To my community, friends, and the cultivation of virtue together.", scores: { aristotelian: 3, epicurean: 1 } },
      { text: "To no single cause — I question all allegiances.", scores: { skeptic: 3, cynic: 1 } },
    ],
  },
  {
    text: "What is your relationship with society's rules and conventions?",
    answers: [
      { text: "They are worth following when they align with natural law.", scores: { stoic: 2, aristotelian: 2 } },
      { text: "Most conventions are traps — true freedom lies beyond them.", scores: { cynic: 3, skeptic: 1 } },
      { text: "They exist to cultivate virtue and human flourishing.", scores: { aristotelian: 3, platonic: 1 } },
      { text: "I suspend judgment — their value is deeply uncertain.", scores: { skeptic: 3, epicurean: 1 } },
    ],
  },
  {
    text: "A friend asks: can we ever truly know anything?",
    answers: [
      { text: "Yes — through the disciplined exercise of reason and logic.", scores: { aristotelian: 3, stoic: 1 } },
      { text: "The Forms — eternal, perfect realities — can be known by the soul.", scores: { platonic: 3 } },
      { text: "Certainty is elusive. I suspend judgment and live in peace.", scores: { skeptic: 3, epicurean: 1 } },
      { text: "We can know what is necessary for virtue — and that is enough.", scores: { stoic: 3, cynic: 1 } },
    ],
  },
  {
    text: "What is your truest motivation in life?",
    answers: [
      { text: "The pursuit of tranquility and freedom from disturbance.", scores: { epicurean: 3, skeptic: 2 } },
      { text: "The love of wisdom — philosophy is how I breathe.", scores: { platonic: 3, stoic: 1 } },
      { text: "Excellence. To become the best possible version of myself.", scores: { aristotelian: 3, stoic: 1 } },
      { text: "Liberation from illusion — wealth, reputation, comfort.", scores: { cynic: 3, stoic: 1 } },
    ],
  },
  {
    text: "How do you feel about wealth and material comfort?",
    answers: [
      { text: "They are indifferent — neither to be pursued nor feared.", scores: { stoic: 3, cynic: 1 } },
      { text: "Simple pleasures are sufficient; excess only breeds suffering.", scores: { epicurean: 3, cynic: 1 } },
      { text: "They are tools — valuable only in service of a virtuous life.", scores: { aristotelian: 3, stoic: 1 } },
      { text: "Distractions. The examined inner life is all that matters.", scores: { platonic: 3, cynic: 1 } },
    ],
  },
  {
    text: "At the end of your days, what would you wish had mattered most?",
    answers: [
      { text: "That I faced every hour with courage and equanimity.", scores: { stoic: 3 } },
      { text: "That I knew myself — and helped others question themselves.", scores: { platonic: 3, stoic: 1 } },
      { text: "That I lived fully, loved well, and found true contentment.", scores: { epicurean: 3, aristotelian: 1 } },
      { text: "That I lived freely — beholden to nothing and no one.", scores: { cynic: 3, skeptic: 1 } },
    ],
  },
  {
    text: "How do you respond when someone challenges your beliefs?",
    answers: [
      { text: "I examine the argument carefully and update my views accordingly.", scores: { aristotelian: 3, platonic: 1 } },
      { text: "I probe deeper — their challenge may reveal a hidden truth.", scores: { platonic: 3, stoic: 1 } },
      { text: "I remain unmoved. My convictions are grounded in reason.", scores: { stoic: 3, cynic: 1 } },
      { text: "I welcome it — all beliefs deserve scrutiny, including my own.", scores: { skeptic: 3, aristotelian: 1 } },
    ],
  },
  {
    text: "Which image resonates most deeply with you?",
    answers: [
      { text: "A flame burning steadily in the wind — unshaken, unwavering.", scores: { stoic: 3 } },
      { text: "A philosopher's garden at dusk — peaceful, simple, complete.", scores: { epicurean: 3 } },
      { text: "A man with a lantern, searching the marketplace at noon.", scores: { cynic: 3, skeptic: 1 } },
      { text: "A scholar alone with a candle, tracing the outlines of truth.", scores: { platonic: 3, aristotelian: 1 } },
    ],
  },
  {
    text: "What role does friendship play in a good life?",
    answers: [
      { text: "It is central — good friends are essential to human flourishing.", scores: { aristotelian: 3, epicurean: 1 } },
      { text: "It is among life's greatest pleasures — chosen with great care.", scores: { epicurean: 3, aristotelian: 1 } },
      { text: "It is valuable, but self-sufficiency must come first.", scores: { stoic: 3, cynic: 1 } },
      { text: "Most bonds are chains. True kinship with ideas is enough.", scores: { cynic: 2, platonic: 2 } },
    ],
  },
];

const PHILOSOPHERS: Record<SchoolKey, PhilosopherData> = {
  stoic: {
    school: "Stoicism", symbol: "⚶",
    analysis: "You possess a rare inner stillness — a mind that meets the storm without flinching. You believe the external world cannot touch what is most essentially you. Your philosophy is one of radical acceptance and iron self-discipline. You do not seek to change the world; you seek to change how you meet it.",
    quote: { text: "You have power over your mind — not outside events. Realize this, and you will find strength.", attr: "Marcus Aurelius, Meditations" },
    beliefs: ["The dichotomy of control", "Virtue as the only true good", "Living according to nature and reason", "Equanimity in the face of fate"],
    strengths: ["Unshakeable resilience", "Clarity under pressure", "Deep self-awareness"],
    weaknesses: ["Can suppress emotion unhealthily", "May appear cold or detached", "Risk of emotional repression"],
    relevance: "In an age of anxiety and chaos, the Stoic is a rare stabilising force — a person others turn to in crisis.",
    philosopher: { name: "Marcus Aurelius", years: "121–180 AD", desc: "Emperor, soldier, philosopher. He governed the greatest empire on earth while writing the most private philosophical diary in history." },
  },
  epicurean: {
    school: "Epicureanism", symbol: "❧",
    analysis: "You understand something most people miss: that pleasure, wisely pursued, is not indulgence — it is wisdom. You seek not excess but tranquility, not pleasure of the body but peace of the mind. Friendship, simplicity, and the quiet joys of an examined life are your true luxuries.",
    quote: { text: "Do not spoil what you have by desiring what you have not; remember that what you now have was once among the things you only hoped for.", attr: "Epicurus" },
    beliefs: ["Ataraxia — freedom from mental disturbance", "Aponia — freedom from physical pain", "Friendship as the greatest pleasure", "Simple living over ambitious striving"],
    strengths: ["Emotional contentment", "Rich and intentional friendships", "Immunity to status anxiety"],
    weaknesses: ["May avoid difficult truths", "Can become complacent", "Risk of withdrawing too far from the world"],
    relevance: "In a world of addiction to noise and stimulation, the Epicurean teaches us that enough is abundance.",
    philosopher: { name: "Epicurus", years: "341–270 BC", desc: "He founded a school called The Garden and taught that happiness is simple, friendship is sacred, and philosophy exists to free us from fear." },
  },
  cynic: {
    school: "Cynicism", symbol: "☯",
    analysis: "You are the radical questioner — the one who sees through pretense and refuses to play the game. Where others see status, you see chains. Where others see wealth, you see anxiety. You live by a ruthless simplicity, and your very existence is a challenge to those around you. You are not bitter — you are free.",
    quote: { text: "I am looking for an honest man.", attr: "Diogenes of Sinope" },
    beliefs: ["Convention is the enemy of virtue", "Self-sufficiency is the only true wealth", "Natural living over social performance", "Truth-telling, however uncomfortable"],
    strengths: ["Radical authenticity", "Freedom from social anxiety", "Incorruptible perspective"],
    weaknesses: ["Can alienate others", "May become nihilistic", "Risk of performative contrarianism"],
    relevance: "Every age needs its Diogenes — the one who holds a lamp to comfortable lies.",
    philosopher: { name: "Diogenes", years: "412–323 BC", desc: "He lived in a barrel, mocked Alexander the Great, and made philosophers uncomfortable for sport. He may have been the freest person who ever lived." },
  },
  skeptic: {
    school: "Pyrrhonian Skepticism", symbol: "∿",
    analysis: "You hold all certainties lightly. Where others rush to conclusions, you pause and ask: but do we actually know this? Your world is one of perpetual inquiry, and you have found a strange peace in that uncertainty. To suspend judgment is, for you, not weakness — it is the deepest form of intellectual honesty.",
    quote: { text: "The man who suspends judgment on all things achieves the greatest tranquility.", attr: "Pyrrho of Elis" },
    beliefs: ["Suspension of judgment (epoché)", "Appearances can be known; truth cannot", "Tranquility through non-assertion", "All competing arguments have equal weight"],
    strengths: ["Intellectual humility", "Immunity to dogmatism", "Open-minded curiosity"],
    weaknesses: ["Risk of paralysis by analysis", "May frustrate those seeking guidance", "Can appear non-committal"],
    relevance: "In an age of false certainties and loud conviction, the skeptic is a quiet revolutionary.",
    philosopher: { name: "Pyrrho", years: "360–270 BC", desc: "He returned from India transformed, taught nothing, wrote nothing, and achieved such equanimity that he reportedly walked into traffic without concern — saved repeatedly by his students." },
  },
  platonic: {
    school: "Platonism", symbol: "△",
    analysis: "You are haunted by the sense that reality is greater than what our eyes reveal. Behind the world of appearances lies a deeper truth — and you cannot stop reaching for it. You are drawn to beauty, justice, and the life of the mind. The question 'what is the good?' keeps you awake at night, and you wouldn't have it any other way.",
    quote: { text: "The unexamined life is not worth living.", attr: "Socrates, in Plato's Apology" },
    beliefs: ["The Theory of Forms — perfect eternal realities", "The soul's kinship with eternal truth", "Philosophy as the love of wisdom", "Justice as harmony of the soul"],
    strengths: ["Deep idealism and vision", "Tireless pursuit of truth", "Ability to inspire others toward virtue"],
    weaknesses: ["Can become impractical", "May appear otherworldly", "Risk of intellectual arrogance"],
    relevance: "Every civilization needs its dreamers — those who refuse to accept the world as it merely appears.",
    philosopher: { name: "Plato", years: "428–348 BC", desc: "Student of Socrates, teacher of Aristotle. He founded the Academy — the world's first university — and wrote dialogues that have never stopped being read." },
  },
  aristotelian: {
    school: "Aristotelianism", symbol: "⊕",
    analysis: "You are the practical philosopher — a mind that refuses to abandon the real world for abstract ideals. You believe in observation, balance, and the patient cultivation of excellence. Virtue, for you, is not an idea — it is a habit formed through daily action. You seek flourishing, not perfection, and you understand that the good life is built, not discovered.",
    quote: { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", attr: "Aristotle, Nicomachean Ethics" },
    beliefs: ["Eudaimonia — human flourishing as the highest good", "The Golden Mean — virtue lies between extremes", "Virtue as habit cultivated through practice", "Friendship and community as essential to the good life"],
    strengths: ["Practical wisdom", "Balance and groundedness", "Ability to thrive in the real world"],
    weaknesses: ["May lack the radical vision of the idealist", "Can be overly systematic", "Risk of excessive caution"],
    relevance: "The Aristotelian is needed wherever wisdom must be applied, not merely admired.",
    philosopher: { name: "Aristotle", years: "384–322 BC", desc: "Tutor to Alexander the Great. He classified virtually every field of human knowledge and created the study of logic, biology, ethics, and political science." },
  },
};

const LOADING_QUOTES = [
  { text: "The soul that sees beauty may sometimes walk alone.", attr: "Goethe" },
  { text: "Know thyself.", attr: "Temple of Apollo at Delphi" },
  { text: "He who knows others is wise. He who knows himself is enlightened.", attr: "Lao Tzu" },
  { text: "Knowing yourself is the beginning of all wisdom.", attr: "Aristotle" },
  { text: "The first principle is that you must not fool yourself.", attr: "Richard Feynman" },
];

const LETTERS = ["A", "B", "C", "D"];

// ─── Styled sub-components ────────────────────────────────────────────────────

const S = {
  // Shared token values as inline style objects
  gold: "#c9a84c",
  goldDim: "#8a6e2e",
  ink: "#1a1510",
  parchment: "#f4ede0",
  textMain: "#e8dcc8",
  textDim: "#a89878",
  textMuted: "#7a6850",
  serif: "'Cormorant Garamond', Georgia, serif",
  sans: "'Inter', sans-serif",
};

// ─── Intro Screen ─────────────────────────────────────────────────────────────

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
      <div style={{ fontFamily: S.serif, fontSize: "3.5rem", color: S.gold, opacity: 0.3, lineHeight: 1, marginBottom: "1rem", letterSpacing: ".3em" }}>
        ⊕ △ ⚶
      </div>
      <h1 style={{ fontFamily: S.serif, fontSize: "clamp(2rem,6vw,3.5rem)", fontWeight: 300, color: S.parchment, lineHeight: 1.15, marginBottom: ".5rem" }}>
        Which Ancient Philosopher<br /><em style={{ fontStyle: "italic", color: S.gold }}>Are You?</em>
      </h1>
      <p style={{ fontFamily: S.serif, fontSize: "1.05rem", color: S.textDim, fontStyle: "italic", marginBottom: "2rem", letterSpacing: ".03em" }}>
        A philosophical reckoning in twelve questions
      </p>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1.5rem auto", maxWidth: "280px" }}>
        <div style={{ flex: 1, height: "1px", background: `linear-gradient(to right, transparent, ${S.goldDim})` }} />
        <span style={{ color: S.gold, fontSize: ".7rem", letterSpacing: ".3em", fontFamily: S.sans }}>∿</span>
        <div style={{ flex: 1, height: "1px", background: `linear-gradient(to left, transparent, ${S.goldDim})` }} />
      </div>

      <p style={{ fontSize: ".88rem", color: S.textDim, lineHeight: 1.85, maxWidth: "500px", margin: "0 auto 2rem" }}>
        Across twenty-five centuries, the greatest minds of antiquity wrestled with questions that still shape how we live, love, and find meaning. This inquiry will reveal which philosophical tradition — and which philosopher — speaks closest to your soul.
      </p>

      <blockquote style={{ fontFamily: S.serif, fontSize: "1.05rem", fontStyle: "italic", color: S.textMuted, margin: "1.5rem auto", maxWidth: "420px", borderLeft: `2px solid ${S.goldDim}`, paddingLeft: "1.25rem", textAlign: "left" }}>
        "The unexamined life is not worth living."
        <footer style={{ marginTop: ".5rem", fontSize: ".78rem", color: S.textMuted, fontStyle: "normal", letterSpacing: ".06em" }}>— Socrates</footer>
      </blockquote>

      <button
        onClick={onStart}
        style={{ display: "inline-flex", alignItems: "center", gap: ".6rem", padding: ".85rem 2.5rem", background: `linear-gradient(135deg, ${S.goldDim}, ${S.gold})`, border: "none", borderRadius: "2px", color: S.ink, fontFamily: S.serif, fontSize: "1.05rem", fontWeight: 500, letterSpacing: ".08em", cursor: "pointer", marginTop: "1rem", transition: "transform .2s, box-shadow .2s" }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px rgba(201,168,76,.25)`; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
      >
        Begin the Inquiry <ArrowRight size={16} strokeWidth={1.8} />
      </button>
    </div>
  );
}

// ─── Question Screen ──────────────────────────────────────────────────────────

function QuestionScreen({
  question, index, total, selected, onSelect, onNext,
}: {
  question: Question; index: number; total: number;
  selected: number | null; onSelect: (i: number) => void; onNext: () => void;
}) {
  const pct = Math.round((index / total) * 100);

  return (
    <div>
      {/* Progress */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".6rem" }}>
          <span style={{ fontSize: ".7rem", letterSpacing: ".15em", textTransform: "uppercase", color: S.textMuted }}>
            Question {index + 1} of {total}
          </span>
          <span style={{ color: S.gold, fontFamily: S.serif, fontSize: ".88rem" }}>{pct}%</span>
        </div>
        <div style={{ height: "2px", background: "rgba(201,168,76,.15)", borderRadius: "2px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(to right, ${S.goldDim}, ${S.gold})`, borderRadius: "2px", transition: "width .5s cubic-bezier(.4,0,.2,1)" }} />
        </div>
      </div>

      {/* Question card */}
      <div style={{ background: "linear-gradient(135deg,rgba(44,36,24,.95),rgba(29,22,14,.98))", border: "1px solid rgba(201,168,76,.15)", borderRadius: "4px", padding: "clamp(1.5rem,4vw,2.5rem)", marginBottom: "1.25rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(to right, transparent, ${S.goldDim}, transparent)` }} />
        <div style={{ fontSize: ".66rem", letterSpacing: ".25em", textTransform: "uppercase", color: S.goldDim, marginBottom: ".8rem", fontFamily: S.sans }}>
          Question {String(index + 1).padStart(2, "0")}
        </div>
        <p style={{ fontFamily: S.serif, fontSize: "clamp(1.2rem,3vw,1.6rem)", fontWeight: 400, color: S.parchment, lineHeight: 1.45, fontStyle: "italic" }}>
          {question.text}
        </p>
      </div>

      {/* Answers */}
      <div style={{ display: "flex", flexDirection: "column", gap: ".7rem" }}>
        {question.answers.map((a, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            style={{
              background: selected === i ? "rgba(201,168,76,.12)" : "rgba(44,36,24,.6)",
              border: `1px solid ${selected === i ? S.gold : "rgba(201,168,76,.12)"}`,
              borderRadius: "3px",
              padding: "clamp(.75rem,2vw,1rem) clamp(1rem,3vw,1.25rem)",
              cursor: "pointer",
              textAlign: "left",
              transition: "all .2s",
              display: "flex",
              alignItems: "flex-start",
              gap: ".75rem",
              transform: selected === i ? "translateX(4px)" : "none",
            }}
            onMouseEnter={e => { if (selected !== i) { e.currentTarget.style.borderColor = "rgba(201,168,76,.4)"; e.currentTarget.style.transform = "translateX(4px)"; } }}
            onMouseLeave={e => { if (selected !== i) { e.currentTarget.style.borderColor = "rgba(201,168,76,.12)"; e.currentTarget.style.transform = "none"; } }}
          >
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: "22px", height: "22px", border: `1px solid ${selected === i ? S.gold : S.goldDim}`,
              borderRadius: "50%", fontSize: ".68rem", color: selected === i ? S.ink : S.gold,
              background: selected === i ? S.gold : "transparent",
              fontFamily: S.sans, flexShrink: 0, marginTop: "1px", transition: "all .2s",
            }}>
              {LETTERS[i]}
            </span>
            <span style={{ fontFamily: S.serif, fontSize: "clamp(.95rem,2vw,1.05rem)", color: selected === i ? S.parchment : S.textMain, lineHeight: 1.55, flex: 1 }}>
              {a.text}
            </span>
          </button>
        ))}
      </div>

      {/* Next button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
        <button
          onClick={onNext}
          disabled={selected === null}
          style={{
            display: "flex", alignItems: "center", gap: ".5rem",
            padding: ".72rem 1.75rem",
            background: "transparent",
            border: `1px solid ${S.goldDim}`,
            borderRadius: "2px",
            color: S.gold,
            fontFamily: S.serif, fontSize: ".95rem", letterSpacing: ".06em",
            cursor: selected === null ? "not-allowed" : "pointer",
            transition: "all .2s",
            opacity: selected === null ? 0.3 : 1,
          }}
          onMouseEnter={e => { if (selected !== null) e.currentTarget.style.background = "rgba(201,168,76,.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          {index < total - 1 ? "Continue" : "Reveal My Philosopher"} <ArrowRight size={14} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

function LoadingScreen() {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setQuoteIdx(i => (i + 1) % LOADING_QUOTES.length);
        setVisible(true);
      }, 400);
    }, 1800);
    return () => clearInterval(iv);
  }, []);

  const q = LOADING_QUOTES[quoteIdx];

  return (
    <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
      <div style={{
        width: "70px", height: "70px", borderRadius: "50%",
        border: "1px solid rgba(201,168,76,.3)", borderTopColor: S.gold,
        margin: "0 auto 2rem",
        animation: "quiz-spin 1.2s linear infinite",
      }} />
      <p style={{ fontSize: ".68rem", letterSpacing: ".3em", textTransform: "uppercase", color: S.goldDim, marginBottom: "1.5rem" }}>
        Consulting the ancients…
      </p>
      <div style={{ opacity: visible ? 1 : 0, transition: "opacity .4s", minHeight: "4rem" }}>
        <p style={{ fontFamily: S.serif, fontSize: "1.08rem", fontStyle: "italic", color: S.textDim, maxWidth: "380px", margin: "0 auto .5rem", lineHeight: 1.6 }}>
          "{q.text}"
        </p>
        <p style={{ fontSize: ".75rem", color: S.textMuted, letterSpacing: ".1em" }}>— {q.attr}</p>
      </div>
    </div>
  );
}

// ─── Result Screen ────────────────────────────────────────────────────────────

function ResultCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(44,36,24,.7)", border: "1px solid rgba(201,168,76,.15)", borderRadius: "4px", padding: "1.4rem", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(to right, transparent, ${S.goldDim}, transparent)` }} />
      <div style={{ fontSize: ".62rem", letterSpacing: ".25em", textTransform: "uppercase", color: S.goldDim, marginBottom: ".85rem", fontFamily: S.sans }}>{title}</div>
      {children}
    </div>
  );
}

function CompatBar({ label, pct, delay }: { label: string; pct: number; delay: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
      <span style={{ fontSize: ".8rem", color: S.textDim, width: "130px", flexShrink: 0, fontFamily: S.serif }}>{label}</span>
      <div style={{ flex: 1, height: "4px", background: "rgba(255,255,255,.06)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${width}%`, background: `linear-gradient(to right, ${S.goldDim}, ${S.gold})`, borderRadius: "2px", transition: "width 1.2s cubic-bezier(.4,0,.2,1)" }} />
      </div>
      <span style={{ fontSize: ".75rem", color: S.gold, width: "36px", textAlign: "right", fontFamily: S.sans }}>{pct}%</span>
    </div>
  );
}

function ResultScreen({ scores, onRetake }: { scores: Record<SchoolKey, number>; onRetake: () => void }) {
  const [toast, setToast] = useState(false);
  const sorted = (Object.entries(scores) as [SchoolKey, number][]).sort((a, b) => b[1] - a[1]);
  const topKey = sorted[0][0];
  const total = sorted.reduce((s, [, v]) => s + v, 0);
  const phil = PHILOSOPHERS[topKey];
  const compat = sorted.map(([k, v]) => ({
    label: PHILOSOPHERS[k].school,
    pct: Math.round((v / Math.max(total, 1)) * 100),
  }));

  const handleShare = useCallback(() => {
    const text = `I align most with ${phil.philosopher.name} — the ${phil.school} philosopher. Which ancient philosopher are you?`;
    if (navigator.share) {
      navigator.share({ title: "My Philosopher", text }).catch(() => copyText(text));
    } else {
      copyText(text);
    }
  }, [phil]);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setToast(true);
      setTimeout(() => setToast(false), 2500);
    });
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{ fontSize: ".68rem", letterSpacing: ".3em", textTransform: "uppercase", color: S.goldDim, marginBottom: ".75rem" }}>
          Your philosophical alignment is…
        </div>
        <h1 style={{ fontFamily: S.serif, fontSize: "clamp(2.2rem,7vw,4rem)", fontWeight: 300, color: S.parchment, lineHeight: 1, marginBottom: ".25rem", animation: "quiz-reveal 1s ease .2s both" }}>
          {phil.philosopher.name}
        </h1>
        <div style={{ fontFamily: S.serif, fontSize: "1.05rem", fontStyle: "italic", color: S.gold }}>{phil.school}</div>
        <div style={{ fontSize: "2.5rem", margin: ".75rem 0", opacity: .6 }}>{phil.symbol}</div>
        <p style={{ fontFamily: S.serif, fontSize: ".9rem", fontStyle: "italic", color: S.textMuted }}>
          {phil.philosopher.years} · {phil.philosopher.desc}
        </p>
      </div>

      {/* Cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: "1rem" }}>
        {/* Portrait — full width */}
        <div style={{ gridColumn: "1 / -1" }}>
          <ResultCard title="Your Portrait">
            <p style={{ fontFamily: S.serif, fontSize: "1rem", color: S.textMain, lineHeight: 1.8 }}>{phil.analysis}</p>
          </ResultCard>
        </div>

        <ResultCard title="A Word From Your Philosopher">
          <p style={{ fontFamily: S.serif, fontSize: "1.1rem", fontStyle: "italic", color: S.parchment, lineHeight: 1.6, borderLeft: `2px solid ${S.goldDim}`, paddingLeft: "1rem" }}>
            {phil.quote.text}
          </p>
          <p style={{ fontSize: ".75rem", color: S.textMuted, marginTop: ".6rem", letterSpacing: ".06em" }}>— {phil.quote.attr}</p>
        </ResultCard>

        <ResultCard title="Core Beliefs">
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: ".5rem" }}>
            {phil.beliefs.map((b, i) => (
              <li key={i} style={{ fontFamily: S.serif, fontSize: ".95rem", color: S.textMain, display: "flex", gap: ".5rem" }}>
                <span style={{ color: S.gold, flexShrink: 0 }}>◆</span>{b}
              </li>
            ))}
          </ul>
        </ResultCard>

        <ResultCard title="Strengths">
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".45rem", marginBottom: ".85rem" }}>
            {phil.strengths.map((s, i) => (
              <span key={i} style={{ padding: ".28rem .7rem", border: "1px solid rgba(201,168,76,.25)", borderRadius: "2px", fontSize: ".78rem", color: S.textDim, fontFamily: S.sans, letterSpacing: ".05em" }}>{s}</span>
            ))}
          </div>
          <div style={{ fontSize: ".62rem", letterSpacing: ".25em", textTransform: "uppercase", color: S.goldDim, marginBottom: ".65rem", fontFamily: S.sans }}>Tensions</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".45rem" }}>
            {phil.weaknesses.map((w, i) => (
              <span key={i} style={{ padding: ".28rem .7rem", border: "1px solid rgba(201,168,76,.12)", borderRadius: "2px", fontSize: ".78rem", color: S.textMuted, fontFamily: S.sans }}>{w}</span>
            ))}
          </div>
        </ResultCard>

        <ResultCard title="Modern Relevance">
          <p style={{ fontFamily: S.serif, fontSize: "1rem", color: S.textMain, lineHeight: 1.8 }}>{phil.relevance}</p>
        </ResultCard>

        <ResultCard title="Philosophical Compatibility">
          <div style={{ display: "flex", flexDirection: "column", gap: ".6rem" }}>
            {compat.map((c, i) => (
              <CompatBar key={c.label} label={c.label} pct={c.pct} delay={400 + i * 80} />
            ))}
          </div>
        </ResultCard>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: ".75rem", marginTop: "2rem", justifyContent: "center" }}>
        <button
          onClick={handleShare}
          style={{ display: "flex", alignItems: "center", gap: ".5rem", padding: ".7rem 1.5rem", border: `1px solid ${S.goldDim}`, borderRadius: "2px", background: "transparent", color: S.gold, fontFamily: S.serif, fontSize: ".92rem", letterSpacing: ".05em", cursor: "pointer", transition: "all .2s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,.1)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          {toast ? <Check size={14} strokeWidth={2} /> : <Share2 size={14} strokeWidth={1.8} />}
          {toast ? "Copied!" : "Share Result"}
        </button>
        <button
          onClick={onRetake}
          style={{ display: "flex", alignItems: "center", gap: ".5rem", padding: ".7rem 1.5rem", border: `1px solid ${S.goldDim}`, borderRadius: "2px", background: "transparent", color: S.gold, fontFamily: S.serif, fontSize: ".92rem", letterSpacing: ".05em", cursor: "pointer", transition: "all .2s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,.1)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <RefreshCw size={14} strokeWidth={1.8} /> Retake Quiz
        </button>
      </div>
    </div>
  );
}

// ─── Main Quiz Component ──────────────────────────────────────────────────────

export default function PhilosopherQuiz({ onBack }: { onBack?: () => void }) {
  const [screen, setScreen] = useState<QuizScreen>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<Record<SchoolKey, number>>({ stoic: 0, epicurean: 0, cynic: 0, skeptic: 0, platonic: 0, aristotelian: 0 });
  const [selected, setSelected] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);

  const transition = useCallback((fn: () => void) => {
    setAnimating(true);
    setTimeout(() => { setAnimating(false); fn(); }, 350);
  }, []);

  const handleStart = () => {
    setCurrentQ(0);
    setScores({ stoic: 0, epicurean: 0, cynic: 0, skeptic: 0, platonic: 0, aristotelian: 0 });
    setSelected(null);
    transition(() => setScreen("question"));
  };

  const handleNext = () => {
    if (selected === null) return;
    const ans = QUESTIONS[currentQ].answers[selected];
    const newScores = { ...scores };
    Object.entries(ans.scores).forEach(([k, v]) => {
      newScores[k as SchoolKey] = (newScores[k as SchoolKey] || 0) + (v || 0);
    });
    setScores(newScores);
    setSelected(null);

    if (currentQ < QUESTIONS.length - 1) {
      transition(() => setCurrentQ(q => q + 1));
    } else {
      transition(() => setScreen("loading"));
      setTimeout(() => setScreen("result"), 3600);
    }
  };

  const handleRetake = () => {
    transition(() => {
      setScreen("intro");
      setCurrentQ(0);
      setScores({ stoic: 0, epicurean: 0, cynic: 0, skeptic: 0, platonic: 0, aristotelian: 0 });
      setSelected(null);
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&display=swap');
        @keyframes quiz-spin { to { transform: rotate(360deg); } }
        @keyframes quiz-fadein { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes quiz-fadeout { from { opacity:1; transform:translateY(0); } to { opacity:0; transform:translateY(-12px); } }
        @keyframes quiz-reveal { from { opacity:0; letter-spacing:.5em; } to { opacity:1; letter-spacing:normal; } }
      `}</style>

      {/* Full-page dark backdrop */}
      <div style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse 80% 60% at 20% 10%,rgba(201,168,76,0.07) 0%,transparent 60%), radial-gradient(ellipse 100% 100% at 50% 50%,#1a1510 0%,#0d0c08 100%)",
        color: S.textMain,
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "1.5rem 1rem 4rem",
      }}>

        {/* Header nav */}
        <div style={{ width: "100%", maxWidth: "780px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{ background: "none", border: "none", color: S.textMuted, cursor: "pointer", fontSize: ".72rem", letterSpacing: ".15em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: ".35rem", padding: 0 }}
              onMouseEnter={e => (e.currentTarget.style.color = S.gold)}
              onMouseLeave={e => (e.currentTarget.style.color = S.textMuted)}
            >
              ← Library
            </button>
          )}
          <div style={{ fontFamily: S.serif, fontSize: ".8rem", color: S.goldDim, letterSpacing: ".2em", marginLeft: "auto" }}>
            The Philosopher's Library
          </div>
        </div>

        {/* Screen content */}
        <div style={{
          width: "100%", maxWidth: "780px",
          opacity: animating ? 0 : 1,
          transform: animating ? "translateY(-10px)" : "translateY(0)",
          transition: "opacity .35s ease, transform .35s ease",
          animation: !animating ? "quiz-fadein .55s ease" : "none",
        }}>
          {screen === "intro"    && <IntroScreen onStart={handleStart} />}
          {screen === "question" && (
            <QuestionScreen
              question={QUESTIONS[currentQ]}
              index={currentQ}
              total={QUESTIONS.length}
              selected={selected}
              onSelect={setSelected}
              onNext={handleNext}
            />
          )}
          {screen === "loading" && <LoadingScreen />}
          {screen === "result"  && <ResultScreen scores={scores} onRetake={handleRetake} />}
        </div>
      </div>
    </>
  );
}
