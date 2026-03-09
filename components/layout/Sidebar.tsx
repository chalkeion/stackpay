'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Send,
  Activity,
  Lock,
  Split,
  TrendingUp,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/send', label: 'Send', icon: Send },
  { href: '/stream', label: 'Stream', icon: Activity },
  { href: '/escrow', label: 'Escrow', icon: Lock },
  { href: '/split', label: 'Split', icon: Split },
  { href: '/yield', label: 'Yield', icon: TrendingUp },
  { href: '/invoice', label: 'Invoice', icon: FileText },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      className="relative flex flex-col h-screen border-r"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--bg-border)',
        minHeight: '100vh',
      }}
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ type: 'spring', stiffness: 300, damping: 35 }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5 border-b"
        style={{ borderColor: 'var(--bg-border)' }}
      >
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
          style={{
            background: 'var(--accent)',
            color: '#fff',
            fontFamily: 'var(--font-syne)',
          }}
        >
          SP
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-sm whitespace-nowrap"
              style={{ fontFamily: 'var(--font-syne)', color: 'var(--text-primary)' }}
            >
              StackPay
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} className="relative block">
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: 'var(--accent-dim)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 35 }}
                />
              )}
              <motion.div
                className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer"
                style={{
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.15 }}
              >
                <motion.div
                  whileHover={{
                    scale: 1.2,
                    filter: 'drop-shadow(0 0 6px var(--accent))',
                  }}
                  transition={{ duration: 0.15 }}
                >
                  <Icon size={18} />
                </motion.div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm font-medium whitespace-nowrap"
                      style={{ fontFamily: 'var(--font-geist-sans)' }}
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
      <div className="p-3 border-t" style={{ borderColor: 'var(--bg-border)' }}>
        <motion.button
          className="w-full flex items-center justify-center p-2 rounded-lg"
          style={{ color: 'var(--text-secondary)' }}
          whileHover={{ color: 'var(--accent)', background: 'var(--bg-elevated)' }}
          onClick={() => setCollapsed((v) => !v)}
          transition={{ duration: 0.15 }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </motion.button>
      </div>
    </motion.aside>
  );
}
