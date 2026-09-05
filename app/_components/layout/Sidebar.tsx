'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  BookOpen,
  Headphones,
  Mic,
  StickyNote,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { id: 'home',      label: 'Home',             icon: Home,        href: '/' },
  { id: 'vocab',     label: 'Vocabulary',        icon: BookOpen,    href: '/vocabulary' },
  { id: 'listening', label: 'Listening Studio',  icon: Headphones,  href: '/listening' },
  { id: 'speaking',  label: 'Speaking',          icon: Mic,         href: '/speaking' },
  { id: 'notes',     label: 'My Notes',          icon: StickyNote,  href: '/my-notes' },
  { id: 'dashboard', label: 'Progress',          icon: BarChart3,   href: '/dashboard' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative flex flex-col h-full shrink-0 overflow-hidden border-r"
      style={{ backgroundColor: '#1E293B', borderColor: '#2D3A55' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: '#2D3A55' }}>
        <div
          className="flex items-center justify-center rounded-xl shrink-0"
          style={{ width: 32, height: 32, backgroundColor: 'rgba(139,92,246,0.15)' }}
        >
          <Zap size={18} color="#8B5CF6" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="font-bold text-sm whitespace-nowrap"
              style={{ color: '#F1F5F9' }}
            >
              YapLab
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 p-2 flex-1 mt-1">
        {navItems.map(({ id, label, icon: Icon, href }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link key={id} href={href}>
              <motion.div
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors relative"
                style={{
                  backgroundColor: active ? 'rgba(139,92,246,0.12)' : 'transparent',
                  color: active ? '#8B5CF6' : '#94A3B8',
                }}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                    style={{ backgroundColor: '#8B5CF6' }}
                  />
                )}
                <Icon size={18} className="shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center m-3 p-2 rounded-lg border transition-colors"
        style={{
          backgroundColor: 'transparent',
          borderColor: '#2D3A55',
          color: '#64748B',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#3D4F70';
          (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#2D3A55';
          (e.currentTarget as HTMLButtonElement).style.color = '#64748B';
        }}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </motion.aside>
  );
}