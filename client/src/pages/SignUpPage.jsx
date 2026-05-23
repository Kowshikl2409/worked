import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SignUp } from '@clerk/clerk-react';
import { Bot, ArrowLeft, Sparkles, Sun, Moon } from 'lucide-react';

export default function SignUpPage() {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nexus_theme_dark') ?? 'true'); }
    catch { return true; }
  });
  useEffect(() => { localStorage.setItem('nexus_theme_dark', JSON.stringify(isDark)); }, [isDark]);

  React.useEffect(() => {
    if (isSignedIn) navigate('/');
  }, [isSignedIn, navigate]);

  const bg          = isDark ? '#030712' : '#f0f6ff';
  const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
  const textMuted   = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.68)';
  const toggleBg    = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)';
  const toggleBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)';

  const clerkVars = isDark
    ? {
        colorPrimary:         '#3B82F6',
        colorBackground:      '#0a1020',
        colorInputBackground: '#111827',
        colorInputText:       '#f3f4f6',
        colorText:            '#f3f4f6',
        colorTextSecondary:   '#94a3b8',
        colorBorder:          '#1e2d4a',
        borderRadius:         '14px',
        fontFamily:           "'DM Sans', 'Inter', sans-serif",
      }
    : {
        colorPrimary:         '#3B82F6',
        colorBackground:      '#ffffff',
        colorInputBackground: '#f8fafc',
        colorInputText:       '#0f172a',
        colorText:            '#0f172a',
        colorTextSecondary:   '#64748b',
        colorBorder:          '#e2e8f0',
        borderRadius:         '14px',
        fontFamily:           "'DM Sans', 'Inter', sans-serif",
      };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-6 font-sans select-none transition-colors duration-300"
      style={{ background: bg, color: textPrimary }}>

      {/* ── Background ─────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute" style={{
          top: '-15%', left: '-10%', width: '60%', height: '60%',
          background: `radial-gradient(ellipse, ${isDark ? 'rgba(59,130,246,0.22)' : 'rgba(59,130,246,0.1)'} 0%, transparent 70%)`,
          filter: 'blur(50px)',
        }} />
        <div className="absolute" style={{
          bottom: '-15%', right: '-10%', width: '65%', height: '65%',
          background: `radial-gradient(ellipse, ${isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.08)'} 0%, transparent 70%)`,
          filter: 'blur(55px)',
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)'} 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }} />
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse 90% 90% at 50% 50%, transparent 35%, ${bg} 100%)`,
        }} />
      </div>

      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
        <button onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-[13px] font-medium transition-all cursor-pointer"
          style={{ color: textMuted }}
          onMouseEnter={e => e.currentTarget.style.color = textPrimary}
          onMouseLeave={e => e.currentTarget.style.color = textMuted}>
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
        <button onClick={() => setIsDark(!isDark)}
          className="w-9 h-9 flex items-center justify-center rounded-xl border transition-all cursor-pointer"
          style={{ background: toggleBg, borderColor: toggleBorder, color: textMuted }}>
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Brand ──────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center mb-7">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', boxShadow: '0 0 28px rgba(59,130,246,0.55)' }}>
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="text-[18px] font-bold tracking-tight" style={{ color: textPrimary }}>ForgeFlow AI</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
          style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}>
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span className="text-[11px] font-semibold text-blue-400">Create Your Account</span>
        </div>
      </div>

      {/* ── Clerk card ─────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-[420px]">
        {isDark && (
          <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))',
            filter: 'blur(20px)', transform: 'scale(1.05)',
          }} />
        )}

        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          forceRedirectUrl="/"
          appearance={{
            layout: {
              socialButtonsVariant: 'blockButton',
              socialButtonsPlacement: 'top',
            },
            variables: clerkVars,
            elements: {
              rootBox: 'w-full',
              card:    'shadow-none border-0 !bg-transparent',
              cardBox: {
                background:     isDark ? 'rgba(10,16,30,0.88)' : 'rgba(255,255,255,0.95)',
                border:         isDark ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(99,102,241,0.18)',
                borderRadius:   '20px',
                backdropFilter: 'blur(24px)',
                boxShadow:      isDark
                  ? '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.08)'
                  : '0 24px 60px rgba(99,102,241,0.1), 0 0 0 1px rgba(99,102,241,0.08)',
              },
              headerTitle:    { fontWeight: '700', fontSize: '22px' },
              headerSubtitle: { fontWeight: '300', color: isDark ? '#94a3b8' : '#64748b' },

              socialButtonsBlockButton__google: {
                background:   isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                border:       isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid #e2e8f0',
                borderRadius: '12px',
                color:        isDark ? '#f3f4f6' : '#0f172a',
                fontWeight:   '600',
                fontSize:     '13px',
                padding:      '10px 16px',
                transition:   'all 0.2s',
              },
              socialButtonsBlockButton__apple: {
                background:   '#fff',
                border:       '1px solid rgba(0,0,0,0.12)',
                borderRadius: '12px',
                color:        '#000000',
                fontWeight:   '600',
                fontSize:     '13px',
                padding:      '10px 16px',
                transition:   'all 0.2s',
              },
              socialButtonsBlockButton__microsoft: {
                background:   isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                border:       isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid #e2e8f0',
                borderRadius: '12px',
                color:        isDark ? '#f3f4f6' : '#0f172a',
                fontWeight:   '600',
                fontSize:     '13px',
                padding:      '10px 16px',
                transition:   'all 0.2s',
              },
              formButtonPrimary: {
                background:   'linear-gradient(135deg,#3B82F6,#6366f1)',
                boxShadow:    '0 4px 16px rgba(59,130,246,0.35)',
                borderRadius: '12px',
                fontWeight:   '700',
                fontSize:     '14px',
              },
              formFieldInput: {
                background:   isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                border:       isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                borderRadius: '12px',
                color:        isDark ? '#f3f4f6' : '#0f172a',
              },
              footerActionText: { color: isDark ? '#64748b' : '#94a3b8' },
              footerActionLink: { color: '#3B82F6', fontWeight: '600' },
              dividerLine:      { background: isDark ? '#1e293b' : '#e2e8f0' },
              dividerText:      { color: isDark ? '#475569' : '#94a3b8' },
            }
          }}
        />
      </div>

      <p className="relative z-10 mt-6 text-[11px]"
        style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.3)' }}>
        Secured by Clerk · © {new Date().getFullYear()} ForgeFlow AI
      </p>
    </div>
  );
}
