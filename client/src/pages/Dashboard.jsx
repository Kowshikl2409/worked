import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Send, Search, SlidersHorizontal, Bell, Calendar, Clock,
  CheckCircle2, Trash2, Pencil, X, MessageSquare, Database,
  ClipboardList, LogOut, RefreshCw, PanelLeftClose, PanelLeftOpen,
  Sparkles, Package, ChevronRight, Sun, Moon
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Thin helper: inline hover via onMouse events (avoids
   having to define dozens of Tailwind hover: classes for
   CSS-var–based colors that Tailwind can't see at build time)
───────────────────────────────────────────────────────────── */

function hoverBtn(hoverBg = 'rgba(255,255,255,0.05)', hoverColor = 'var(--c-text)') {
  return {
    onMouseEnter: e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = hoverColor; },
    onMouseLeave: e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-muted)'; },
  };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Dashboard() {
  const { user, signOut } = useAuth();

  /* ── Theme ────────────────────────────────────────────────── */
  const [isDark, setIsDark] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nexus_theme_dark') ?? 'true'); }
    catch { return true; }
  });
  useEffect(() => { localStorage.setItem('nexus_theme_dark', JSON.stringify(isDark)); }, [isDark]);
  const theme = isDark ? 'dark' : 'light';

  /* ── Sidebar (desktop) ────────────────────────────────────── */
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nexus_sidebar_open') ?? 'true'); }
    catch { return true; }
  });
  useEffect(() => { localStorage.setItem('nexus_sidebar_open', JSON.stringify(sidebarOpen)); }, [sidebarOpen]);

  /* ── Navigation ───────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  /* ── Orders & Filters ─────────────────────────────────────── */
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  /* ── Modals ───────────────────────────────────────────────── */
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  /* ── Edit form ────────────────────────────────────────────── */
  const [editPartName, setEditPartName] = useState('');
  const [editMaterial, setEditMaterial] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editDimensions, setEditDimensions] = useState('');
  const [editStatus, setEditStatus] = useState('Received');
  const [newQualityNoteText, setNewQualityNoteText] = useState('');

  /* ── Chat ─────────────────────────────────────────────────── */
  const [chatMessages, setChatMessages] = useState([{
    sender: 'assistant',
    text: "Hello! I'm your AI manufacturing assistant. Create orders, update statuses, or log quality inspections — just ask.",
    timestamp: new Date().toISOString()
  }]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  /* ── Rotating chat placeholder ───────────────────────────── */
  const CHAT_EXAMPLES = [
    'Create order: 50 titanium flanges by June 30…',
    'Update order #3 status to Accepted…',
    'Add quality note to order #5: passed inspection…',
    'Show all orders in review…',
    'Delete order #2…',
  ];
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPlaceholderIdx(i => (i + 1) % CHAT_EXAMPLES.length), 3000);
    return () => clearInterval(t);
  }, []);

  /* ── Notifications ────────────────────────────────────────── */
  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nexus_notifications')) || []; }
    catch { return []; }
  });
  const [bellOpen, setBellOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const chatEndRef = useRef(null);

  /* ── Effects ──────────────────────────────────────────────── */
  useEffect(() => { localStorage.setItem('nexus_notifications', JSON.stringify(notifications)); }, [notifications]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`);
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch { setOrders(JSON.parse(localStorage.getItem('orders')) || []); }
    finally { setLoadingOrders(false); }
  };
  useEffect(() => { fetchOrders(); }, []);
  useEffect(() => { if (orders.length > 0) localStorage.setItem('orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages, chatLoading]);

  /* ── Helpers ──────────────────────────────────────────────── */
  const pushNotification = (actionSummary, orderReference) => {
    setNotifications(prev => [{
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      actionSummary, orderReference, timestamp: new Date().toISOString()
    }, ...prev]);
  };
  const removeNotification = (id, e) => { if (e) e.stopPropagation(); setNotifications(prev => prev.filter(n => n.id !== id)); };
  const clearAllNotifications = () => setNotifications([]);

  /* ── Chat send ────────────────────────────────────────────── */
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;
    const userMsg = inputMessage;
    setInputMessage('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, timestamp: new Date().toISOString() }]);
    setChatLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        const { intent, order_id } = data.extraction;
        if (intent === 'create_order' && data.affectedOrder)
          pushNotification(`Order #${data.affectedOrder.id} created successfully`, `Order #${data.affectedOrder.id}`);
        else if (intent === 'update_status' && data.affectedOrder) {
          pushNotification(`Order #${order_id} status → ${data.affectedOrder.status}`, `Order #${order_id}`);
          if (selectedOrder?.id === order_id) setSelectedOrder(data.affectedOrder);
        } else if (intent === 'quality_update') {
          pushNotification(`Quality note added to Order #${order_id}`, `Order #${order_id}`);
          if (selectedOrder?.id === order_id) { const u = data.orders.find(o => o.id === order_id); if (u) setSelectedOrder(u); }
        } else if (intent === 'edit_order') {
          pushNotification(`Order #${order_id} edited`, `Order #${order_id}`);
          if (selectedOrder?.id === order_id) { const u = data.orders.find(o => o.id === order_id); if (u) { setSelectedOrder(u); setEditPartName(u.part_name || ''); setEditMaterial(u.material || ''); setEditQuantity(u.quantity || ''); setEditDeadline(u.deadline || ''); setEditDimensions(u.dimensions || ''); setEditStatus(u.status || 'Received'); } }
        } else if (intent === 'delete_order') setDeleteConfirmId(order_id);
        if (intent === 'query_orders') { setStatusFilter(data.extraction.status_filter || 'All'); setActiveTab('dashboard'); }
        setChatMessages(prev => [...prev, { sender: 'assistant', text: data.message, timestamp: new Date().toISOString() }]);
      } else {
        setChatMessages(prev => [...prev, { sender: 'assistant', text: data.error || 'Failed to process.', timestamp: new Date().toISOString() }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { sender: 'assistant', text: 'Connection failed. Is the backend running?', timestamp: new Date().toISOString() }]);
    } finally { setChatLoading(false); }
  };

  /* ── Modal helpers ────────────────────────────────────────── */
  const openDetailsModal = (order) => {
    setSelectedOrder(order); setIsEditMode(false); setNewQualityNoteText('');
    setEditPartName(order.part_name || ''); setEditMaterial(order.material || '');
    setEditQuantity(order.quantity || ''); setEditDeadline(order.deadline || '');
    setEditDimensions(order.dimensions || ''); setEditStatus(order.status || 'Received');
  };

  const handleSaveEdit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedOrder) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${selectedOrder.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ part_name: editPartName || null, material: editMaterial || null, quantity: editQuantity ? parseInt(editQuantity, 10) : null, deadline: editDeadline || null, dimensions: editDimensions || null, status: editStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        pushNotification(`Order #${selectedOrder.id} edited`, `Order #${selectedOrder.id}`);
        const u = data.orders.find(o => o.id === selectedOrder.id);
        if (u) openDetailsModal(u);
        setIsEditMode(false);
      }
    } catch { console.error('Failed to edit order'); }
  };

  const handleAddQualityNoteFromModal = async (e) => {
    if (e) e.preventDefault();
    if (!selectedOrder || !newQualityNoteText.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${selectedOrder.id}/quality`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quality_note: newQualityNoteText })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        pushNotification(`Quality note added to Order #${selectedOrder.id}`, `Order #${selectedOrder.id}`);
        const u = data.orders.find(o => o.id === selectedOrder.id);
        if (u) setSelectedOrder(u);
        setNewQualityNoteText('');
      }
    } catch { console.error('Failed to add quality log'); }
  };

  const handleDeleteOrder = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        pushNotification(`Order #${id} deleted`, `Order #${id}`);
        setSelectedOrder(null); setDeleteConfirmId(null);
      }
    } catch { console.error('Failed to delete order'); }
  };

  /* ── Filter ───────────────────────────────────────────────── */
  const filteredOrders = orders.filter(order => {
    const q = searchQuery.toLowerCase();
    const ms = (order.part_name?.toLowerCase().includes(q)) || (order.material?.toLowerCase().includes(q)) || order.id.toString() === searchQuery.trim();
    const mf = statusFilter === 'All' || order.status?.toLowerCase() === statusFilter.toLowerCase();
    return ms && mf;
  });

  /* ── Status meta ──────────────────────────────────────────── */
  const statusMeta = (s) => {
    switch ((s || '').toLowerCase()) {
      case 'accepted': return { cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 badge-accepted', dot: 'bg-emerald-400' };
      case 'in review': return { cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20 badge-review', dot: 'bg-amber-400' };
      default: return { cls: 'text-slate-400 bg-slate-400/10 border-slate-400/20', dot: 'bg-slate-500' };
    }
  };

  /* ── Desktop nav items ────────────────────────────────────── */
  const navItems = [
    { id: 'dashboard', label: 'Workspace', icon: MessageSquare },
    { id: 'database', label: 'Orders Database', icon: Database },
    { id: 'quality', label: 'Quality Logs', icon: ClipboardList },
  ];

  /* ── Mobile bottom-nav active state ──────────────────────── */
  const mobileActiveId = (() => {
    if (activeTab === 'dashboard' && mobileChatOpen) return 'chat';
    if (activeTab === 'dashboard' && !mobileChatOpen) return 'orders';
    return activeTab;
  })();

  /* ─────────────────────────────────────────────────────────
     STATUS UPDATE helper (shared by status-dropdown + mobile)
  ───────────────────────────────────────────────────────── */
  const applyStatusChange = async (orderId, st) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: st })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        pushNotification(`Order #${orderId} → ${st}`, `Order #${orderId}`);
        const u = data.orders.find(o => o.id === orderId);
        if (u) setSelectedOrder(u);
      }
    } catch { console.error('Status update failed'); }
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */
  return (
    <div className={`${theme} flex flex-col select-none font-sans bg-glow overflow-hidden`}
      style={{ height: '100dvh', background: 'var(--c-bg)', color: 'var(--c-text)' }}>

      {/* ─────────────────── NAVBAR ─────────────────────────── */}
      <header className="h-[54px] md:h-[60px] px-3 md:px-5 flex items-center justify-between z-20 flex-shrink-0 border-b"
        style={{ background: 'var(--c-surface)', backdropFilter: 'blur(20px)', borderColor: 'var(--c-border)' }}>

        {/* Brand */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Sidebar toggle – desktop only */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg transition-all cursor-pointer"
            style={{ color: 'var(--c-muted)' }} {...hoverBtn()}>
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2 md:gap-2.5">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', boxShadow: '0 0 16px rgba(59,130,246,0.35)' }}>
              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
            </div>
            <div>
              <p className="text-[12px] md:text-[13px] font-bold tracking-tight leading-none" style={{ color: 'var(--c-text)' }}>ForgeFlow AI</p>
              <p className="hidden sm:block text-[9px] uppercase tracking-[0.12em] leading-none mt-0.5" style={{ color: 'var(--c-muted)' }}>Manufacturing Platform</p>
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 md:gap-3">

          {/* Theme toggle */}
          <button onClick={() => setIsDark(!isDark)}
            className="w-8 h-8 flex items-center justify-center rounded-xl border transition-all cursor-pointer"
            style={{ borderColor: 'var(--c-border)', color: 'var(--c-muted)' }}
            title={isDark ? 'Light mode' : 'Dark mode'}
            {...hoverBtn()}>
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Bell */}
          <div className="relative">
            <button onClick={() => setBellOpen(!bellOpen)}
              className="relative w-8 h-8 flex items-center justify-center rounded-xl border transition-all cursor-pointer"
              style={bellOpen
                ? { background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.3)', color: '#60a5fa' }
                : { borderColor: 'var(--c-border)', color: 'var(--c-muted)' }}>
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
            </button>

            <AnimatePresence>
              {bellOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setBellOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-[300px] md:w-[340px] z-40 rounded-2xl overflow-hidden"
                    style={{ background: 'var(--c-notif)', backdropFilter: 'blur(24px)', border: '1px solid var(--c-border)', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
                    <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b" style={{ borderColor: 'var(--c-border-s)' }}>
                      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--c-muted)' }}>
                        Notifications
                        {notifications.length > 0 && <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-[10px]">{notifications.length}</span>}
                      </span>
                      {notifications.length > 0 && (
                        <button onClick={clearAllNotifications} className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold transition-colors cursor-pointer">Clear all</button>
                      )}
                    </div>
                    <div className="max-h-[360px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center">
                          <Bell className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--c-border)' }} />
                          <p className="text-xs italic" style={{ color: 'var(--c-dimmed)' }}>No notifications yet.</p>
                        </div>
                      ) : notifications.map(n => (
                        <div key={n.id} className="px-4 py-3 flex items-start gap-3 border-b group transition-colors cursor-default"
                          style={{ borderColor: 'var(--c-border-s)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.03)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium leading-snug" style={{ color: 'var(--c-text)' }}>{n.actionSummary}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] font-mono bg-blue-500/10 border border-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">{n.orderReference}</span>
                              <span className="text-[10px]" style={{ color: 'var(--c-dimmed)' }}>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                          <button onClick={(e) => removeNotification(n.id, e)}
                            className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all p-0.5 rounded mt-0.5 cursor-pointer"
                            style={{ color: 'var(--c-muted)' }}>
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="w-px h-4" style={{ background: 'var(--c-border)' }} />

          {/* User avatar */}
          <div className="flex items-center gap-2 md:gap-2.5">
            <div className="text-right hidden lg:block">
              <p className="text-[12px] font-semibold leading-none" style={{ color: 'var(--c-text)' }}>{user?.fullName || 'Operator'}</p>
              <p className="text-[9px] leading-none mt-0.5" style={{ color: 'var(--c-muted)' }}>Manufacturing Admin</p>
            </div>
            <button onClick={() => signOut()}
              className="w-8 h-8 rounded-xl border overflow-hidden transition-all cursor-pointer"
              style={{ background: 'var(--c-card)', borderColor: 'var(--c-border)' }}
              title="Sign out">
              <img src={user?.imageUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=64&h=64&fit=crop'} alt="Profile" className="w-full h-full object-cover" />
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────── BODY ────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Sidebar (desktop only) ─────────────────────────── */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }} animate={{ width: 230, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="hidden md:flex flex-shrink-0 flex-col justify-between overflow-hidden border-r"
              style={{ background: 'var(--c-sidebar)', backdropFilter: 'blur(16px)', borderColor: 'var(--c-border)' }}>
              <nav className="p-4 space-y-1.5">
                <p className="text-[9px] uppercase tracking-widest font-semibold px-3 pb-1" style={{ color: 'var(--c-dimmed)' }}>Navigation</p>
                {navItems.map(({ id, label, icon: Icon }) => {
                  const active = activeTab === id;
                  return (
                    <button key={id} onClick={() => setActiveTab(id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${active ? 'nav-active' : ''}`}
                      style={{ color: active ? '#60a5fa' : 'var(--c-muted)' }}
                      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--c-text)'; } }}
                      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-muted)'; } }}>
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">{label}</span>
                      {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-blue-500/60" />}
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t" style={{ borderColor: 'var(--c-border-s)' }}>
                <div className="px-3.5 py-3 mb-2 rounded-xl border" style={{ background: 'rgba(59,130,246,0.05)', borderColor: 'var(--c-border)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-semibold text-emerald-400">AI Engine Active</span>
                  </div>
                  <p className="text-[10px] font-light" style={{ color: 'var(--c-muted)' }}>Groq Llama-3 connected</p>
                </div>
                <button onClick={() => signOut()}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-[13px] font-semibold transition-all cursor-pointer text-red-400/70 hover:text-red-400 hover:bg-red-500/5">
                  <LogOut className="w-4 h-4 flex-shrink-0" /><span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── MAIN CONTENT ──────────────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden">

          {/* ══ WORKSPACE ══════════════════════════════════════════ */}
          {activeTab === 'dashboard' && (
            <div className="flex-1 flex overflow-hidden">

              {/* Chat Panel */}
              <section
                className={`flex-col border-r flex-shrink-0
                  ${mobileChatOpen ? 'flex' : 'hidden'} md:flex
                  w-full md:w-[340px] lg:w-[420px]`}
                style={{ borderColor: 'var(--c-border)', background: 'var(--c-panel)' }}>

                {/* Chat header */}
                <div className="px-4 md:px-5 py-4 border-b flex items-center justify-between flex-shrink-0"
                  style={{ borderColor: 'var(--c-border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                      <Bot className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold" style={{ color: 'var(--c-text)' }}>Order Assistant</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px]" style={{ color: 'var(--c-muted)' }}>Online & ready</span>
                      </div>
                    </div>
                  </div>
                  {/* Back button – mobile */}
                  <button onClick={() => setMobileChatOpen(false)}
                    className="md:hidden w-8 h-8 flex items-center justify-center rounded-xl border cursor-pointer"
                    style={{ borderColor: 'var(--c-border)', color: 'var(--c-muted)' }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex items-end gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                      {msg.sender === 'assistant' && (
                        <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mb-0.5"
                          style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                          <Bot className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                      )}
                      <div className={`max-w-[82%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed font-light ${msg.sender === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                        style={msg.sender === 'user'
                          ? { background: 'linear-gradient(135deg,#3B82F6,#6366f1)', boxShadow: '0 4px 16px rgba(59,130,246,0.25)', color: '#fff' }
                          : { background: 'var(--c-msg-ai)', border: '1px solid var(--c-msg-ai-br)', color: 'var(--c-text2)' }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex items-end gap-2.5">
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mb-0.5"
                        style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                        <Bot className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5"
                        style={{ background: 'var(--c-msg-ai)', border: '1px solid var(--c-msg-ai-br)' }}>
                        {[0, 150, 300].map(d => <div key={d} className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="px-4 pb-4 pt-3 border-t flex-shrink-0" style={{ borderColor: 'var(--c-border)' }}>
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2.5">
                    <input type="text" value={inputMessage} onChange={e => setInputMessage(e.target.value)}
                      placeholder={CHAT_EXAMPLES[placeholderIdx]}
                      className="flex-1 input-field text-[13px] px-4 py-3" />
                    <button type="submit" disabled={!inputMessage.trim() || chatLoading}
                      className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl disabled:opacity-40 transition-all cursor-pointer"
                      style={{ background: 'linear-gradient(135deg,#3B82F6,#6366f1)', boxShadow: '0 4px 16px rgba(59,130,246,0.3)' }}>
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </form>
                </div>
              </section>

              {/* Orders Panel */}
              <section className={`flex-col flex-1 overflow-hidden ${mobileChatOpen ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="px-4 md:px-6 py-4 border-b flex flex-wrap items-center justify-between gap-2 md:gap-3 flex-shrink-0"
                  style={{ background: 'var(--c-surface2)', borderColor: 'var(--c-border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                      <Package className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold" style={{ color: 'var(--c-text)' }}>Active Orders</p>
                      <p className="text-[10px]" style={{ color: 'var(--c-muted)' }}>{orders.length} orders total</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--c-dimmed)' }} />
                      <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search orders..." className="input-field pl-9 pr-3 py-2 text-[12px] w-36 md:w-44" />
                    </div>
                    <div className="flex items-center gap-0.5 p-1 rounded-xl border"
                      style={{ background: 'var(--c-card)', borderColor: 'var(--c-border)' }}>
                      <SlidersHorizontal className="w-3 h-3 mx-1" style={{ color: 'var(--c-dimmed)' }} />
                      {['All', 'Received', 'In Review', 'Accepted'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                          className={`px-2 md:px-3 py-1.5 rounded-lg text-[10px] md:text-[11px] font-semibold transition-all cursor-pointer ${statusFilter === s ? 'bg-blue-500/15 text-blue-400' : ''}`}
                          style={{ color: statusFilter === s ? undefined : 'var(--c-muted)' }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                  {loadingOrders ? (
                    <div className="h-full flex items-center justify-center flex-col gap-3" style={{ color: 'var(--c-muted)' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.08)' }}>
                        <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                      </div>
                      <span className="text-xs">Loading orders…</span>
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="h-full min-h-[260px] flex items-center justify-center flex-col gap-4 rounded-3xl border border-dashed"
                      style={{ background: 'var(--c-empty)', borderColor: 'var(--c-border-s)' }}>
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: 'var(--c-empty-icon)', border: '1px solid var(--c-border-s)' }}>
                        <Package className="w-6 h-6" style={{ color: 'var(--c-border)' }} />
                      </div>
                      <div className="text-center">
                        <p className="text-[14px] font-semibold" style={{ color: 'var(--c-text)' }}>No orders found</p>
                        <p className="text-[12px] mt-1" style={{ color: 'var(--c-muted)' }}>Adjust filters or create a new order via chat.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                      {filteredOrders.map(order => {
                        const lq = order.quality_notes?.at(-1);
                        const sm = statusMeta(order.status);
                        return (
                          <motion.div key={order.id} layout onClick={() => openDetailsModal(order)}
                            className="rounded-2xl p-4 md:p-5 cursor-pointer card-shine hover-glow group transition-all border"
                            style={{ background: 'var(--c-card)', borderColor: 'var(--c-border)', boxShadow: 'var(--shadow-card)' }}
                            whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>

                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-blue-400 inline-block mb-1.5"
                                  style={{ background: 'rgba(59,130,246,0.08)', padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(59,130,246,0.18)' }}>
                                  #{order.id}
                                </span>
                                <h3 className="text-[14px] md:text-[15px] font-bold group-hover:text-blue-400 transition-colors leading-snug"
                                  style={{ color: 'var(--c-text)' }}>
                                  {order.part_name || (order.material ? `${order.material} Component` : 'Production Order')}
                                </h3>
                              </div>
                              <span className={`text-[10px] font-bold border px-2.5 py-1 rounded-full flex-shrink-0 ml-2 ${sm.cls}`}>
                                <span className={`inline-block w-1.5 h-1.5 rounded-full ${sm.dot} mr-1.5 -mb-px`} />
                                {order.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] mb-4 pb-4 border-b" style={{ borderColor: 'var(--c-border-s)' }}>
                              <div className="rounded-xl p-2.5" style={{ background: 'var(--c-spec)' }}>
                                <p className="text-[9px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: 'var(--c-dimmed)' }}>Material</p>
                                <p className="font-semibold" style={{ color: 'var(--c-text)' }}>{order.material || '—'}</p>
                              </div>
                              <div className="rounded-xl p-2.5" style={{ background: 'var(--c-spec)' }}>
                                <p className="text-[9px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: 'var(--c-dimmed)' }}>Quantity</p>
                                <p className="font-semibold font-mono" style={{ color: 'var(--c-text)' }}>{order.quantity ?? '—'} <span className="text-[10px] font-normal" style={{ color: 'var(--c-muted)' }}>units</span></p>
                              </div>
                              {order.dimensions && (
                                <div className="col-span-2 rounded-xl p-2.5" style={{ background: 'var(--c-spec)' }}>
                                  <p className="text-[9px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: 'var(--c-dimmed)' }}>Dimensions</p>
                                  <p className="font-semibold truncate" style={{ color: 'var(--c-text)' }}>{order.dimensions}</p>
                                </div>
                              )}
                              <div className="col-span-2 flex items-center gap-2 pt-0.5">
                                <Calendar className="w-3.5 h-3.5 text-blue-500/70 flex-shrink-0" />
                                <span style={{ color: 'var(--c-muted)' }}>Deadline:</span>
                                <span className="font-semibold" style={{ color: 'var(--c-text)' }}>
                                  {order.deadline ? new Date(order.deadline).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : 'N/A'}
                                </span>
                              </div>
                            </div>

                            {lq ? (
                              <div className="rounded-xl p-3 text-[11px]" style={{ background: 'var(--c-qual)', border: '1px solid var(--c-qual-br)' }}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400">Latest Inspection</span>
                                  <span className="text-[9px] font-mono" style={{ color: 'var(--c-muted)' }}>{new Date(lq.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                </div>
                                <p className="italic font-light leading-snug" style={{ color: 'var(--c-text2)' }}>"{lq.note}"</p>
                              </div>
                            ) : (
                              <div className="rounded-xl p-2.5 text-center text-[10px] italic font-light border border-dashed"
                                style={{ color: 'var(--c-dimmed)', borderColor: 'var(--c-border-s)' }}>
                                No quality inspections yet.
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* ══ DATABASE ════════════════════════════════════════════ */}
          {activeTab === 'database' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-4 md:px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3 flex-shrink-0"
                style={{ background: 'var(--c-surface2)', borderColor: 'var(--c-border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <Database className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold" style={{ color: 'var(--c-text)' }}>Orders Database</p>
                    <p className="text-[10px]" style={{ color: 'var(--c-muted)' }}>All manufacturing orders</p>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--c-dimmed)' }} />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by part, material…" className="input-field pl-9 pr-3 py-2 text-[12px] w-56" />
                </div>
              </div>
              <div className="flex-1 overflow-auto p-3 md:p-6">
                <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--c-border)', background: 'var(--c-table)' }}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse" style={{ minWidth: 680 }}>
                      <thead>
                        <tr className="border-b" style={{ background: 'var(--c-thead)', borderColor: 'var(--c-border)' }}>
                          {['ID', 'Part Name', 'Material', 'Qty', 'Dimensions', 'Deadline', 'Status', 'Created'].map(h => (
                            <th key={h} className="py-3.5 px-4 md:px-5 text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--c-dimmed)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {orders.filter(o =>
                          o.part_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.material?.toLowerCase().includes(searchQuery.toLowerCase())
                        ).map((order, idx) => {
                          const sm = statusMeta(order.status);
                          return (
                            <tr key={order.id} onClick={() => openDetailsModal(order)}
                              className="border-b cursor-pointer transition-colors"
                              style={{ borderColor: 'var(--c-border-s)' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.03)'}
                              onMouseLeave={e => e.currentTarget.style.background = idx % 2 !== 0 ? 'rgba(255,255,255,0.01)' : 'transparent'}>
                              <td className="py-3.5 px-4 md:px-5 font-mono font-bold text-blue-400 text-[12px]">#{order.id}</td>
                              <td className="py-3.5 px-4 md:px-5 font-semibold text-[12px]" style={{ color: 'var(--c-text)' }}>{order.part_name || '—'}</td>
                              <td className="py-3.5 px-4 md:px-5 text-[12px]" style={{ color: 'var(--c-text2)' }}>{order.material || '—'}</td>
                              <td className="py-3.5 px-4 md:px-5 font-mono text-[12px]" style={{ color: 'var(--c-text2)' }}>{order.quantity ?? '—'}</td>
                              <td className="py-3.5 px-4 md:px-5 italic text-[11px]" style={{ color: 'var(--c-muted)' }}>{order.dimensions || '—'}</td>
                              <td className="py-3.5 px-4 md:px-5 font-medium text-[12px]" style={{ color: 'var(--c-text2)' }}>
                                {order.deadline ? new Date(order.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : '—'}
                              </td>
                              <td className="py-3.5 px-4 md:px-5">
                                <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${sm.cls}`}>{order.status}</span>
                              </td>
                              <td className="py-3.5 px-4 md:px-5 font-mono text-[11px]" style={{ color: 'var(--c-muted)' }}>
                                {new Date(order.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ QUALITY LOGS ════════════════════════════════════════ */}
          {activeTab === 'quality' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-4 md:px-6 py-4 border-b flex items-center gap-3 flex-shrink-0"
                style={{ background: 'var(--c-surface2)', borderColor: 'var(--c-border)' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <ClipboardList className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-[14px] font-bold" style={{ color: 'var(--c-text)' }}>Quality Inspection Records</p>
                  <p className="text-[10px]" style={{ color: 'var(--c-muted)' }}>All inspection logs sorted by latest</p>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4 md:p-6 max-w-3xl mx-auto w-full">
                {orders.some(o => o.quality_notes?.length > 0) ? (
                  <div className="space-y-4">
                    {orders.flatMap(o => o.quality_notes?.map((q, i) => ({ ...q, orderId: o.id, partName: o.part_name, key: `${o.id}-${i}` })) || [])
                      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                      .map(log => (
                        <div key={log.key} onClick={() => { const o = orders.find(o => o.id === log.orderId); if (o) openDetailsModal(o); }}
                          className="rounded-2xl p-4 md:p-5 cursor-pointer hover-glow transition-all flex gap-4 border"
                          style={{ background: 'var(--c-card)', borderColor: 'var(--c-qual-br)', boxShadow: 'var(--shadow-card)' }}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                            <CheckCircle2 className="w-5 h-5 text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/08 border border-blue-500/15 px-1.5 py-0.5 rounded">#{log.orderId}</span>
                                <span className="text-[13px] font-bold" style={{ color: 'var(--c-text)' }}>{log.partName || 'Production Order'}</span>
                              </div>
                              <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--c-muted)' }}>
                                <Clock className="w-3 h-3" />{new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-[12px] italic font-light rounded-xl p-3 leading-snug"
                              style={{ background: 'var(--c-spec)', border: '1px solid var(--c-border-s)', color: 'var(--c-text2)' }}>
                              "{log.note}"
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="h-full min-h-[260px] flex items-center justify-center flex-col gap-4 rounded-3xl border border-dashed"
                    style={{ background: 'var(--c-empty)', borderColor: 'var(--c-border-s)' }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: 'var(--c-empty-icon)', border: '1px solid var(--c-border-s)' }}>
                      <ClipboardList className="w-6 h-6" style={{ color: 'var(--c-border)' }} />
                    </div>
                    <div className="text-center">
                      <p className="text-[14px] font-semibold" style={{ color: 'var(--c-text)' }}>No Inspection Logs</p>
                      <p className="text-[12px] mt-1" style={{ color: 'var(--c-muted)' }}>Quality logs submitted via chat or modal will appear here.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────── MOBILE BOTTOM NAV ───────────────────── */}
      <nav className="md:hidden flex items-stretch border-t flex-shrink-0 z-20"
        style={{ background: 'var(--c-surface)', backdropFilter: 'blur(20px)', borderColor: 'var(--c-border)' }}>
        {[
          { id: 'chat', label: 'Chat', icon: Bot, action: () => { setActiveTab('dashboard'); setMobileChatOpen(true); } },
          { id: 'orders', label: 'Orders', icon: Package, action: () => { setActiveTab('dashboard'); setMobileChatOpen(false); } },
          { id: 'database', label: 'Database', icon: Database, action: () => { setActiveTab('database'); setMobileChatOpen(false); } },
          { id: 'quality', label: 'Quality', icon: ClipboardList, action: () => { setActiveTab('quality'); setMobileChatOpen(false); } },
        ].map(({ id, label, icon: Icon, action }) => {
          const isActive = id === mobileActiveId;
          return (
            <button key={id} onClick={action}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all cursor-pointer relative">
              {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-blue-500" />}
              <Icon className={`h-5 w-5 transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}
                style={{ color: isActive ? '#60a5fa' : 'var(--c-muted)' }} />
              <span className="text-[9px] font-bold tracking-wide" style={{ color: isActive ? '#60a5fa' : 'var(--c-muted)' }}>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* ─────────────────────── MODALS ──────────────────────── */}
      <AnimatePresence>

        {/* Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { if (!deleteConfirmId) { setSelectedOrder(null); setStatusDropdownOpen(false); } }}
              className="absolute inset-0" style={{ background: 'var(--c-overlay)', backdropFilter: 'blur(20px)' }} />

            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }} transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="relative w-full md:max-w-[560px] rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col z-10"
              style={{ maxHeight: '92dvh', background: 'var(--c-modal)', border: '1px solid var(--c-border)', boxShadow: 'var(--shadow-modal)' }}>

              <div className="h-0.5 w-full flex-shrink-0" style={{ background: 'linear-gradient(90deg,#3B82F6,#6366f1,#8B5CF6)' }} />
              {/* Drag handle – mobile */}
              <div className="md:hidden flex justify-center py-2 flex-shrink-0">
                <div className="w-10 h-1 rounded-full" style={{ background: 'var(--c-border)' }} />
              </div>

              {/* Modal header */}
              <div className="px-5 md:px-7 py-4 md:py-5 flex items-start justify-between border-b flex-shrink-0"
                style={{ background: 'var(--c-surface2)', borderColor: 'var(--c-border-s)' }}>
                <div>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-blue-400"
                    style={{ background: 'rgba(59,130,246,0.08)', padding: '3px 10px', borderRadius: 6, border: '1px solid rgba(59,130,246,0.18)' }}>
                    Order #{selectedOrder.id}
                  </span>
                  <h2 className="text-[17px] md:text-[19px] font-bold mt-2.5 leading-tight" style={{ color: 'var(--c-text)' }}>
                    {isEditMode ? 'Edit Order Details' : (selectedOrder.part_name || 'Production Order')}
                  </h2>
                </div>
                <button onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl transition-all cursor-pointer"
                  style={{ color: 'var(--c-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--c-text)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-muted)'; }}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal body */}
              <div className="flex-1 overflow-y-auto px-5 md:px-7 py-5 md:py-6 space-y-6">
                {isEditMode ? (
                  <form onSubmit={handleSaveEdit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Part Name', value: editPartName, set: setEditPartName, placeholder: 'e.g. Flanges', type: 'text', min: undefined },
                        { label: 'Material', value: editMaterial, set: setEditMaterial, placeholder: 'e.g. Titanium', type: 'text', min: undefined },
                        { label: 'Quantity', value: editQuantity, set: setEditQuantity, placeholder: '100', type: 'number', min: '1' },
                        { label: 'Deadline', value: editDeadline, set: setEditDeadline, placeholder: '', type: 'date', min: undefined },
                      ].map(({ label, value, set, placeholder, type, min }) => (
                        <div key={label}>
                          <label className="block text-[9px] uppercase tracking-widest font-bold mb-1.5" style={{ color: 'var(--c-muted)' }}>{label}</label>
                          <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
                            {...(min !== undefined ? { min } : {})}
                            className="input-field w-full px-3.5 py-2.5 text-[12px]" />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest font-bold mb-1.5" style={{ color: 'var(--c-muted)' }}>Dimensions</label>
                      <input type="text" value={editDimensions} onChange={e => setEditDimensions(e.target.value)} placeholder="e.g. 80mm bore"
                        className="input-field w-full px-3.5 py-2.5 text-[12px]" />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--c-muted)' }}>Status</label>
                      <div className="flex gap-2">
                        {['Received', 'In Review', 'Accepted'].map(st => {
                          const active = editStatus === st;
                          return (
                            <button key={st} type="button" onClick={() => setEditStatus(st)}
                              className="flex-1 py-2.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer"
                              style={{
                                background: active ? 'rgba(59,130,246,0.1)' : 'var(--c-card)',
                                borderColor: active ? 'rgba(59,130,246,0.4)' : 'var(--c-border)',
                                color: active ? '#60a5fa' : 'var(--c-muted)'
                              }}>
                              {st}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </form>
                ) : (
                  <>
                    {/* Specs grid */}
                    <div className="grid grid-cols-2 gap-3 pb-5 border-b" style={{ borderColor: 'var(--c-border-s)' }}>
                      {[
                        { label: 'Status', content: <span className={`text-[10px] font-bold border px-2.5 py-1 rounded-full ${statusMeta(selectedOrder.status).cls}`}>{selectedOrder.status}</span> },
                        { label: 'Material', content: <span className="text-[14px] font-bold" style={{ color: 'var(--c-text)' }}>{selectedOrder.material || '—'}</span> },
                        { label: 'Quantity', content: <span className="text-[14px] font-bold font-mono" style={{ color: 'var(--c-text)' }}>{selectedOrder.quantity} <span className="text-[11px] font-normal" style={{ color: 'var(--c-muted)' }}>units</span></span> },
                        { label: 'Dimensions', content: <span className="text-[14px] font-bold" style={{ color: 'var(--c-text)' }}>{selectedOrder.dimensions || '—'}</span> },
                      ].map(({ label, content }) => (
                        <div key={label} className="rounded-xl p-3.5 border" style={{ background: 'var(--c-spec)', borderColor: 'var(--c-border-s)' }}>
                          <p className="text-[9px] uppercase tracking-widest font-bold mb-1.5" style={{ color: 'var(--c-dimmed)' }}>{label}</p>
                          {content}
                        </div>
                      ))}
                      <div className="col-span-2 rounded-xl p-3.5 flex items-center gap-2.5 border" style={{ background: 'var(--c-spec)', borderColor: 'var(--c-border-s)' }}>
                        <Calendar className="w-4 h-4 text-blue-500/70" />
                        <div>
                          <p className="text-[9px] uppercase tracking-widest font-bold mb-0.5" style={{ color: 'var(--c-dimmed)' }}>Deadline</p>
                          <p className="text-[14px] font-bold" style={{ color: 'var(--c-text)' }}>
                            {selectedOrder.deadline ? new Date(selectedOrder.deadline).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : 'Not specified'}
                          </p>
                        </div>
                      </div>
                      <div className="col-span-2 flex items-center gap-1.5 text-[10px] font-mono" style={{ color: 'var(--c-dimmed)' }}>
                        <Clock className="w-3 h-3" />Created: {new Date(selectedOrder.created_at).toLocaleString()}
                      </div>
                    </div>

                    {/* Quality logs */}
                    <div>
                      <p className="text-[9px] uppercase tracking-widest font-bold mb-3" style={{ color: 'var(--c-muted)' }}>Quality Inspection Logs</p>
                      {selectedOrder.quality_notes?.length > 0 ? (
                        <div className="space-y-2.5 mb-3">
                          {selectedOrder.quality_notes.map((log, i) => (
                            <div key={i} className="rounded-xl p-3.5 border" style={{ background: 'var(--c-qual)', borderColor: 'var(--c-qual-br)' }}>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400">Inspector Log</span>
                                <span className="text-[9px] font-mono" style={{ color: 'var(--c-dimmed)' }}>{new Date(log.timestamp).toLocaleString()}</span>
                              </div>
                              <p className="text-[12px] italic font-light leading-relaxed" style={{ color: 'var(--c-text2)' }}>"{log.note}"</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl p-4 text-center text-[11px] italic border border-dashed mb-3"
                          style={{ color: 'var(--c-dimmed)', borderColor: 'var(--c-border-s)' }}>
                          No quality reports logged yet.
                        </div>
                      )}
                      <form onSubmit={handleAddQualityNoteFromModal} className="flex gap-2.5">
                        <input type="text" value={newQualityNoteText} onChange={e => setNewQualityNoteText(e.target.value)}
                          placeholder="Add inspection note…" className="input-field flex-1 px-3.5 py-2.5 text-[12px]" />
                        <button type="submit" disabled={!newQualityNoteText.trim()}
                          className="px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all disabled:opacity-40 cursor-pointer border text-blue-400"
                          style={{ background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.25)' }}>
                          Log
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </div>

              {/* Modal footer */}
              <div className="px-5 md:px-7 py-4 border-t flex items-center justify-between flex-shrink-0"
                style={{ background: 'var(--c-surface2)', borderColor: 'var(--c-border-s)' }}>
                {isEditMode ? (
                  <>
                    <button onClick={() => setIsEditMode(false)}
                      className="px-4 py-2 text-[12px] font-semibold transition-colors cursor-pointer"
                      style={{ color: 'var(--c-muted)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--c-text)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--c-muted)'}>Cancel</button>
                    <button onClick={handleSaveEdit}
                      className="px-6 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all cursor-pointer"
                      style={{ background: 'linear-gradient(135deg,#3B82F6,#6366f1)', boxShadow: '0 4px 16px rgba(59,130,246,0.3)' }}>
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setDeleteConfirmId(selectedOrder.id)}
                      className="px-4 py-2.5 rounded-xl border text-red-400 text-[12px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      style={{ borderColor: 'rgba(239,68,68,0.25)' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'; e.currentTarget.style.background = 'transparent'; }}>
                      <Trash2 className="w-3.5 h-3.5" />Delete
                    </button>
                    <div className="flex items-center gap-2 md:gap-2.5">
                      <button onClick={() => setIsEditMode(true)}
                        className="px-4 py-2.5 rounded-xl border text-[12px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        style={{ background: 'var(--c-card)', borderColor: 'var(--c-border)', color: 'var(--c-text2)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--c-text)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text2)'}>
                        <Pencil className="w-3.5 h-3.5" />Edit
                      </button>

                      {/* Custom status dropdown – pops upward */}
                      <div className="relative">
                        <button onClick={() => setStatusDropdownOpen(v => !v)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold text-white cursor-pointer transition-all"
                          style={{ background: 'linear-gradient(135deg,#3B82F6,#6366f1)', boxShadow: '0 4px 12px rgba(59,130,246,0.25)' }}>
                          {selectedOrder.status}
                          <svg className={`w-3.5 h-3.5 transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {statusDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-[70]" onClick={() => setStatusDropdownOpen(false)} />
                            <div className="absolute right-0 bottom-full mb-2 z-[80] rounded-xl overflow-hidden py-1"
                              style={{ background: 'var(--c-modal)', border: '1px solid rgba(59,130,246,0.3)', boxShadow: '0 16px 40px rgba(0,0,0,0.4)', minWidth: 148 }}>
                              {['Received', 'In Review', 'Accepted'].map(st => (
                                <button key={st}
                                  onClick={async () => { setStatusDropdownOpen(false); await applyStatusChange(selectedOrder.id, st); }}
                                  className="w-full text-left px-4 py-2.5 text-[12px] font-semibold transition-colors cursor-pointer"
                                  style={{
                                    color: selectedOrder.status === st ? '#60a5fa' : 'var(--c-text2)',
                                    background: selectedOrder.status === st ? 'rgba(59,130,246,0.1)' : 'transparent'
                                  }}
                                  onMouseEnter={e => { if (selectedOrder.status !== st) { e.currentTarget.style.background = 'rgba(59,130,246,0.05)'; e.currentTarget.style.color = 'var(--c-text)'; } }}
                                  onMouseLeave={e => { if (selectedOrder.status !== st) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-text2)'; } }}>
                                  {st}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirm Modal */}
        {deleteConfirmId !== null && (
          <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center md:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0" style={{ background: 'var(--c-overlay2)', backdropFilter: 'blur(24px)' }} />
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.18 }}
              className="relative w-full md:max-w-sm rounded-t-3xl md:rounded-3xl overflow-hidden z-10 text-center"
              style={{ background: 'var(--c-modal)', border: '1px solid rgba(239,68,68,0.2)', boxShadow: 'var(--shadow-del)' }}>
              <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg,#ef4444,#f97316)' }} />
              <div className="md:hidden flex justify-center py-2">
                <div className="w-10 h-1 rounded-full" style={{ background: 'var(--c-border)' }} />
              </div>
              <div className="p-6 md:p-7">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-[17px] font-bold mb-2" style={{ color: 'var(--c-text)' }}>Delete Order #{deleteConfirmId}</h3>
                <p className="text-[12px] font-light leading-relaxed mb-7" style={{ color: 'var(--c-muted)' }}>
                  This will permanently remove Order #{deleteConfirmId} and all its quality logs. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirmId(null)}
                    className="flex-1 py-3 rounded-xl text-[12px] font-bold transition-colors border cursor-pointer"
                    style={{ background: 'var(--c-card)', borderColor: 'var(--c-border)', color: 'var(--c-muted)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--c-text)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--c-muted)'}>
                    Cancel
                  </button>
                  <button onClick={() => handleDeleteOrder(deleteConfirmId)}
                    className="flex-1 py-3 rounded-xl text-[12px] font-bold text-white transition-all cursor-pointer"
                    style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)', boxShadow: '0 4px 16px rgba(239,68,68,0.3)' }}>
                    Confirm Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
}
