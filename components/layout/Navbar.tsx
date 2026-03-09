'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#docs', label: 'Docs' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12"
      style={{
        height: 64,
        background: scrolled ? 'rgba(13,13,13,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--bg-border)' : 'none',
        transition: 'background 0.3s, backdrop-filter 0.3s, border-bottom 0.3s',
      }}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <div
          className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold text-white"
          style={{ background: 'var(--accent)', fontFamily: 'var(--font-syne)' }}
        >
          SP
        </div>
        <span
          className="text-base font-bold"
          style={{ fontFamily: 'var(--font-syne)', color: 'var(--text-primary)' }}
        >
          <span style={{ color: 'var(--accent)' }}>Stack</span>Pay
        </span>
      </Link>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map(({ href, label }, i) => (
          <motion.a
            key={href}
            href={href}
            className="text-sm transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            whileHover={{ color: 'var(--text-primary)' }}
          >
            {label}
          </motion.a>
        ))}
      </nav>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35 }}
      >
        <Button variant="accent" size="sm">
          Connect Wallet
        </Button>
      </motion.div>
    </motion.header>
  );
}
