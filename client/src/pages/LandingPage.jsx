import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Bot, Sparkles, Sun, Moon } from 'lucide-react';

export default function LandingPage() {
  const { isSignedIn, signOut } = useAuth();
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nexus_theme_dark') ?? 'true'); }
    catch { return true; }
  });
  useEffect(() => { localStorage.setItem('nexus_theme_dark', JSON.stringify(isDark)); }, [isDark]);

  const handleCta = () => navigate(isSignedIn ? '/dashboard' : '/sign-in');

  /* ── Colors that flip with theme ── */
  const bg        = isDark ? '#030712' : '#f0f6ff';
  const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
  const textMuted   = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.72)';
  const navBorder   = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.08)';
  const btnBorder   = isDark ? 'rgba(255,255,255,0.1)'  : 'rgba(15,23,42,0.12)';
  const btnBg       = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)';
  const btnHoverBg  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';
  const toggleBg    = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)';

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col font-sans select-none transition-colors duration-300"
      style={{ background: bg, color: textPrimary }}>

      {/* ── Background ──────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute" style={{
          top: '-10%', left: '-5%', width: '55%', height: '55%',
          background: `radial-gradient(ellipse, ${isDark ? 'rgba(59,130,246,0.22)' : 'rgba(59,130,246,0.12)'} 0%, transparent 70%)`,
          filter: 'blur(40px)',
        }} />
        <div className="absolute" style={{
          bottom: '-15%', right: '-8%', width: '60%', height: '60%',
          background: `radial-gradient(ellipse, ${isDark ? 'rgba(139,92,246,0.18)' : 'rgba(139,92,246,0.1)'} 0%, transparent 70%)`,
          filter: 'blur(50px)',
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)'} 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }} />
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, ${bg} 100%)`,
        }} />
      </div>

      {/* ── Navbar ──────────────────────────────────────────── */}
      <header className="relative z-10 w-full px-6 md:px-10 h-[64px] flex items-center justify-between"
        style={{ borderBottom: `1px solid ${navBorder}` }}>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', boxShadow: '0 0 20px rgba(59,130,246,0.5)' }}>
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="text-[15px] font-bold tracking-tight" style={{ color: textPrimary }}>ForgeFlow AI</span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Theme toggle */}
          <button onClick={() => setIsDark(!isDark)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border transition-all cursor-pointer"
            style={{ background: toggleBg, borderColor: btnBorder, color: textMuted }}>
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isSignedIn ? (
            <>
              <button onClick={() => navigate('/dashboard')}
                className="text-[13px] font-medium transition-colors cursor-pointer"
                style={{ color: textMuted }}
                onMouseEnter={e => e.currentTarget.style.color = textPrimary}
                onMouseLeave={e => e.currentTarget.style.color = textMuted}>
                Dashboard
              </button>
              <button onClick={signOut}
                className="text-[13px] font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
                style={{ background: btnBg, border: `1px solid ${btnBorder}`, color: textMuted }}
                onMouseEnter={e => { e.currentTarget.style.background = btnHoverBg; e.currentTarget.style.color = textPrimary; }}
                onMouseLeave={e => { e.currentTarget.style.background = btnBg; e.currentTarget.style.color = textMuted; }}>
                Sign Out
              </button>
            </>
          ) : (
            <button onClick={() => navigate('/sign-in')}
              className="text-[13px] font-bold px-5 py-2 rounded-xl text-white transition-all cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#3B82F6,#6366f1)', boxShadow: '0 4px 20px rgba(59,130,246,0.4)' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 28px rgba(59,130,246,0.55)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,130,246,0.4)'}>
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center pt-12 pb-20">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
          style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.35)', boxShadow: '0 0 20px rgba(59,130,246,0.12)' }}>
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[12px] font-semibold text-blue-400 tracking-wide">
            AI-Powered Manufacturing Workflows
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-bold tracking-tight leading-tight mb-6"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', maxWidth: '900px', color: textPrimary }}>
          Manufacture Smarter
          <br />
          <span style={{
            background: 'linear-gradient(110deg, #60a5fa 0%, #818cf8 40%, #a78bfa 70%, #c084fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 24px rgba(99,102,241,0.4))',
          }}>
            with ForgeFlow AI
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-[16px] md:text-[18px] leading-relaxed mb-10 max-w-xl font-light"
          style={{ color: textMuted }}>
          Manage, track, and update precision production orders entirely through{' '}
          <span style={{ color: textPrimary }}>natural language</span>.
          Seamless NLP extraction, zero latency.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button onClick={handleCta}
            className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-[15px] font-bold text-white transition-all cursor-pointer overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #6366f1 60%, #8B5CF6 100%)',
              boxShadow: '0 8px 32px rgba(59,130,246,0.45), 0 0 0 1px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(59,130,246,0.6), 0 0 0 1px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(59,130,246,0.45), 0 0 0 1px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'none'; }}>
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span>{isSignedIn ? 'Open Dashboard' : 'Get Started Free'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button onClick={() => navigate('/sign-in')}
            className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl text-[14px] font-semibold transition-all cursor-pointer"
            style={{ background: btnBg, border: `1px solid ${btnBorder}`, color: textMuted }}
            onMouseEnter={e => { e.currentTarget.style.background = btnHoverBg; e.currentTarget.style.color = textPrimary; }}
            onMouseLeave={e => { e.currentTarget.style.background = btnBg; e.currentTarget.style.color = textMuted; }}>
            Sign In to existing account
          </button>
        </div>

        {/* Trust note */}
        <p className="mt-10 text-[11px] font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.3)' }}>
          Powered by Groq · Llama 3.3-70B · Zero hallucination extraction
        </p>
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="relative z-10 w-full px-6 h-14 flex items-center justify-center text-[11px]"
        style={{ borderTop: `1px solid ${navBorder}`, color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.3)' }}>
        © {new Date().getFullYear()} ForgeFlow AI · All rights reserved.
      </footer>
    </div>
  );
}
