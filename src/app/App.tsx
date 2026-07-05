import { useState, useEffect, useRef } from "react";
import {
  Sun, Moon, Github, Linkedin, Mail,
  ExternalLink, GraduationCap, Code2, MapPin,
  Play, Pause, Globe, Send,
} from "lucide-react";
import benPhoto from "@/imports/ben.jpg";
import bilgibasinda from "@/imports/bilgibasinda.png";
import lockedInMusic from "@/imports/LOCKED_IN_.mp3";

type Page = "profile" | "resume" | "works" | "contact";

// ─── X (Twitter) Icon ─────────────────────────────────────────────────────────

function XIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.626 5.906-5.626Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// ─── Matrix Rain Canvas ───────────────────────────────────────────────────────

function MatrixCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const CHARS = [
      "0","1","2","3","4","5","6","7","8","9",
      "A","B","C","D","E","F","G","H","I","J","K","L","M",
      "N","O","P","Q","R","S","T","U","V","W","X","Y","Z",
      "+","-","*","=","<",">",":",".","#","@","!","?","$",
    ];
    const rand = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1) + min);
    const randColor = () => `rgb(${rand(0,255)},${rand(0,255)},${rand(0,255)})`;

    const COL_W = 14, CHAR_SP = 13, FPS = 12, FLOW = 12;

    type CharObj = {
      x: number; y: number; val: string;
      textColor: string; headColor: string;
      head: boolean; alpha: number;
    };
    type StrandObj = {
      x: number; y: number;
      textColor: string; headColor: string;
      chars: CharObj[]; growing: boolean;
    };

    let strands: StrandObj[] = [];
    let columns = 0;
    let ctx: CanvasRenderingContext2D;

    function setup() {
      const parent = canvas.parentElement!;
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
      ctx = canvas.getContext("2d")!;
      columns = Math.ceil(canvas.width / COL_W);
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.font = "14px 'Share Tech Mono', monospace";
    }

    setup();

    function tick() {
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < FLOW; i++) {
        const col = rand(0, columns);
        if (!strands.some(s => s.x === col * COL_W && s.y <= canvas.height)) {
          strands.push({
            x: col * COL_W, y: CHAR_SP,
            textColor: randColor(), headColor: "#ffffff",
            chars: [], growing: true,
          });
        }
      }

      strands = strands.filter(s => {
        if (s.growing) {
          const last = s.chars[s.chars.length - 1];
          if (!last || last.y < canvas.height * 2) {
            s.chars.push({
              x: s.x, y: s.y,
              val: CHARS[rand(0, CHARS.length - 1)],
              textColor: s.textColor, headColor: s.headColor,
              head: true, alpha: 1,
            });
            s.y += CHAR_SP;
          } else {
            s.growing = false;
          }
        }

        s.chars = s.chars.filter(c => {
          if (rand(0, 100) < 5) c.val = CHARS[rand(0, CHARS.length - 1)];
          c.alpha *= 0.9;
          if (c.alpha < 0.01) return false;
          ctx.globalAlpha = c.head ? 1 : c.alpha;
          ctx.fillStyle = c.head ? c.headColor : c.textColor;
          ctx.fillText(c.val, c.x, c.y);
          if (c.head) c.head = false;
          return true;
        });

        ctx.globalAlpha = 1;
        return s.growing || s.chars.length > 0;
      });
    }

    const interval = setInterval(tick, 1000 / FPS);
    const onResize = () => { strands = []; setup(); };
    window.addEventListener("resize", onResize);
    return () => { clearInterval(interval); window.removeEventListener("resize", onResize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

// ─── Skill Bar ────────────────────────────────────────────────────────────────

function SkillBar({ name, level, isDark }: { name: string; level: number; isDark: boolean }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(level), 100);
    return () => clearTimeout(t);
  }, [level]);

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium" style={{ fontFamily: "'Fira Code', monospace" }}>{name}</span>
        <span className="text-muted-foreground text-xs">{level}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${width}%`,
            background: isDark
              ? "linear-gradient(90deg, #00cc44, #00ff88)"
              : "linear-gradient(90deg, #0d6e2f, #16a34a)",
          }}
        />
      </div>
    </div>
  );
}

// ─── Music Player ─────────────────────────────────────────────────────────────

function MusicPlayer({ isDark, musicSrc }: { isDark: boolean; musicSrc: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const accentColor = isDark ? "#00cc44" : "#0d6e2f";

  // Create audio element once
  useEffect(() => {
    const audio = new Audio(musicSrc);
    audio.loop = true;
    audioRef.current = audio;

    audio.addEventListener("ended", () => setPlaying(false));

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [musicSrc]);

  // Auto-play on first click anywhere on the page
  useEffect(() => {
    if (hasInteracted) return;

    function handleFirstClick() {
      if (!hasInteracted && audioRef.current) {
        audioRef.current.play().then(() => {
          setPlaying(true);
          setHasInteracted(true);
        }).catch(() => {
          setHasInteracted(true);
        });
      }
    }

    document.addEventListener("click", handleFirstClick, { once: true });
    return () => document.removeEventListener("click", handleFirstClick);
  }, [hasInteracted]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  }

  return (
    <div
      className="mt-6 flex items-center gap-4 rounded-xl px-5 py-3 border"
      style={{
        background: isDark ? "rgba(0,204,68,0.05)" : "rgba(13,110,47,0.04)",
        borderColor: isDark ? "rgba(0,204,68,0.2)" : "rgba(13,110,47,0.15)",
      }}
    >
      <button
        onClick={togglePlay}
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 active:scale-95"
        style={{ background: accentColor }}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing
          ? <Pause size={15} fill="black" color="black" />
          : <Play size={15} fill="black" color="black" style={{ marginLeft: 2 }} />
        }
      </button>
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-medium truncate"
          style={{ color: accentColor, fontFamily: "'Share Tech Mono', monospace" }}
        >
          {playing ? "▶ Now Playing..." : "♪ Background Track"}
        </p>
        {/* Animated bars when playing */}
        {playing && (
          <div className="flex items-end gap-0.5 mt-1" style={{ height: 12 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <span
                key={i}
                className="w-1 rounded-full inline-block"
                style={{
                  background: accentColor,
                  height: `${40 + (i % 3) * 25}%`,
                  animation: `bounce ${0.5 + i * 0.1}s ease-in-out infinite alternate`,
                  opacity: 0.8,
                }}
              />
            ))}
          </div>
        )}
        {!playing && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {hasInteracted ? "Paused" : "Click anywhere to play"}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Home / Profile Page ──────────────────────────────────────────────────────

function ProfilePage({ isDark }: { isDark: boolean }) {
  const techs = [
    "React", "React Native", "Node.js", "TypeScript", "Next.js",
    "Python", "ASP.NET Core", "C#", "PostgreSQL", "FastAPI",
    "Git", "AI / ML",
  ];

  const accentColor = isDark ? "#00cc44" : "#0d6e2f";

  // Bold words from the user's bio text — rendered as unicode bold already
  const bioText = "Recent Software Engineering graduate with strong proficiency in modern software development technologies, including 𝗥𝗲𝗰𝘁, 𝗥𝗲𝗰𝘁 𝗙𝗲𝘁𝗶𝘃𝗲, 𝗙𝗼𝗱𝗲.𝗷𝗳, 𝘃𝗼𝗲𝗦𝘄𝗶𝗶𝘁𝘂𝗳, 𝗙𝗲𝘅𝘁.𝗷𝗳, 𝘫𝙮𝙩𝙯𝙤𝙣, and 𝗔𝗦𝗣.𝗙𝗘𝘃 𝗖𝗼𝗿𝗲. With a strong interest in 𝗔𝗿𝘁𝗶𝗳𝗶𝗰𝗶𝗲𝗹 𝗙𝗲𝘁𝗲𝗹𝗹𝗶𝗴𝗲𝗰𝗲 and problem solving, I consider myself a 𝗳𝘂𝗹𝗹-𝗳𝘁𝗲𝗰𝗸 𝗳𝗼𝗳𝘁𝘄𝗲𝗿𝗲 𝗲𝗴𝗴𝗶𝗲𝗲𝗿. Eager to both contribute to impactful real-world projects and continuously expand my technical expertise.";

  return (
    <main className="max-w-5xl mx-auto px-6 py-14">
      <div className="grid md:grid-cols-5 gap-12 items-center">
        {/* Bio */}
        <div className="md:col-span-3">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-3"
            style={{ color: accentColor, fontFamily: "'Share Tech Mono', monospace" }}
          >
            &gt; Full-Stack Software Engineer
          </p>
          <h2 className="text-4xl font-bold mb-5 leading-tight">
            Hi! I am{" "}
            <span style={{ color: accentColor }}>Yunus</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8 text-sm">
            Recent Software Engineering graduate with strong proficiency in modern software
            development technologies, including{" "}
            <strong>React</strong>, <strong>React Native</strong>, <strong>Node.js</strong>,{" "}
            <strong>TypeScript</strong>, <strong>Next.js</strong>, <strong>Python</strong>,
            {" "}and <strong>ASP.NET Core</strong>. With a strong interest in{" "}
            <strong>Artificial Intelligence</strong> and problem solving, I consider myself a{" "}
            <strong>full-stack software engineer</strong>. Eager to both contribute to impactful
            real-world projects and continuously expand my technical expertise.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              className="px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all hover:scale-105"
              style={{ background: accentColor, color: isDark ? "#000" : "#fff" }}
            >
              <Mail size={15} /> Contact Me
            </button>
            <button className="px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 border border-border hover:bg-muted transition-colors">
              <ExternalLink size={15} /> View Resume
            </button>
          </div>
        </div>

        {/* Photo */}
        <div className="md:col-span-2 relative">
          <div
            className="rounded-2xl overflow-hidden border shadow-2xl"
            style={{
              borderColor: isDark ? "rgba(0,204,68,0.25)" : "rgba(13,110,47,0.2)",
              boxShadow: isDark ? "0 0 40px rgba(0,204,68,0.15)" : "0 8px 32px rgba(0,0,0,0.12)",
            }}
          >
            <img src={bilgibasinda} alt="At the workstation" className="w-full h-full object-cover" />
          </div>
          {isDark && (
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-green-500/10 to-transparent blur-2xl -z-10 pointer-events-none" />
          )}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="mt-20">
        <h3
          className="text-xs tracking-[0.3em] uppercase mb-6 text-center"
          style={{ color: accentColor, fontFamily: "'Share Tech Mono', monospace" }}
        >
          &gt; Tech Stack
        </h3>
        <div className="flex flex-wrap justify-center gap-2.5">
          {techs.map(tech => (
            <span
              key={tech}
              className="px-3.5 py-1.5 rounded-full text-xs border transition-all cursor-default hover:scale-105"
              style={{
                fontFamily: "'Fira Code', monospace",
                borderColor: isDark ? "rgba(0,204,68,0.3)" : "rgba(13,110,47,0.25)",
                background: isDark ? "rgba(0,204,68,0.05)" : "rgba(13,110,47,0.04)",
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Quote Banner */}
      <div
        className="mt-10 rounded-xl p-6 text-center border"
        style={{
          background: isDark ? "rgba(0,204,68,0.05)" : "rgba(13,110,47,0.04)",
          borderColor: isDark ? "rgba(0,204,68,0.15)" : "rgba(13,110,47,0.12)",
        }}
      >
        <p
          className="text-sm italic"
          style={{ fontFamily: "'Share Tech Mono', monospace", color: accentColor }}
        >
          "Procrastination is the worst evil enemy of humanity"
        </p>
      </div>

      {/* Music Player */}
      <MusicPlayer isDark={isDark} musicSrc={lockedInMusic} />
    </main>
  );
}

// ─── Resume Page ──────────────────────────────────────────────────────────────

function ResumePage({ isDark }: { isDark: boolean }) {
  const education = [
    {
      period: "2007 – 2015",
      level: "Primary Education",
      school: "Emlak Kredi İlköğretim Okulu",
      location: "AKSARAY",
    },
    {
      period: "2015 – 2019",
      level: "High School",
      school: "Şehit Oğuzhan Yaşar Anadolu Lisesi",
      location: "ANKARA",
    },
    {
      period: "2023 – 2026",
      level: "Bachelor's Degree",
      school: "İstinye Üniversitesi – Yazılım Mühendisliği",
      location: "İSTANBUL",
    },
    {
      period: "2024 – present",
      level: "Side Major",
      school: "İstinye University – Computer Engineering",
      location: "İSTANBUL",
    },
  ];

  const skillGroups: { label: string; items: { name: string; level: number }[] }[] = [
    {
      label: "Languages",
      items: [
        { name: "Python", level: 100 },
        { name: "C#", level: 100 },
        { name: "JavaScript / TypeScript", level: 100 },
      ],
    },
    {
      label: "Technologies",
      items: [
        { name: "ASP.NET Core", level: 100 },
        { name: "React / React Native", level: 100 },
        { name: "Node.js", level: 100 },
        { name: "PyTorch", level: 100 },
      ],
    },
    {
      label: "Database",
      items: [
        { name: "PostgreSQL", level: 100 },
      ],
    },
    {
      label: "Tools",
      items: [
        { name: "Git", level: 100 },
        { name: "GitHub", level: 100 },
        { name: "Photoshop", level: 100 },
        { name: "Maya", level: 100 },
        { name: "Blender", level: 100 },
      ],
    },
  ];

  const accentColor = isDark ? "#00cc44" : "#0d6e2f";

  return (
    <main className="max-w-5xl mx-auto px-6 py-14">
      <div className="grid md:grid-cols-2 gap-14">
        {/* Education */}
        <div>
          <h2
            className="text-xs tracking-[0.3em] uppercase mb-8 flex items-center gap-2"
            style={{ color: accentColor, fontFamily: "'Share Tech Mono', monospace" }}
          >
            <GraduationCap size={14} /> &gt; Education
          </h2>
          <div className="relative">
            <div
              className="absolute left-3 top-0 bottom-0 w-px"
              style={{ background: isDark ? "rgba(0,204,68,0.2)" : "rgba(13,110,47,0.15)" }}
            />
            {education.map((e, i) => (
              <div key={i} className="relative pl-10 pb-10">
                <div
                  className="absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: e.level === "Side Major" ? (isDark ? "#334155" : "#94a3b8") : accentColor }}
                >
                  <div className="w-2 h-2 rounded-full bg-black" />
                </div>
                <span
                  className="text-xs mb-1 block"
                  style={{ fontFamily: "'Share Tech Mono', monospace", color: accentColor }}
                >
                  {e.period}
                </span>
                <h3 className="font-semibold text-base mb-0.5">{e.level}</h3>
                <p className="text-sm text-muted-foreground">{e.school}</p>
                <p
                  className="text-xs text-muted-foreground flex items-center gap-1 mt-1"
                  style={{ fontFamily: "'Fira Code', monospace" }}
                >
                  <MapPin size={11} /> {e.location}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <h2
            className="text-xs tracking-[0.3em] uppercase mb-8 flex items-center gap-2"
            style={{ color: accentColor, fontFamily: "'Share Tech Mono', monospace" }}
          >
            <Code2 size={14} /> &gt; My Skills
          </h2>
          {skillGroups.map(group => (
            <div key={group.label} className="mb-7">
              <h3
                className="text-xs uppercase tracking-wider mb-3"
                style={{ color: "var(--muted-foreground)", fontFamily: "'Share Tech Mono', monospace" }}
              >
                {group.label}
              </h3>
              {group.items.map(s => (
                <SkillBar key={s.name} name={s.name} level={s.level} isDark={isDark} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// ─── Works Page (empty) ───────────────────────────────────────────────────────

function WorksPage({ isDark }: { isDark: boolean }) {
  const accentColor = isDark ? "#00cc44" : "#0d6e2f";
  return (
    <main className="max-w-5xl mx-auto px-6 py-14 min-h-[60vh] flex items-start justify-center">
      <p
        className="text-sm mt-8"
        style={{ color: accentColor, fontFamily: "'Share Tech Mono', monospace" }}
      >
        will be updated soon :)
      </p>
    </main>
  );
}

// ─── Contact Page ─────────────────────────────────────────────────────────────

function ContactPage({ isDark }: { isDark: boolean }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const accentColor = isDark ? "#00cc44" : "#0d6e2f";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <main className="max-w-xl mx-auto px-6 py-14">
      <p
        className="text-xs tracking-[0.3em] uppercase mb-2"
        style={{ color: accentColor, fontFamily: "'Share Tech Mono', monospace" }}
      >
        &gt; Contact
      </p>
      <h2 className="text-3xl font-bold mb-2">Get In Touch</h2>
      <p className="text-muted-foreground text-sm mb-10">
        Have a project in mind or just want to say hello? Feel free to reach out.
      </p>

      {sent ? (
        <div
          className="rounded-xl p-8 text-center border"
          style={{
            background: isDark ? "rgba(0,204,68,0.05)" : "rgba(13,110,47,0.04)",
            borderColor: isDark ? "rgba(0,204,68,0.2)" : "rgba(13,110,47,0.15)",
          }}
        >
          <p style={{ color: accentColor, fontFamily: "'Share Tech Mono', monospace" }} className="text-sm">
            &gt; Message sent successfully_
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { field: "name", label: "Name", type: "text", placeholder: "Melih Yunus" },
            { field: "email", label: "Email", type: "email", placeholder: "yunus@example.com" },
          ].map(({ field, label, type, placeholder }) => (
            <div key={field}>
              <label
                className="block text-xs tracking-wider uppercase mb-1.5"
                style={{ fontFamily: "'Share Tech Mono', monospace", color: accentColor }}
              >
                {label}
              </label>
              <input
                type={type}
                value={form[field as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none transition-colors"
                style={{
                  background: isDark ? "#161b22" : "#f8f9fc",
                  borderColor: isDark ? "rgba(48,54,61,0.9)" : "rgba(0,0,0,0.1)",
                  color: "var(--foreground)",
                }}
                onFocus={e => (e.target.style.borderColor = accentColor + "80")}
                onBlur={e => (e.target.style.borderColor = isDark ? "rgba(48,54,61,0.9)" : "rgba(0,0,0,0.1)")}
              />
            </div>
          ))}
          <div>
            <label
              className="block text-xs tracking-wider uppercase mb-1.5"
              style={{ fontFamily: "'Share Tech Mono', monospace", color: accentColor }}
            >
              Message
            </label>
            <textarea
              rows={5}
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Your message..."
              className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none resize-none transition-colors"
              style={{
                background: isDark ? "#161b22" : "#f8f9fc",
                borderColor: isDark ? "rgba(48,54,61,0.9)" : "rgba(0,0,0,0.1)",
                color: "var(--foreground)",
              }}
              onFocus={e => (e.target.style.borderColor = accentColor + "80")}
              onBlur={e => (e.target.style.borderColor = isDark ? "rgba(48,54,61,0.9)" : "rgba(0,0,0,0.1)")}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            style={{ background: accentColor, color: isDark ? "#000" : "#fff" }}
          >
            <Send size={14} /> Send Message
          </button>
        </form>
      )}

      <div className="mt-12 pt-8 border-t border-border flex justify-center gap-6">
        {[
          { icon: Github, href: "https://github.com/melihyunus", label: "GitHub" },
          { icon: Linkedin, href: "https://www.linkedin.com/in/melihyunusbulbul", label: "LinkedIn" },
          { icon: Mail, href: "#", label: "Email" },
        ].map(({ icon: Icon, href, label }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="transition-all hover:scale-110"
            style={{ color: "var(--muted-foreground)" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = accentColor)}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)")}
          >
            <Icon size={20} />
          </a>
        ))}
      </div>
    </main>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<Page>("profile");
  const [isDark, setIsDark] = useState(true);

  const navItems: { id: Page; label: string }[] = [
    { id: "profile", label: "PROFILE" },
    { id: "resume",  label: "Resume"  },
    { id: "works",   label: "Works"   },
    { id: "contact", label: "Contact" },
  ];

  const accentColor = isDark ? "#00cc44" : "#0d6e2f";

  return (
    <div className={isDark ? "dark" : ""} style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes bounce {
          from { transform: scaleY(0.5); }
          to   { transform: scaleY(1.2); }
        }
      `}</style>

      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 overflow-x-hidden">

        {/* ── Hero ── */}
        <header className="relative overflow-hidden" style={{ height: "320px" }}>
          <MatrixCanvas />

          {isDark && (
            <img
              src={bilgibasinda}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
              style={{ mixBlendMode: "screen", opacity: 0.22 }}
            />
          )}

          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent 50%, var(--background) 100%)" }}
          />

          {/* Profile photo only — no quote here */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div
              className="rounded-full p-1"
              style={{
                background: `conic-gradient(${accentColor}, #00ffaa, ${accentColor})`,
                boxShadow: `0 0 24px ${accentColor}60, 0 0 48px ${accentColor}30`,
              }}
            >
              <div className="rounded-full overflow-hidden border-2 border-black" style={{ width: 112, height: 112 }}>
                <img src={benPhoto} alt="Melih Yunus Bülbül" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* ── Navigation ── */}
        <nav
          className="sticky top-0 z-20 border-b backdrop-blur-md transition-colors duration-300"
          style={{
            background: isDark ? "rgba(8,12,16,0.92)" : "rgba(248,249,252,0.92)",
            borderColor: "var(--border)",
          }}
        >
          {/* Top row: page tabs */}
          <div className="max-w-5xl mx-auto px-4 pt-2 flex items-center gap-1 flex-wrap">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className="relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap"
                style={{
                  color: page === item.id ? accentColor : "var(--muted-foreground)",
                  background: page === item.id
                    ? isDark ? "rgba(0,204,68,0.1)" : "rgba(13,110,47,0.08)"
                    : "transparent",
                }}
              >
                {page === item.id && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: accentColor }}
                  />
                )}
                {item.label}
              </button>
            ))}
          </div>

          {/* Bottom row: social icons + toggle */}
          <div className="max-w-5xl mx-auto px-4 pb-2 flex items-center gap-3 justify-end">
            <a
              href="https://github.com/melihyunus"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="transition-colors"
              style={{ color: "var(--muted-foreground)" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = accentColor)}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)")}
            >
              <Github size={17} />
            </a>
            <a
              href="https://www.linkedin.com/in/melihyunusbulbul"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="transition-colors"
              style={{ color: "var(--muted-foreground)" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = accentColor)}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)")}
            >
              <Linkedin size={17} />
            </a>
            <span aria-label="X" className="cursor-default" style={{ color: "var(--muted-foreground)" }}>
              <XIcon size={17} />
            </span>
            <button
              onClick={() => setIsDark(d => !d)}
              aria-label="Toggle dark/light mode"
              className="p-1.5 rounded-lg border transition-all hover:scale-105"
              style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </nav>

        {/* ── Page Content ── */}
        {page === "profile" && <ProfilePage isDark={isDark} />}
        {page === "resume"  && <ResumePage isDark={isDark} />}
        {page === "works"   && <WorksPage isDark={isDark} />}
        {page === "contact" && <ContactPage isDark={isDark} />}

        {/* ── Footer ── */}
        <footer className="border-t border-border py-6 text-center">
          <p
            className="text-xs"
            style={{ color: "var(--muted-foreground)", fontFamily: "'Share Tech Mono', monospace" }}
          >
            © 2023 Melih Yunus BÜLBÜL
          </p>
        </footer>
      </div>
    </div>
  );
}
