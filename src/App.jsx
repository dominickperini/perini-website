import React, { useState, useEffect, useRef, useMemo } from 'react';

// Embedded styles
const styles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body { background: #050505; overflow-x: hidden; }

  .mfp {
    min-height: 100vh;
    background: #050505;
    color: #7a7a7a;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    line-height: 1.5;
    -webkit-font-smoothing: none;
    -moz-osx-font-smoothing: grayscale;
    display: flex;
    position: relative;
    overflow: hidden;
  }

  .mfp::before {
    content: '';
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 2px);
    pointer-events: none;
    z-index: 100;
  }

  .mfp::after {
    content: '';
    position: fixed;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 100%);
    pointer-events: none;
    z-index: 99;
    animation: flicker 0.15s infinite;
  }

  @keyframes flicker {
    0%, 100% { opacity: 0.97; }
    50% { opacity: 1; }
  }

  .sidebar {
    width: 240px;
    min-width: 240px;
    border-right: 1px solid #1a1a1a;
    padding: 40px 24px;
    display: flex;
    flex-direction: column;
    background: #030303;
  }

  .logo { margin-bottom: 50px; }
  .logo-name { color: #8f8; font-size: 12px; letter-spacing: 2px; margin-bottom: 8px; }
  .logo-title { color: #444; font-size: 11px; }

  .nav { display: flex; flex-direction: column; gap: 4px; }

  .nav-btn {
    background: none;
    border: none;
    font: inherit;
    color: #555;
    padding: 10px 12px;
    text-align: left;
    cursor: pointer;
    transition: all 0.1s;
  }

  .nav-btn:hover { color: #8f8; background: rgba(136,255,136,0.03); }
  .nav-btn.active { color: #8f8; background: rgba(136,255,136,0.05); }
  .nav-btn::before { content: '// '; opacity: 0.4; }
  .nav-btn.active::before { content: '>> '; opacity: 1; }

  .sidebar-footer { margin-top: auto; font-size: 10px; line-height: 1.8; }
  .sidebar-footer a { display: block; color: #333; text-decoration: none; transition: color 0.15s; }
  .sidebar-footer a:hover { color: #8f8; }
  .sidebar-footer .copyright { margin-top: 16px; color: #222; }

  .main-content {
    flex: 1;
    padding: 40px 50px;
    overflow-y: auto;
    max-height: 100vh;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #111;
    color: #333;
    font-size: 11px;
  }

  .status-dot {
    width: 5px;
    height: 5px;
    background: #4a4;
    border-radius: 50%;
    box-shadow: 0 0 6px #4a4;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }

  .cascade-container {
    font-size: 13px;
    line-height: 1.55;
    max-width: 550px;
    text-shadow: 0 0 1px rgba(136,255,136,0.1);
  }

  .cascade-line {
    min-height: 1.55em;
    color: #8a8a8a;
    white-space: pre;
  }

  .cascade-line:hover { color: #999; }

  @media (max-width: 768px) {
    .mfp { flex-direction: column; }
    .sidebar { width: 100%; min-width: 100%; padding: 20px; border-right: none; border-bottom: 1px solid #1a1a1a; }
    .nav { flex-direction: row; flex-wrap: wrap; }
    .main-content { padding: 20px; }
    .cascade-container { font-size: 11px; }
  }
`;

// Character sets for the scramble effect
const glyphs = '█▓▒░╔╗╚╝╠╣╦╩╬│─┌┐└┘├┤┬┴┼▀▄▌▐■□▪▫●○◘◙◦∙·×÷±≈≠≤≥«»¬¦¡¿░▒▓';

// Scramble decode effect for a single line
function ScrambleLine({ text, delay = 0, duration = 800, onComplete }) {
  const [display, setDisplay] = useState('');
  const [done, setDone] = useState(false);
  const frameRef = useRef();
  const startRef = useRef();

  useEffect(() => {
    let timeout;
    const chars = text.split('');
    const len = chars.length;

    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);

      const resolved = Math.floor(progress * len);

      const output = chars.map((char, i) => {
        if (char === ' ' || char === '\n') return char;
        if (i < resolved) return char;
        if (i < resolved + 8 && Math.random() > 0.3) {
          return glyphs[Math.floor(Math.random() * glyphs.length)];
        }
        return ' ';
      }).join('');

      setDisplay(output);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(text);
        setDone(true);
        if (onComplete) onComplete();
      }
    };

    timeout = setTimeout(() => {
      frameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [text, delay, duration, onComplete]);

  return <span style={{ opacity: done ? 1 : 0.9 }}>{display}</span>;
}

// Multi-line cascading decode effect
function CascadeText({ lines, baseDelay = 0, stagger = 60, lineDuration = 600 }) {
  return (
    <div className="cascade-container">
      {lines.map((line, i) => (
        <div key={i} className="cascade-line">
          <ScrambleLine
            text={line}
            delay={baseDelay + i * stagger}
            duration={lineDuration + line.length * 2}
          />
        </div>
      ))}
    </div>
  );
}

// Content data
const sections = {
  about: `
DOMINICK PERINI
═══════════════════════════════════════════════

Software Engineer & AI Researcher
Formerly Northrop Grumman

───────────────────────────────────────────────

Building intelligent systems that operate at the
intersection of machine learning and critical
infrastructure. Previously developed autonomous
systems and ML pipelines for defense applications
requiring the highest reliability standards.

Current focus: Large language models, systems
engineering, and the challenge of deploying AI
that is verifiable, interpretable, and aligned
with human intent.

I write about distributed systems, ML infrastructure,
and engineering challenges of AI at scale.

───────────────────────────────────────────────

 ◦ dominick@example.com
 ◦ github.com/dperini
 ◦ linkedin.com/in/dominickperini

───────────────────────────────────────────────
`.trim(),

  writing: `
WRITING
═══════════════════════════════════════════════

Recent transmissions from the terminal.

───────────────────────────────────────────────

[001]  2025.01.20
       On Building Trustworthy AI Systems
       
       The gap between "works in the lab" and
       "works in production" is measured in
       sleepless nights.

───────────────────────────────────────────────

[002]  2025.01.08
       Distributed Training at Scale
       
       Lessons from coordinating GPU clusters.
       The network is always the bottleneck,
       until it isn't.

───────────────────────────────────────────────

[003]  2024.12.15
       The Case for Boring Infrastructure
       
       Why I stopped chasing new tools and
       learned to love PostgreSQL.

───────────────────────────────────────────────

[004]  2024.11.28
       Leaving Defense Tech
       
       Reflections on five years building
       systems that matter.

───────────────────────────────────────────────
`.trim(),

  post: `
ON BUILDING TRUSTWORTHY AI SYSTEMS
═══════════════════════════════════════════════
2025.01.20

───────────────────────────────────────────────

The gap between a model that performs well on
benchmarks and one you can deploy with confidence
is vast. I spent two years learning this.

At Northrop, we had a saying:

    "Demo magic isn't production magic."

A system that impresses in controlled conditions
will find creative ways to fail when facing
real-world data, adversarial inputs, and edge
cases no one anticipated.


THE VERIFICATION PROBLEM
───────────────────────────────────────────────

Traditional software: you write tests, prove
properties, trace execution paths.

Neural networks: you deploy a function you don't
fully understand, trained on data you can't fully
audit, making decisions you can't fully explain.

This isn't an argument against deploying AI.
It's an argument for humility.


    ┌─────────────────────────────────────────┐
    │  "All models are wrong, some useful."   │
    │                         — George Box    │
    │                                         │
    │  "All models are wrong, and some will   │
    │   fail at 3 AM on a holiday weekend."   │
    │                         — Everyone      │
    └─────────────────────────────────────────┘


WHAT ACTUALLY WORKS
───────────────────────────────────────────────

After numerous incidents and post-mortems:

  ► Confidence calibration
    If your model says 90% sure, it should be
    right 90% of the time. Most aren't.

  ► Anomaly detection on inputs
    Know when you're seeing data unlike your
    training distribution.

  ► Human-in-the-loop for high stakes
    Not as a crutch. As a circuit breaker.

  ► Extensive logging
    You can't debug what you didn't record.


───────────────────────────────────────────────

We're building tools, not oracles.

← BACK TO WRITING
`.trim(),

  now: `
NOW
═══════════════════════════════════════════════
Updated January 2025

What I'm currently focused on.

───────────────────────────────────────────────

WORK

 ◦ Building evaluation frameworks for LLMs
 ◦ Contributing to open-source ML infrastructure
 ◦ Distributed training & inference optimization

LEARNING

 ◦ Mechanistic interpretability
 ◦ Re-reading the classics:
   "A Philosophy of Software Design"
   "Designing Data-Intensive Applications"

OUTSIDE THE TERMINAL

 ◦ Training for a half marathon
 ◦ Working through coffee backlog
 ◦ Trying to read more fiction

───────────────────────────────────────────────

This is a "now page"
nownownow.com
`.trim()
};

const navItems = [
  { id: 'about', label: 'ABOUT' },
  { id: 'writing', label: 'WRITING' },
  { id: 'now', label: 'NOW' },
];

export default function App() {
  const [active, setActive] = useState('about');
  const [animKey, setAnimKey] = useState(0);
  const [content, setContent] = useState(sections.about);

  const lines = useMemo(() => content.split('\n'), [content]);

  const navigate = (id) => {
    if (id === active && id !== 'about') return;
    setActive(id);
    setContent(sections[id]);
    setAnimKey(k => k + 1);
  };

  const goToPost = () => {
    setActive('post');
    setContent(sections.post);
    setAnimKey(k => k + 1);
  };

  const handleClick = (e) => {
    if (active === 'writing') {
      const text = e.target.closest('.cascade-container')?.textContent || '';
      if (text.includes('[001]')) goToPost();
    }
    if (active === 'post' && content.includes('← BACK')) {
      const clickY = e.clientY;
      const container = e.target.closest('.main-content');
      if (container && clickY > container.getBoundingClientRect().bottom - 100) {
        navigate('writing');
      }
    }
  };

  return (
    <div className="mfp">
      <style>{styles}</style>
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-name">DOMINICK PERINI</div>
          <div className="logo-title">Software Engineer</div>
          <div className="logo-title">AI Researcher</div>
        </div>

        <nav className="nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-btn ${active === item.id ? 'active' : ''}`}
              onClick={() => navigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a href="https://github.com/dperini" target="_blank" rel="noopener noreferrer">GITHUB</a>
          <a href="https://linkedin.com/in/dominickperini" target="_blank" rel="noopener noreferrer">LINKEDIN</a>
          <div className="copyright">© 2025</div>
        </div>
      </aside>

      <main className="main-content" onClick={handleClick}>
        <div className="status">
          <span className="status-dot"></span>
          <span>STREAM ACTIVE</span>
        </div>

        <div key={animKey}>
          <CascadeText
            lines={lines}
            baseDelay={50}
            stagger={35}
            lineDuration={400}
          />
        </div>
      </main>
    </div>
  );
}
