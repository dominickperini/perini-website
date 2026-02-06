import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getAboutContent, getNowContent, getBlogPosts, getBlogPostByIndex } from './content/loader';
import { generateWritingPageText } from './content/generateWritingPage';

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
  .logo-title { color: #8a8a8a; font-size: 11px; filter: brightness(var(--brightness, 1)); }

  .mobile-header {
    display: none;
  }

  .nav { display: flex; flex-direction: column; gap: 4px; }

  .nav-btn {
    background: none;
    border: none;
    font: inherit;
    color: #8a8a8a;
    padding: 10px 12px;
    text-align: left;
    cursor: pointer;
    transition: all 0.1s;
    filter: brightness(var(--brightness, 1));
  }

  .nav-btn:hover { color: #aaa; background: rgba(138,138,138,0.05); }
  .nav-btn.active { color: #8f8; background: rgba(136,255,136,0.05); filter: none; }
  .nav-btn::before { content: '// '; opacity: 0.4; }
  .nav-btn.active::before { content: '>> '; opacity: 1; }

  .sidebar-footer { margin-top: auto; font-size: 10px; line-height: 1.8; padding-bottom: 60px; }
  .sidebar-footer a { display: block; color: #8a8a8a; text-decoration: none; transition: color 0.15s; filter: brightness(var(--brightness, 1)); }
  .sidebar-footer a:hover { color: #aaa; }
  .sidebar-footer .copyright { margin-top: 16px; color: #8a8a8a; filter: brightness(var(--brightness, 1)); }

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
    color: #8a8a8a;
    font-size: 11px;
    width: 100%;
    max-width: min(550px, calc(100vw - 100px));
    /* Center relative to full window by offsetting for sidebar (240px / 2 = 120px) */
    margin-left: max(0px, calc(50% - 275px - 120px));
    margin-right: auto;
  }

  .status span:not(.status-dot) {
    filter: brightness(var(--brightness, 1));
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
    width: 100%;
    max-width: min(550px, calc(100vw - 100px));
    /* Center relative to full window by offsetting for sidebar (240px / 2 = 120px) */
    margin-left: max(0px, calc(50% - 275px - 120px));
    margin-right: auto;
    text-shadow: 0 0 1px rgba(136,255,136,0.1);
  }

  .cascade-line {
    min-height: 1.55em;
    color: #8a8a8a;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    filter: brightness(var(--brightness, 1));
  }

  .cascade-line:hover { color: #999; }

  .separator {
    width: 100%;
    height: 1.55em;
    display: flex;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s ease-in;
  }

  .separator.visible {
    opacity: 1;
  }

  .separator::after {
    content: '';
    flex: 1;
    background: #3a3a3a;
    filter: brightness(var(--brightness, 1));
  }

  .separator-thick::after {
    height: 2px;
    background: linear-gradient(to bottom, #4a4a4a, #3a3a3a);
  }

  .separator-thin::after {
    height: 1px;
    background: #333;
  }

  .preview-line {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    color: #8a8a8a;
    padding-left: 7ch;
    line-height: 1.55;
    filter: brightness(var(--brightness, 1));
  }

  .preview-line:hover { color: #999; }

  .brightness-controls {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .brightness-fixed {
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 50;
  }

  .brightness-inline {
    display: none;
  }

  .brightness-buttons {
    display: flex;
    gap: 8px;
  }

  .brightness-label {
    color: #8a8a8a;
    font-size: 11px;
    filter: brightness(var(--brightness, 1));
  }

  .brightness-btn {
    background: none;
    border: 1px solid #8f8;
    color: #8f8;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    padding: 2px 8px;
    cursor: pointer;
    animation: pulse 2s ease-in-out infinite;
  }

  .brightness-btn:hover {
    background: rgba(136, 255, 136, 0.1);
  }

  @media (max-width: 768px) {
    .mfp { flex-direction: column; }
    .mobile-header {
      display: block;
      padding: 40px 24px 20px 24px;
      text-align: left;
      background: #030303;
    }
    .sidebar {
      order: 3;
      width: 100%;
      min-width: 100%;
      padding: 15px 20px;
      border-right: none;
      border-top: 1px solid #1a1a1a;
      position: fixed;
      bottom: 0;
      left: 0;
      background: #030303;
      z-index: 100;
    }
    .logo { display: none; }
    .nav {
      flex-direction: row;
      justify-content: center;
      gap: 20px;
      margin-bottom: 10px;
    }
    .nav-btn { padding: 5px 8px; }
    .sidebar-footer {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 15px;
      padding-bottom: 0;
      font-size: 10px;
    }
    .sidebar-footer a { display: inline; }
    .sidebar-footer .copyright { margin-top: 0; white-space: nowrap; }
    .main-content {
      padding: 20px;
      padding-bottom: 120px;
      order: 2;
    }
    .cascade-container {
      font-size: 11px;
      max-width: min(550px, calc(100vw - 40px));
      margin-left: auto;
      margin-right: auto;
    }
    .status {
      max-width: min(550px, calc(100vw - 40px));
      margin-left: auto;
      margin-right: auto;
    }
    .brightness-fixed {
      display: none;
    }
    .brightness-inline {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .brightness-label { margin-right: 0; }
    .brightness-buttons { flex-shrink: 0; white-space: nowrap; }
    .brightness-buttons { gap: 5px; }
  }
`;

// Character sets for the scramble effect
const glyphs = '█▓▒░╔╗╚╝╠╣╦╩╬│─┌┐└┘├┤┬┴┼▀▄▌▐■□▪▫●○◘◙◦∙·×÷±≈≠≤≥«»¬¦¡¿░▒▓';

// Scramble decode effect for a single line with optional word glitch
function ScrambleLine({ text, delay = 0, duration = 800, onComplete, glitchRange = null, glitchKey = 0 }) {
  const [display, setDisplay] = useState('');
  const [done, setDone] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const frameRef = useRef();
  const startRef = useRef();
  const glitchFrameRef = useRef();

  // Initial decode animation
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

  // Word glitch effect - wave in (250ms), full scramble (500ms), wave out (250ms)
  useEffect(() => {
    if (!glitchRange || !done) return;

    setIsGlitching(true);
    const waveInDuration = 500;
    const wordLength = glitchRange.end - glitchRange.start;
    // Full glitch duration scales with word length: 100ms for 1 char, up to 500ms max
    const fullGlitchDuration = Math.min(50 + (wordLength - 1) * 50, 500);
    const waveOutDuration = 250;
    const totalDuration = waveInDuration + fullGlitchDuration + waveOutDuration;
    const startTime = Date.now();
    let isActive = true;

    const waveWidth = 3; // How many characters are scrambled at once

    // Animate the glitch effect
    const animateGlitch = () => {
      if (!isActive) return;

      const elapsed = Date.now() - startTime;

      // If total duration has passed, restore original text
      if (elapsed >= totalDuration) {
        setDisplay(text);
        setIsGlitching(false);
        return;
      }

      const chars = text.split('');
      const output = chars.map((char, i) => {
        if (char === ' ' || char === '\n') return char;

        // Only affect characters within the glitch range
        if (i >= glitchRange.start && i < glitchRange.end) {
          const posInWord = i - glitchRange.start;

          // Phase 1: Wave in (0 - 250ms) - wave travels left to right, scrambling chars as it passes
          if (elapsed < waveInDuration) {
            const waveProgress = elapsed / waveInDuration;
            const wavePosition = waveProgress * wordLength;

            // Character has been passed by the wave - stays scrambled
            if (posInWord <= wavePosition) {
              return glyphs[Math.floor(Math.random() * glyphs.length)];
            }
            // Character is just ahead of wave - partially scrambling (creates wave front effect)
            if (posInWord <= wavePosition + waveWidth && Math.random() > 0.5) {
              return glyphs[Math.floor(Math.random() * glyphs.length)];
            }
            // Character hasn't been reached yet - show original
            return char;
          }
          // Phase 2: Full glitch (250ms - 750ms)
          else if (elapsed < waveInDuration + fullGlitchDuration) {
            // Entire word is scrambled
            if (Math.random() > 0.15) {
              return glyphs[Math.floor(Math.random() * glyphs.length)];
            }
          }
          // Phase 3: Wave out (750ms - 1000ms) - wave travels left to right, revealing chars as it passes
          else {
            const waveOutElapsed = elapsed - waveInDuration - fullGlitchDuration;
            const waveProgress = waveOutElapsed / waveOutDuration;
            const wavePosition = waveProgress * wordLength;

            // Character has been passed by the wave - show original
            if (posInWord <= wavePosition) {
              return char;
            }
            // Character is just ahead of wave - partially scrambling (creates wave front effect)
            if (posInWord <= wavePosition + waveWidth && Math.random() > 0.5) {
              return glyphs[Math.floor(Math.random() * glyphs.length)];
            }
            // Character hasn't been reached yet - stays scrambled
            return glyphs[Math.floor(Math.random() * glyphs.length)];
          }
        }
        return char;
      }).join('');

      setDisplay(output);
      glitchFrameRef.current = requestAnimationFrame(animateGlitch);
    };

    glitchFrameRef.current = requestAnimationFrame(animateGlitch);

    return () => {
      isActive = false;
      if (glitchFrameRef.current) cancelAnimationFrame(glitchFrameRef.current);
      // Always restore original text on cleanup
      setDisplay(text);
      setIsGlitching(false);
    };
  }, [glitchRange, glitchKey, done, text]);

  return <span style={{ opacity: done ? 1 : 0.9 }}>{display}</span>;
}

// Animated separator component with fade-in effect
function Separator({ type = 'thin', delay = 0 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <div className={`separator separator-${type} ${visible ? 'visible' : ''}`} />
  );
}

// Preview line component with CSS line-clamp (2 lines max, responsive to width)
function PreviewLine({ text, delay = 0, duration = 800 }) {
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
      }
    };

    timeout = setTimeout(() => {
      frameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [text, delay, duration]);

  return (
    <div className="preview-line" style={{ opacity: done ? 1 : 0.9 }}>
      {display}
    </div>
  );
}

// Multi-line cascading decode effect with separator and preview detection
function CascadeText({ lines, baseDelay = 0, stagger = 60, lineDuration = 600 }) {
  const [glitchState, setGlitchState] = useState({ lineIndex: -1, range: null, key: 0 });
  const [initialAnimDone, setInitialAnimDone] = useState(false);

  // Mark initial animation as done after all lines should have finished
  useEffect(() => {
    const totalDuration = baseDelay + lines.length * stagger + 1500;
    const timeout = setTimeout(() => setInitialAnimDone(true), totalDuration);
    return () => clearTimeout(timeout);
  }, [lines.length, baseDelay, stagger]);

  // Random glitch effect - picks a random line and word every 1-10 seconds
  useEffect(() => {
    if (!initialAnimDone) return;

    // Collect all text lines (not separators or previews)
    const textLines = lines.map((line, i) => {
      const trimmed = line.trim();
      if (/^={3,}$/.test(trimmed) || /^-{3,}$/.test(trimmed)) return null;
      if (/^\{\{preview:.+\}\}$/.test(trimmed)) return null;
      if (!line.trim()) return null;
      return { index: i, text: line };
    }).filter(Boolean);

    if (textLines.length === 0) return;

    let timeoutId;

    const scheduleGlitch = () => {
      const delay = 1000 + Math.random() * 9000; // 1-10 seconds

      timeoutId = setTimeout(() => {
        // Pick a random text line
        const randomLine = textLines[Math.floor(Math.random() * textLines.length)];

        // Find words in that line
        const words = [];
        let match;
        const wordRegex = /\S+/g;
        while ((match = wordRegex.exec(randomLine.text)) !== null) {
          if (/[a-zA-Z]/.test(match[0])) {
            words.push({ start: match.index, end: match.index + match[0].length });
          }
        }

        if (words.length > 0) {
          const randomWord = words[Math.floor(Math.random() * words.length)];
          setGlitchState(prev => ({
            lineIndex: randomLine.index,
            range: randomWord,
            key: prev.key + 1
          }));

          // Clear glitch after max duration (500ms wave in + up to 500ms full + 250ms wave out = 1250ms max)
          setTimeout(() => {
            setGlitchState(prev => ({ ...prev, lineIndex: -1, range: null }));
          }, 1250);
        }

        scheduleGlitch();
      }, delay);
    };

    scheduleGlitch();

    return () => clearTimeout(timeoutId);
  }, [initialAnimDone, lines]);

  return (
    <div className="cascade-container">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        const delay = baseDelay + i * stagger;

        // Detect thick separator (=== with at least 3 equals)
        if (/^={3,}$/.test(trimmed)) {
          return <Separator key={i} type="thick" delay={delay} />;
        }

        // Detect thin separator (--- with at least 3 dashes)
        if (/^-{3,}$/.test(trimmed)) {
          return <Separator key={i} type="thin" delay={delay} />;
        }

        // Detect preview marker {{preview:...}}
        const previewMatch = trimmed.match(/^\{\{preview:(.+)\}\}$/);
        if (previewMatch) {
          const previewText = previewMatch[1];
          return (
            <PreviewLine
              key={i}
              text={previewText}
              delay={delay}
              duration={Math.min(lineDuration + previewText.length * 2, 1200)}
            />
          );
        }

        // Regular line - pass glitch state if this line is selected
        const isGlitchLine = glitchState.lineIndex === i;
        return (
          <div key={i} className="cascade-line">
            <ScrambleLine
              text={line}
              delay={delay}
              duration={lineDuration + line.length * 2}
              glitchRange={isGlitchLine ? glitchState.range : null}
              glitchKey={isGlitchLine ? glitchState.key : 0}
            />
          </div>
        );
      })}
    </div>
  );
}

const navItems = [
  { id: 'about', label: 'ABOUT' },
  { id: 'writing', label: 'WRITING' },
  { id: 'now', label: 'NOW' },
];

/**
 * Load content for a given section
 * @param {string} section - Section name (about, writing, now, post)
 * @param {number|null} postIndex - Post index for 'post' section
 * @returns {string}
 */
function loadSectionContent(section, postIndex = null) {
  switch (section) {
    case 'about':
      return getAboutContent();
    case 'writing':
      return generateWritingPageText();
    case 'now':
      return getNowContent();
    case 'post':
      if (postIndex !== null) {
        const post = getBlogPostByIndex(postIndex);
        return post ? post.text : 'Post not found.';
      }
      return 'Post not found.';
    default:
      return '';
  }
}

export default function App() {
  const [active, setActive] = useState('about');
  const [animKey, setAnimKey] = useState(0);
  const [content, setContent] = useState('');
  const [currentPostIndex, setCurrentPostIndex] = useState(null);
  const [brightness, setBrightness] = useState(1.0); // 1.0 = default

  const adjustBrightness = (delta) => {
    setBrightness(prev => Math.max(0.2, Math.min(2.0, prev + delta)));
  };

  // Load initial content
  useEffect(() => {
    setContent(loadSectionContent('about'));
  }, []);

  const lines = useMemo(() => content.split('\n'), [content]);

  const navigate = (id, postIndex = null) => {
    if (id === active && id !== 'about' && postIndex === null) return;

    setActive(id);
    setCurrentPostIndex(postIndex);
    setContent(loadSectionContent(id, postIndex));
    setAnimKey(k => k + 1);
  };

  const handleClick = (e) => {
    // Handle clicking on blog post entries from writing page
    if (active === 'writing') {
      const text = e.target.closest('.cascade-container')?.textContent || '';

      // Match [001], [002], etc. patterns
      const match = text.match(/\[(\d{3})\]/);
      if (match) {
        const posts = getBlogPosts();
        const index = parseInt(match[1], 10) - 1;
        if (index >= 0 && index < posts.length) {
          navigate('post', index);
        }
      }
    }

    // Handle back navigation from post
    if (active === 'post' && content.includes('← BACK')) {
      const clickY = e.clientY;
      const container = e.target.closest('.main-content');
      if (container && clickY > container.getBoundingClientRect().bottom - 100) {
        navigate('writing');
      }
    }
  };

  return (
    <div className="mfp" style={{ '--brightness': brightness }}>
      <style>{styles}</style>

      <header className="mobile-header">
        <div className="logo-name">DOMINICK PERINI</div>
        <div className="logo-title">Software Engineer</div>
        <div className="logo-title">AI Researcher</div>
      </header>

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
          <a href="https://github.com/dominickperini" target="_blank" rel="noopener noreferrer">GITHUB</a>
          <a href="https://linkedin.com/in/perindom" target="_blank" rel="noopener noreferrer">LINKEDIN</a>
          <div className="copyright">© 2026</div>
          <div className="brightness-controls brightness-inline">
            <span className="brightness-label">DISPLAY INTENSITY</span>
            <div className="brightness-buttons">
              <button className="brightness-btn" onClick={() => adjustBrightness(0.1)}>[ + ]</button>
              <button className="brightness-btn" onClick={() => adjustBrightness(-0.1)}>[ - ]</button>
            </div>
          </div>
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

      <div className="brightness-controls brightness-fixed">
        <span className="brightness-label">DISPLAY INTENSITY</span>
        <div className="brightness-buttons">
          <button className="brightness-btn" onClick={() => adjustBrightness(0.1)}>[ + ]</button>
          <button className="brightness-btn" onClick={() => adjustBrightness(-0.1)}>[ - ]</button>
        </div>
      </div>
    </div>
  );
}
