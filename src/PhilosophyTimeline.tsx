import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type EntryType = "greek" | "roman" | "school" | "event";
type FilterType = "all" | EntryType;

interface TimelineEntry {
  id: string;
  yr: number;
  type: EntryType;
  name: string;
  role: string;
  desc: string;
  quote: string;
  works: string;
  influences: string[];
}

interface Era {
  title: string;
  years: string;
  desc: string;
  entries: TimelineEntry[];
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const ERAS: Era[] = [
  {
    title: "Pre-Socratic Era", years: "624 – 450 BC",
    desc: "The first Greek thinkers sought rational explanations for the cosmos, replacing myth with reason.",
    entries: [
      { id: "thales", yr: -624, type: "greek", name: "Thales of Miletus", role: "The first philosopher",
        desc: "The father of Western philosophy. Thales was the first thinker to seek natural, rational explanations for the cosmos rather than mythological ones. He proposed water as the fundamental substance of all reality, and was the first to predict a solar eclipse.",
        quote: "Know thyself.", works: "No surviving texts — known through Aristotle and later sources.",
        influences: ["Anaximander", "Anaximenes", "Pythagoras"] },
      { id: "anaximander", yr: -610, type: "greek", name: "Anaximander", role: "Student of Thales",
        desc: "Student of Thales. He proposed the apeiron — the 'boundless' or 'indefinite' — as the fundamental substance, transcending any single element. He drew one of the first maps of the world and proposed an early theory of biological evolution.",
        quote: "The source of things is the boundless.", works: "On Nature (fragments only).",
        influences: ["Anaximenes", "Heraclitus"] },
      { id: "pythagoras", yr: -570, type: "greek", name: "Pythagoras", role: "Mathematician and mystic",
        desc: "Founder of a secretive philosophical brotherhood in Croton, Italy. He believed numbers were the ultimate reality underlying all existence, and that the soul was immortal and migrated between bodies across lifetimes.",
        quote: "Number is the ruler of forms and ideas.", works: "Golden Verses (attributed). No confirmed surviving texts.",
        influences: ["Plato", "Philolaus"] },
      { id: "heraclitus", yr: -535, type: "greek", name: "Heraclitus", role: '"The Obscure"',
        desc: "Known for his riddling, difficult style. Heraclitus believed fire was the fundamental element and that perpetual change — flux — was the nature of reality. His idea of the Logos (cosmic reason) deeply influenced Stoicism centuries later.",
        quote: "No man ever steps in the same river twice.", works: "On Nature (fragments — survived only in quotations by others).",
        influences: ["Stoics", "Plato"] },
      { id: "parmenides", yr: -515, type: "greek", name: "Parmenides", role: "Founder of the Eleatic school",
        desc: "He argued through rigorous logic that change and plurality are impossible illusions — only eternal, unchanging, unified Being truly exists. This radical claim forced all later philosophers to grapple with the nature of change and reality.",
        quote: "Being is; not-being is not.", works: "On Nature (poem — partially surviving).",
        influences: ["Zeno of Elea", "Plato", "Aristotle"] },
      { id: "presocratic_school", yr: -500, type: "school", name: "Pre-Socratic Movement", role: "Natural philosophy, 624–450 BC",
        desc: "The collective term for the first wave of Greek philosophy. These thinkers disagreed about whether reality was one or many, changing or static, physical or mathematical. Their arguments established the central problems that Western philosophy would wrestle with for millennia.",
        quote: "", works: "Milesian school, Eleatic school, Pythagorean brotherhood, Atomists.",
        influences: ["Socrates", "Plato", "Aristotle"] },
      { id: "zeno_elea", yr: -490, type: "greek", name: "Zeno of Elea", role: "Creator of the paradoxes",
        desc: "Student of Parmenides. He invented a series of devastating logical paradoxes — Achilles and the Tortoise, the Arrow — designed to prove that motion and plurality are logically impossible. Aristotle spent considerable effort trying to refute them.",
        quote: "That which moves neither moves where it is, nor where it is not.", works: "Fragments known only through Aristotle.",
        influences: ["Aristotle", "Logic"] },
      { id: "empedocles", yr: -494, type: "greek", name: "Empedocles", role: "Theory of the four elements",
        desc: "He proposed that all matter consists of four 'roots' — earth, water, fire, and air — combined by cosmic forces of Love and Strife. This four-element theory dominated Western science and medicine for over 2,000 years.",
        quote: "God is a circle whose centre is everywhere and circumference is nowhere.", works: "On Nature, Purifications (fragments).",
        influences: ["Aristotle", "Hippocrates", "Western medicine"] },
      { id: "democritus", yr: -460, type: "greek", name: "Democritus", role: "Atomic theory",
        desc: "Together with his teacher Leucippus, Democritus proposed that all matter consists of indivisible, indestructible atoms moving through empty space. His materialist worldview was centuries ahead of its time.",
        quote: "Nothing exists except atoms and empty space; everything else is opinion.", works: "Many works — survive only in fragments.",
        influences: ["Epicurus", "Modern science"] },
    ],
  },
  {
    title: "Classical Athens", years: "450 – 323 BC",
    desc: "The golden age of Greek philosophy. Socrates, Plato, and Aristotle defined the questions Western civilization still asks.",
    entries: [
      { id: "protagoras", yr: -490, type: "greek", name: "Protagoras", role: "First professional philosopher",
        desc: "The first philosopher to charge fees for teaching. His famous declaration that 'Man is the measure of all things' inaugurated moral relativism and made him the target of both Plato and Socrates.",
        quote: "Man is the measure of all things.", works: "Truth (lost), On the Gods (lost).",
        influences: ["Sophist movement", "Plato"] },
      { id: "sophists", yr: -450, type: "school", name: "The Sophists", role: "Professional teachers of wisdom, c. 450–380 BC",
        desc: "A movement of professional teachers who taught rhetoric, argument, and practical wisdom for political life. They argued that truth was relative and expertise was for sale. Socrates and Plato defined themselves in opposition to the Sophists.",
        quote: "", works: "Protagoras, Gorgias, Thrasymachus, Hippias, Antiphon.",
        influences: ["Socrates", "Plato"] },
      { id: "socrates", yr: -469, type: "greek", name: "Socrates", role: "The Gadfly of Athens",
        desc: "The patron saint of philosophy wrote nothing, yet transformed Western thought through relentless questioning of Athens's most powerful citizens. Tried for impiety and corrupting the youth, he refused to flee or recant — and drank the hemlock willingly at age 70.",
        quote: "The unexamined life is not worth living.", works: "None — known through Plato, Xenophon, and Aristophanes.",
        influences: ["Plato", "Xenophon", "Antisthenes", "All later philosophy"] },
      { id: "plato", yr: -428, type: "greek", name: "Plato", role: "Student of Socrates, founder of the Academy",
        desc: "Founded the Academy — the world's first university — and wrote his philosophy as dramatic dialogues. His Theory of Forms argued the physical world is a shadow of a higher realm of perfect, eternal Ideas. One of the most influential writers in human history.",
        quote: "At the touch of love, everyone becomes a poet.", works: "Republic, Symposium, Phaedo, Meno, Timaeus, Parmenides.",
        influences: ["Aristotle", "Plotinus", "Augustine", "All Western philosophy"] },
      { id: "academy", yr: -387, type: "school", name: "Plato's Academy", role: "Founded 387 BC — Athens",
        desc: "The world's first institution of higher learning, founded near the grove of Academos in Athens. It operated continuously for over 900 years — through Platonic, Skeptical, and Neoplatonic phases — until closed by Emperor Justinian in 529 AD.",
        quote: "", works: "Plato, Speusippus, Xenocrates, Arcesilaus, Carneades, Plotinus.",
        influences: ["All later philosophy", "Medieval universities"] },
      { id: "aristotle", yr: -384, type: "greek", name: "Aristotle", role: "Student of Plato, tutor to Alexander the Great",
        desc: "The most encyclopaedic mind of antiquity. He spent 20 years at Plato's Academy, then tutored the future Alexander the Great, then founded his own school — the Lyceum. He systematised logic, biology, ethics, politics, rhetoric, and physics.",
        quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", works: "Nicomachean Ethics, Politics, Poetics, Metaphysics, On the Soul, Prior Analytics.",
        influences: ["Theophrastus", "Medieval Islamic & Christian philosophy", "Modern science"] },
      { id: "diogenes", yr: -412, type: "greek", name: "Diogenes of Sinope", role: "The Cynic",
        desc: "The most radical philosopher of antiquity. He lived in a large ceramic jar in the Athens marketplace, begged for food, and told Alexander the Great to stop blocking his sunlight. His Cynicism was a philosophy of radical simplicity and freedom from all social convention.",
        quote: "I am looking for an honest man.", works: "Known only through later sources, particularly Diogenes Laërtius.",
        influences: ["Zeno of Citium", "Crates", "Stoicism"] },
      { id: "lyceum", yr: -335, type: "school", name: "The Lyceum — Peripatetic School", role: "Founded 335 BC — Athens",
        desc: "Aristotle's school in Athens, named after the sanctuary of Apollo Lykeios. The 'Peripatetic' school — named because Aristotle reportedly taught while walking — focused on systematic empirical research across every field of knowledge.",
        quote: "", works: "Aristotle, Theophrastus, Strato of Lampsacus.",
        influences: ["Medieval scholasticism", "Scientific tradition"] },
    ],
  },
  {
    title: "Hellenistic Period", years: "323 – 146 BC",
    desc: "After Alexander's conquests spread Greek culture across the world, new philosophical schools arose to answer: how do I live well in a vast, uncertain world?",
    entries: [
      { id: "death_of_alex", yr: -323, type: "event", name: "Death of Alexander the Great", role: "323 BC — Babylon",
        desc: "Alexander died in Babylon at 32, ending his world-conquering campaign. His death fragmented his empire but permanently spread Greek culture — Hellenism — from Egypt to India. This cosmopolitan, uncertain world gave birth to Stoicism and Epicureanism.",
        quote: "", works: "", influences: [] },
      { id: "pyrrho", yr: -360, type: "greek", name: "Pyrrho of Elis", role: "Founder of Skepticism",
        desc: "Returned from India transformed by encounters with Indian ascetics. He founded Pyrrhonian Skepticism — the view that certainty is impossible on any question, and that suspending judgment (epoché) leads to inner tranquility.",
        quote: "Nothing can be known — not even this.", works: "Nothing surviving — known through Timon of Phlius and Sextus Empiricus.",
        influences: ["Academic Skepticism", "Modern skepticism"] },
      { id: "epicurus", yr: -341, type: "greek", name: "Epicurus", role: "Founder of Epicureanism",
        desc: "Founded The Garden — a philosophical commune in Athens open to women and slaves. Epicurus taught that the highest good is ataraxia (tranquility of mind) and aponia (freedom from pain), achieved through simple pleasures, deep friendship, and withdrawal from political life.",
        quote: "Do not spoil what you have by desiring what you have not.", works: "Letters to Menoeceus, Principal Doctrines, On Nature (fragments).",
        influences: ["Lucretius", "Philodemus", "Enlightenment", "Modern Epicureanism"] },
      { id: "the_garden", yr: -307, type: "school", name: "The Garden — Epicurean School", role: "Founded c. 307 BC — Athens",
        desc: "Epicurus's school in Athens, set in a private garden outside the city. Uniquely radical for its time — open to women, slaves, and foreigners. Members lived communally in voluntary simplicity, focusing on friendship and philosophical discussion.",
        quote: "", works: "Epicurus, Metrodorus, Hermarchus, Philodemus.",
        influences: ["Lucretius", "Roman Epicureanism"] },
      { id: "zeno_stoic", yr: -334, type: "greek", name: "Zeno of Citium", role: "Founder of Stoicism",
        desc: "A Phoenician merchant who survived a shipwreck and arrived in Athens with nothing. He studied under the Cynics and Platonists, then founded Stoicism. His school would shape Roman civilisation for five centuries.",
        quote: "Man conquers the world by conquering himself.", works: "Republic, On Passions (fragments only).",
        influences: ["Cleanthes", "Chrysippus", "Roman Stoics"] },
      { id: "stoic_school", yr: -301, type: "school", name: "Stoic School — The Stoa", role: "Founded c. 301 BC — Athens",
        desc: "Founded by Zeno of Citium in the Stoa Poikile — the 'Painted Porch' of Athens. Stoicism taught that virtue is the only true good, the cosmos is governed by divine reason (Logos), and the wise person achieves inner freedom by mastering their response to events.",
        quote: "", works: "Zeno, Cleanthes, Chrysippus (Early Stoics) · Seneca, Epictetus, Marcus Aurelius (Roman Stoics).",
        influences: ["Roman civilization", "Christianity", "Modern Stoicism"] },
    ],
  },
  {
    title: "Roman Republic & Early Empire", years: "146 BC – 100 AD",
    desc: "Rome conquered Greece but Greek philosophy conquered Rome. Roman thinkers adapted Stoicism and Epicureanism to address the pressures of empire, political violence, and moral crisis.",
    entries: [
      { id: "roman_rise", yr: -146, type: "event", name: "Rome Conquers Greece", role: "146 BC",
        desc: "Rome's conquest of Greece brought Roman aristocrats into direct contact with Greek philosophy. This cultural collision produced a new generation of Roman-Greek thinkers who would translate and transform the Greek tradition for the Latin world.",
        quote: "", works: "", influences: [] },
      { id: "cicero", yr: -106, type: "roman", name: "Cicero", role: "Philosopher, statesman, orator",
        desc: "The greatest Latin prose stylist. Cicero translated Greek philosophy into Latin, making it accessible to the Roman world. His works on ethics, natural law, and the republic defined Western political theory for centuries. He was murdered on Mark Antony's orders in 43 BC.",
        quote: "Gratitude is not only the greatest of virtues, but the parent of all others.", works: "De Natura Deorum, Tusculan Disputations, De Republica, De Finibus.",
        influences: ["Seneca", "Renaissance humanism", "American Founding Fathers"] },
      { id: "lucretius", yr: -99, type: "roman", name: "Lucretius", role: "Epicurean poet",
        desc: "Author of De Rerum Natura — one of the greatest philosophical poems in any language. Lucretius gave Epicurean atomism its most powerful expression, arguing passionately against religious superstition and the fear of death.",
        quote: "Nothing can be created from nothing.", works: "De Rerum Natura (On the Nature of Things) — 6 books.",
        influences: ["Enlightenment science", "Modern atomism"] },
      { id: "julius_caesar", yr: -44, type: "event", name: "Assassination of Julius Caesar", role: "44 BC — Rome",
        desc: "Caesar's murder ended the Roman Republic and began decades of catastrophic civil war. The political chaos of this era deeply shaped the Stoic emphasis on inner freedom and resilience amid external uncertainty.",
        quote: "", works: "", influences: [] },
      { id: "seneca", yr: 4, type: "roman", name: "Seneca", role: "Advisor to Emperor Nero, Stoic writer",
        desc: "The most prolific surviving Stoic writer. Advisor to Emperor Nero, he wielded enormous power and ultimately faced death when Nero ordered him to take his own life — which he did with Stoic equanimity. His Letters to Lucilius are masterpieces of philosophical prose.",
        quote: "We suffer more in imagination than in reality.", works: "Letters to Lucilius, On the Shortness of Life, On Anger, On Benefits.",
        influences: ["Epictetus", "Montaigne", "Modern philosophy"] },
    ],
  },
  {
    title: "Roman Imperial Era", years: "100 – 300 AD",
    desc: "The height and decline of the Roman Empire. Stoicism reached its peak in Epictetus and Marcus Aurelius, while Neoplatonism emerged as a new synthesis.",
    entries: [
      { id: "epictetus", yr: 50, type: "roman", name: "Epictetus", role: "Born a slave, became a teacher of freedom",
        desc: "Born a slave in Hierapolis, eventually freed, and became the most influential Stoic teacher of antiquity. His philosophy centres on the radical distinction between what is 'up to us' (our thoughts, desires, responses) and what is not. He wrote nothing — his teachings were recorded by his student Arrian.",
        quote: "Make the best use of what is in your power, and take the rest as it happens.", works: "Enchiridion (Handbook), Discourses — recorded by Arrian.",
        influences: ["Marcus Aurelius", "Modern Stoicism", "Cognitive Behavioural Therapy"] },
      { id: "marcus", yr: 121, type: "roman", name: "Marcus Aurelius", role: "Emperor of Rome, Stoic philosopher",
        desc: "The last of the Five Good Emperors. He ruled the Roman Empire at its height — managing constant warfare, plague, and political crisis — while keeping a private journal of Stoic meditations, never intended for publication. The Meditations is the most intimate philosophical document of antiquity.",
        quote: "You have power over your mind, not outside events. Realize this, and you will find strength.", works: "Meditations (12 books of private philosophical notes).",
        influences: ["Modern Stoicism", "Leadership philosophy"] },
      { id: "plotinus", yr: 204, type: "roman", name: "Plotinus", role: "Founder of Neoplatonism",
        desc: "The founder of Neoplatonism — a mystical revival of Platonic philosophy. His system centres on the One: the absolute, ineffable source from which all reality emanates in descending levels. He profoundly influenced Christian theology and Augustine of Hippo.",
        quote: "Withdraw into yourself and look.", works: "Enneads (54 essays compiled by his student Porphyry).",
        influences: ["Porphyry", "Iamblichus", "Augustine", "Medieval Christian theology"] },
      { id: "porphyry", yr: 234, type: "roman", name: "Porphyry", role: "Student of Plotinus, Neoplatonist",
        desc: "Student of Plotinus and prolific commentator on Aristotle and Plato. His Isagoge introduced Aristotle's logical categories to the Latin-speaking West and dominated medieval philosophy for centuries.",
        quote: "", works: "Life of Plotinus, Isagoge, Against the Christians.",
        influences: ["Boethius", "Medieval logic"] },
    ],
  },
  {
    title: "Late Antiquity & the End of the Classical World", years: "300 – 529 AD",
    desc: "Christianity transformed the intellectual world. Classical philosophy was absorbed, challenged, and ultimately preserved — passing through Augustine and Boethius into the Middle Ages.",
    entries: [
      { id: "augustine", yr: 354, type: "roman", name: "Augustine of Hippo", role: "Bishop, Christian philosopher",
        desc: "The most influential Latin Christian thinker. A former follower of Manichaeism and Neoplatonism, Augustine synthesised classical philosophy — especially Plato and Plotinus — with Christian theology. His Confessions is the first autobiography in Western literature.",
        quote: "Our heart is restless until it repose in Thee.", works: "Confessions, The City of God, On Free Will.",
        influences: ["Medieval theology", "The Reformation", "Western Christianity"] },
      { id: "fall_rome", yr: 410, type: "event", name: "Visigoths Sack Rome", role: "410 AD — first sack in 800 years",
        desc: "In 410 AD, Visigoth forces sacked Rome for the first time in 800 years. The shock reverberated throughout the Mediterranean world. Augustine of Hippo wrote The City of God in direct response, marking the philosophical transition from Roman to Christian civilisation.",
        quote: "", works: "", influences: [] },
      { id: "boethius", yr: 477, type: "roman", name: "Boethius", role: "The last classical philosopher",
        desc: "Philosopher, mathematician, and statesman executed by Theodoric the Great on charges of treason. He wrote The Consolation of Philosophy in prison while awaiting death — the most widely read book of the Middle Ages after the Bible. His Latin translations of Aristotle preserved classical logic for medieval Europe.",
        quote: "This is my art, this the game I never cease to play.", works: "Consolation of Philosophy, translations of Aristotle's logical works.",
        influences: ["Medieval philosophy", "Dante", "Chaucer"] },
      { id: "close_academy", yr: 529, type: "event", name: "Emperor Justinian Closes the Academy", role: "529 AD — end of an era",
        desc: "Emperor Justinian's edict in 529 AD closed Plato's Academy in Athens, ending over 900 years of continuous pagan philosophical tradition. Many scholars fled to Persia, where they preserved Greek texts — setting the stage for the Islamic Golden Age.",
        quote: "", works: "", influences: [] },
    ],
  },
];

const TYPE_LABELS: Record<EntryType, string> = {
  greek: "Greek philosopher",
  roman: "Roman philosopher",
  school: "School",
  event: "Historical event",
};

const TYPE_COLORS: Record<EntryType, { dot: string; badge: string; text: string }> = {
  greek:  { dot: "#2a5a8a", badge: "rgba(42,90,138,0.1)",  text: "#2a5a8a" },
  roman:  { dot: "#7a2828", badge: "rgba(122,40,40,0.1)",  text: "#7a2828" },
  school: { dot: "#5a2a7a", badge: "rgba(90,42,122,0.1)",  text: "#5a2a7a" },
  event:  { dot: "#2a5a3a", badge: "rgba(42,90,58,0.1)",   text: "#2a5a3a" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function EntryRow({ entry, isOpen, isLast, onToggle }: {
  entry: TimelineEntry; isOpen: boolean; isLast: boolean; onToggle: () => void;
}) {
  const yr = entry.yr < 0 ? `${Math.abs(entry.yr)} BC` : `${entry.yr} AD`;
  const col = TYPE_COLORS[entry.type];

  return (
    <>
      {/* Row */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={onToggle}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
        className="flex gap-5 px-3 py-3 rounded-lg cursor-pointer transition-all duration-150 select-none"
        style={{ background: isOpen ? "#ffffff" : "transparent", borderRadius: isOpen ? "8px 8px 0 0" : "8px" }}
        onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = "#ffffff"; }}
        onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = "transparent"; }}
      >
        {/* Date */}
        <div className="shrink-0 text-right pt-0.5" style={{ width: "64px" }}>
          <span className="font-sans text-xs font-semibold" style={{ color: "#4a3a28" }}>{yr}</span>
        </div>

        {/* Dot + line */}
        <div className="shrink-0 flex flex-col items-center pt-1" style={{ width: "14px" }}>
          <div className="rounded-full shrink-0 transition-transform duration-150"
            style={{ width: "12px", height: "12px", background: col.dot, transform: isOpen ? "scale(1.3)" : "scale(1)" }} />
          {!isLast && <div className="mt-1" style={{ width: "1px", height: "32px", background: "#e8dfc8" }} />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="font-serif text-base font-medium mb-0.5" style={{ color: "#2c2418", lineHeight: 1.3 }}>
            {entry.name}
          </div>
          <div className="text-xs mb-1.5" style={{ color: "#6a5840", letterSpacing: "0.02em" }}>
            {entry.role}
          </div>
          <span className="inline-block text-xs px-2 py-0.5 rounded-full"
            style={{ background: col.badge, color: col.text, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.6rem" }}>
            {TYPE_LABELS[entry.type]}
          </span>
        </div>

        {/* Chevron */}
        <div className="shrink-0 pt-1">
          {isOpen
            ? <ChevronUp size={15} color="#b8922a" strokeWidth={1.8} />
            : <ChevronDown size={15} color="#b0a080" strokeWidth={1.8} />}
        </div>
      </div>

      {/* Expanded detail */}
      {isOpen && (
        <div className="px-3 pb-4 rounded-b-lg" style={{ background: "#ffffff", marginTop: "-1px", borderTop: "1px solid #e8dfc8", paddingLeft: "calc(0.75rem + 64px + 1.25rem + 14px)" }}>
          <p className="text-sm leading-relaxed mb-3" style={{ color: "#4a3a28" }}>{entry.desc}</p>

          {entry.quote && (
            <blockquote className="font-serif text-sm italic mb-3 pl-3 py-1.5 rounded-r"
              style={{ borderLeft: "2px solid #b8922a", background: "#f6f2eb", color: "#2c2418", lineHeight: 1.7 }}>
              "{entry.quote}"
            </blockquote>
          )}

          {entry.works && (
            <div className="mb-3">
              <div className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#b8922a", fontSize: "0.6rem" }}>Key Works</div>
              <div className="text-xs leading-relaxed" style={{ color: "#6a5840" }}>{entry.works}</div>
            </div>
          )}

          {entry.influences.length > 0 && (
            <div>
              <div className="text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: "#b8922a", fontSize: "0.6rem" }}>Influenced</div>
              <div className="flex flex-wrap gap-1.5">
                {entry.influences.map(inf => (
                  <span key={inf} className="text-xs px-2 py-0.5 rounded-full border" style={{ color: "#6a5840", borderColor: "#e8dfc8", fontSize: "0.72rem" }}>
                    {inf}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function PhilosophyTimeline({ onBack }: { onBack?: () => void }) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => setOpenId(prev => prev === id ? null : id);

  const filtered = useMemo(() =>
    ERAS.map(era => ({
      ...era,
      entries: era.entries.filter(e => filter === "all" || e.type === filter),
    })).filter(era => era.entries.length > 0),
    [filter]
  );

  const total = filtered.reduce((s, e) => s + e.entries.length, 0);

  const filters: { key: FilterType; label: string; color?: string }[] = [
    { key: "all",    label: "All" },
    { key: "greek",  label: "Greek philosophers",  color: "#2a5a8a" },
    { key: "roman",  label: "Roman philosophers",  color: "#7a2828" },
    { key: "school", label: "Schools",             color: "#5a2a7a" },
    { key: "event",  label: "Historical events",   color: "#2a5a3a" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f6f2eb", fontFamily: "'Inter', sans-serif" }}>

      {/* Page header */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid #e8dfc8", padding: "1.5rem 1.5rem 1.25rem", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8a7860", marginBottom: "0.75rem", padding: 0, display: "flex", alignItems: "center", gap: "0.3rem" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#b8922a")}
              onMouseLeave={e => (e.currentTarget.style.color = "#8a7860")}
            >
              ← Library
            </button>
          )}
          <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "clamp(1.4rem, 4vw, 1.9rem)", fontWeight: 400, color: "#2c2418", lineHeight: 1.2, marginBottom: "0.3rem" }}>
            Ancient Philosophy — <em style={{ fontStyle: "italic", color: "#b8922a" }}>A Timeline</em>
          </h1>
          <p style={{ fontSize: "0.78rem", color: "#6a5840", letterSpacing: "0.03em" }}>
            624 BC – 529 AD · From the first Greek thinkers to the fall of the classical world · Click any entry to learn more
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "1rem 1.5rem 0.5rem", display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
        <span style={{ fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a7860", marginRight: "0.25rem" }}>Show:</span>
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: "0.3rem 0.85rem",
              border: `1px solid ${filter === f.key ? "#2c2418" : "#e0d8c8"}`,
              borderRadius: "20px",
              fontSize: "0.74rem",
              cursor: "pointer",
              background: filter === f.key ? "#2c2418" : "#ffffff",
              color: filter === f.key ? "#ffffff" : "#4a3a28",
              transition: "all 0.15s",
              fontFamily: "inherit",
              letterSpacing: "0.02em",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {f.color && (
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: f.color, display: "inline-block" }} />
            )}
            {f.label}
          </button>
        ))}
        <span style={{ fontSize: "0.7rem", color: "#8a7860", marginLeft: "auto", letterSpacing: "0.06em" }}>
          {total} {total === 1 ? "entry" : "entries"}
        </span>
      </div>

      {/* Timeline */}
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0.75rem 1.5rem 5rem" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#8a7860" }}>
            <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "1.15rem", fontStyle: "italic", marginBottom: "0.35rem" }}>No entries for this filter.</p>
            <p style={{ fontSize: "0.8rem" }}>Try selecting a different category above.</p>
          </div>
        ) : (
          filtered.map(era => (
            <div key={era.title} style={{ marginBottom: "2.5rem" }}>
              {/* Era heading */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1rem", padding: "0.5rem 0", position: "sticky", top: "88px", background: "#f6f2eb", zIndex: 10 }}>
                <div style={{ width: "20px", height: "1px", background: "rgba(184,146,42,0.3)", flexShrink: 0 }} />
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", whiteSpace: "nowrap" }}>
                  <span style={{ fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#b8922a", fontWeight: 500 }}>
                    {era.title}
                  </span>
                  <span style={{ fontSize: "0.62rem", color: "#8a7860", letterSpacing: "0.08em" }}>
                    {era.years}
                  </span>
                </div>
                <div style={{ flex: 1, height: "1px", background: "rgba(184,146,42,0.2)" }} />
              </div>

              {/* Entries */}
              {era.entries.map((entry, idx) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  isOpen={openId === entry.id}
                  isLast={idx === era.entries.length - 1}
                  onToggle={() => toggle(entry.id)}
                />
              ))}
            </div>
          ))
        )}
      </div>

      {/* Legend */}
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0.85rem 1.5rem 1.5rem", display: "flex", flexWrap: "wrap", gap: "1rem", borderTop: "1px solid #e8dfc8" }}>
        {(Object.entries(TYPE_COLORS) as [EntryType, typeof TYPE_COLORS[EntryType]][]).map(([type, col]) => (
          <div key={type} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.72rem", color: "#8a7860" }}>
            <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: col.dot }} />
            {TYPE_LABELS[type]}
          </div>
        ))}
      </div>
    </div>
  );
}
