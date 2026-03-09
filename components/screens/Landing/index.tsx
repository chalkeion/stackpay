'use client';

import { useRef } from 'react';
import {
  motion,
  useInView,
  useScroll,
  useTransform,
} from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import CursorGrid from '@/components/animations/CursorGrid';

// ─── Scroll Progress Bar ──────────────────────────────────────────────────────

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-[var(--accent)] origin-left z-[9999]"
      style={{ scaleX: scrollYProgress }}
    />
  );
}

// ─── Letter Assembly ──────────────────────────────────────────────────────────

function LetterAssembly({
  text,
  color,
  delay = 0,
}: {
  text: string;
  color?: string;
  delay?: number;
}) {
  return (
    <span>
      {text.split('').map((char, i) =>
        char === ' ' ? (
          <span key={i}>&nbsp;</span>
        ) : (
          <motion.span
            key={i}
            style={{ display: 'inline-block', color }}
            initial={{
              opacity: 0,
              x: (Math.random() - 0.5) * 400,
              y: (Math.random() - 0.5) * 400,
              rotate: (Math.random() - 0.5) * 60,
            }}
            animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 110,
              damping: 16,
              delay: delay + i * 0.03,
            }}
          >
            {char}
          </motion.span>
        )
      )}
    </span>
  );
}

// ─── Section 1 — Hero ─────────────────────────────────────────────────────────

function HeroSection() {
  const { scrollY } = useScroll();
  const scrollOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <CursorGrid className="absolute inset-0 w-full h-full" />

      {/* Subtle radial vignette so content reads cleanly */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, rgba(13,13,13,0.7) 100%)',
          zIndex: 1,
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-16 mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider border"
          style={{
            borderColor: 'var(--accent-dim)',
            color: 'var(--accent)', 
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
          />
          Built on Stacks · Powered by Bitcoin
        </motion.div>

        {/* Headline */}
        <h1
          className="text-[52px] md:text-[96px] font-black leading-none mb-6 tracking-tight"
          style={{ fontFamily: 'var(--font-syne)' }}
        >
          <div>
            <LetterAssembly text="Your ₿itcoin." delay={0.1} />
          </div>
          <div>
            <LetterAssembly text="Finally " delay={0.25} />
            <LetterAssembly text="Working" delay={0.35} color="var(--accent)" />
          </div>
          <div>
            <LetterAssembly text="For You." delay={0.55} />
          </div>
        </h1>

        {/* Subhead */}
        <motion.p
          className="text-base md:text-lg mb-10 max-w-[600px] leading-relaxed"
          style={{
            fontFamily: 'var(--font-ibm-plex-mono, monospace)',
            color: 'var(--text-secondary)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          Send, receive, and automate ₿itcoin payments - without banks, without
          middlemen, without trusting anyone but the code.
        </motion.p>

        {/* CTA with pulse rings */}
        <motion.div
          className="relative inline-block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
        >
          {[0, 0.5].map((offset, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-lg pointer-events-none"
              style={{ border: '2px solid var(--accent)', borderRadius: 8 }}
              animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: offset,
                ease: 'easeOut',
              }}
            />
          ))}
          <motion.button
            className="relative z-10 h-14 px-8 rounded-lg font-semibold text-white text-base cursor-pointer"
            style={{
              background: 'var(--accent)',
              fontFamily: 'var(--font-syne)',
            }}
            whileHover={{
              boxShadow: '0 0 32px rgba(241,90,34,0.5)',
              scale: 1.04,
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              window.location.href = '/dashboard';
            }}
          >
            Launch App →
          </motion.button>
        </motion.div>

        {/* Scroll chevron */}
        <motion.div
          className="mt-16"
          style={{ opacity: scrollOpacity }}
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown size={24} style={{ color: 'var(--text-dim)' }} />
        </motion.div>
      </div>
    </section>
  );
}

// ─── Section 2 — Problem ──────────────────────────────────────────────────────

const PROBLEM_CARDS = [
  {
    title: 'Fees eat your money',
    body: 'Every time you send Bitcoin internationally, a middleman takes a cut. Banks, exchanges, payment processors — they all charge for the privilege of moving your own money.',
    animation: { scale: [1, 1.1, 1] },
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const },
  },
  {
    title: 'Payments have no conditions',
    body: 'You send money and hope. Hope the work gets done. Hope they deliver. Hope they don\'t disappear. Bitcoin has no way to say "release this only when X happens."',
    animation: { rotate: [0, 8, -8, 0] },
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const },
  },
  {
    title: 'Your money sits idle',
    body: 'While a payment is being processed, held in escrow, or waiting to be claimed — that Bitcoin earns nothing. It just sits there losing value to inflation.',
    animation: { x: [0, 3, -3, 0] },
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
  },
];

function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-24 px-6 md:px-20">
      <div className="max-w-6xl mx-auto">
        <motion.p
          className="text-xs uppercase tracking-widest mb-4 font-mono"
          style={{ color: 'var(--accent)' }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          Why This Exists
        </motion.p>
        <motion.h2
          className="text-4xl md:text-[48px] font-bold max-w-3xl mb-14 leading-tight"
          style={{ fontFamily: 'var(--font-syne)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          ₿itcoin is worth $1 trillion. But sending it still feels broken.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PROBLEM_CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              className="rounded-xl border p-6 cursor-default"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--bg-border)',
              }}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.2 + i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -4 }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = 'var(--bg-border)';
              }}
            >
              <h3
                className="text-base font-semibold mb-2"
                style={{ fontFamily: 'var(--font-syne)', color: 'var(--text-primary)' }}
              >
                {card.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {card.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 3 — Solution ─────────────────────────────────────────────────────

const SOLUTION_BODY =
  'StackPay lets you send Bitcoin with conditions, rules, and automation built in — powered by smart contracts on Stacks. Your money moves exactly when and how you decide. Nobody else can touch it.';

const HIGHLIGHT_PHRASE = 'conditions, rules, and automation';

function SolutionSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  // Split body into words, keep the highlighted phrase together
  const words = SOLUTION_BODY.split(' ');

  return (
    <section
      ref={ref}
      className="relative py-24 px-6 md:px-20 overflow-hidden"
      style={{ borderLeft: '4px solid var(--accent)' }}
    >
      {/* Animated radial gradient bg */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(241,90,34,0.08) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative max-w-4xl mx-auto">
        <motion.p
          className="text-xs uppercase tracking-widest mb-4 font-mono"
          style={{ color: 'var(--accent)' }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          Introducing StackPay
        </motion.p>
        <motion.h2
          className="text-4xl md:text-[48px] font-bold mb-8 leading-tight"
          style={{ fontFamily: 'var(--font-syne)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Programmable ₿itcoin payments. No bank required.
        </motion.h2>

        <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {words.map((word, i) => {
            const isHighlight =
              SOLUTION_BODY.includes(HIGHLIGHT_PHRASE) &&
              SOLUTION_BODY.indexOf(HIGHLIGHT_PHRASE
                .split(' ')
                .slice(0, 1)
                .join(' ')) !== -1 &&
              i >= 9 &&
              i <= 12;
            return (
              <motion.span
                key={i}
                style={{ color: isHighlight ? 'var(--accent)' : undefined }}
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.03 }}
              >
                {word}{' '}
              </motion.span>
            );
          })}
        </p>
      </div>
    </section>
  );
}

// ─── Section 4 — How It Works ─────────────────────────────────────────────────

const HOW_STEPS = [
  {
    num: '1',
    title: 'Connect',
    body: 'Connect your Bitcoin wallet. We support Hiro and Leather wallets. No account. No signup. No personal information. Your wallet is your identity.',
    iconAnimation: { scale: [1, 1.2, 1] },
    iconTransition: { duration: 0.6, delay: 0.5 },
  },
  {
    num: '2',
    title: 'Choose',
    body: 'Choose how you want to send. A regular payment, a stream that flows per second, an escrow that releases on conditions, or a split across multiple people. You decide the rules.',
    iconAnimation: { rotate: [0, 10, -5, 0] },
    iconTransition: { duration: 1, repeat: Infinity, repeatDelay: 3 },
  },
  {
    num: '3',
    title: 'Send',
    body: 'Confirm the transaction in your wallet. StackPay handles everything else. The smart contract enforces your rules automatically. No one can override it — not even us.',
    iconAnimation: { scale: [1, 1.15, 1], opacity: [1, 0.7, 1] },
    iconTransition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const },
  },
];

function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const lineHeight = useTransform(scrollYProgress, [0.1, 0.8], ['0%', '100%']);

  return (
    <section
      ref={sectionRef}
      className="py-24 px-6 md:px-20 border-t"
      style={{ borderColor: 'var(--bg-border)' }}
    >
      <div className="max-w-4xl mx-auto">
        <motion.p
          className="text-xs uppercase tracking-widest mb-4 font-mono text-center"
          style={{ color: 'var(--accent)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Three Steps
        </motion.p>
        <motion.h2
          className="text-3xl md:text-[40px] font-bold text-center mb-16 leading-tight"
          style={{ fontFamily: 'var(--font-syne)' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Simple enough for anyone. Powerful enough for everything.
        </motion.h2>

        <div className="relative">
          {/* Connector line (desktop only) */}
          <div 
            className="hidden md:block absolute left-[27px] top-14 bottom-14 w-[2px] z-1" 
            style={{ background: 'var(--bg-border)' }}
          >
            <motion.div
              className="w-full origin-top"
              style={{ height: lineHeight, background: 'var(--accent)' }}
            />
          </div>

          <div className="flex flex-col gap-16">
            {HOW_STEPS.map((step, i) => {
              const isEven = i % 2 === 1;
              return (
                <motion.div
                  key={step.num}
                  className="flex flex-col md:flex-row items-start gap-6 z-10"
                  style={{ flexDirection: isEven ? 'row-reverse' : undefined } as React.CSSProperties}
                  initial={{ opacity: 0, x: isEven ? 60 : -60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Node */}
                  <motion.div
                    className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold border-2 relative z-10"
                    style={{
                      fontFamily: 'var(--font-syne)',
                      borderColor: 'var(--accent)',
                      color: 'var(--accent)',
                      background: 'var(--bg-base)',
                    }}
                    whileInView={{
                      boxShadow: ['0 0 0px var(--accent-glow)', '0 0 20px var(--accent-glow)', '0 0 0px var(--accent-glow)'],
                    }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.4 + i * 0.2 }}
                  >
                    {step.num}
                  </motion.div>

                  {/* Content */}
                  <div
                    className="flex-1 rounded-xl border p-6 z-99"
                    style={{
                      background: 'var(--bg-surface)',
                      borderColor: 'var(--bg-border)',
                    }}
                  >
                    <h3
                      className="text-lg font-semibold mb-3"
                      style={{ fontFamily: 'var(--font-syne)' }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {step.body}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 5 — Feature Cards ────────────────────────────────────────────────

const FEATURE_CARDS = [
  {
    title: 'Stream Payments',
    plain:
      'Pay someone by the second. Instead of sending one big payment at the end of a project, the money flows continuously — like a tap. The moment you turn it off, it stops. The recipient gets paid for exactly the time they worked.',
    technical:
      'Continuous sBTC transfer at a defined rate per block. Recipient can withdraw accumulated balance at any time. Sender can pause or cancel, with unstreamed funds returned.',
    example:
      'A startup pays a contractor $500/week. Instead of a bank transfer every Friday, StackPay streams 0.00005 sBTC per minute. The contractor watches their balance grow in real time.',
  },
  {
    title: 'Escrow Payments',
    plain:
      "Pay on completion, not on hope. Lock your Bitcoin in a digital vault. Set the conditions for release — 'pay when the design is delivered', 'pay when the code passes review'. The money releases automatically when conditions are met. Nobody can take it early.",
    technical:
      'sBTC locked in a Clarity smart contract with milestone-based release conditions. Optional arbiter address for dispute resolution. Auto-releases on timeout if no dispute is raised.',
    example:
      'A client hires a developer for a website. They lock 0.05 sBTC in escrow. Milestone 1: wireframes approved → 0.01 sBTC releases. Milestone 2: development complete → 0.03 sBTC releases. Final delivery → 0.01 sBTC releases.',
  },
  {
    title: 'Split Payments',
    plain:
      'Send one payment to many people at once. Define exactly who gets what percentage. One transaction, multiple recipients, zero hassle. Perfect for splitting bills, paying a team, or distributing revenue automatically.',
    technical:
      'Single sBTC transaction routed to multiple principals via the flow-split contract. Supports both fixed percentage splits and pull-based claiming. Composable with streams and escrow.',
    example:
      'A music producer sells a beat for 0.01 sBTC. StackPay automatically splits it: 70% to the producer, 20% to the co-writer, 10% to the mixing engineer. All three wallets receive payment simultaneously.',
  },
  {
    title: 'Yield on Held Payments',
    plain:
      "Earn interest while your money waits. When Bitcoin is held in escrow or waiting to be claimed, it doesn't just sit there — StackPay puts it to work earning yield in the background. The moment it's released, the yield goes with it.",
    technical:
      'sBTC held in payment contracts is automatically routed to Stacks DeFi yield protocols during the hold period. Yield accrues per block and is distributed to a configurable address on release.',
    example:
      "A freelancer's client locks 0.1 sBTC in escrow for a 30-day project. While the work happens, the sBTC earns ~4.8% APY. At delivery, the freelancer receives 0.1 sBTC plus 30 days of yield — roughly 0.000395 sBTC extra, for free.",
  },
  {
    title: 'Payment Requests',
    plain:
      "Create a payment link in seconds. Generate a clean, shareable link with an exact amount, a note about what it's for, and an expiry date. Send it to anyone. They click, they pay. No account needed on their end.",
    technical:
      'On-chain invoice created via flow-invoice contract. Stores amount, memo, expiry block, and optional yield parameters. Resolved by payer via unique invoice ID. Expired invoices auto-cancel and refund.',
    example:
      'A designer sends a client a link: stackpay.app/pay/invoice/INV-0042. The client opens it, sees "Logo Design — 0.005 sBTC — expires in 48 hours", connects their wallet, and pays in one click.',
  },
];

function FeatureCardsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      className="py-24 px-6 md:px-20 border-t"
      style={{ borderColor: 'var(--bg-border)' }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.p
          className="text-xs uppercase tracking-widest mb-4 font-mono"
          style={{ color: 'var(--accent)' }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          What You Can Do
        </motion.p>
        <motion.h2
          className="text-3xl md:text-[40px] font-bold mb-14 leading-tight"
          style={{ fontFamily: 'var(--font-syne)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Five ways to make your ₿itcoin work harder.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURE_CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              className="rounded-xl border p-6 cursor-default flex flex-col gap-3"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--bg-border)',
              }}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.15 + i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -4 }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderTopColor = 'var(--accent)';
                el.style.boxShadow = '0 0 20px var(--accent-glow)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderTopColor = 'var(--bg-border)';
                el.style.boxShadow = 'none';
              }}
            >
              <h3
                className="text-base font-semibold"
                style={{ fontFamily: 'var(--font-syne)', color: 'var(--text-primary)' }}
              >
                {card.title}
              </h3>

              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {card.plain}
              </p>

              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {card.technical}
              </p>

              <div
                className="border-l-2 pl-3 mt-1"
                style={{ borderColor: 'var(--accent)' }}
              >
                <p
                  className="text-xs leading-relaxed italic"
                  style={{ color: 'var(--text-dim)' }}
                >
                  <span style={{ color: 'var(--text-secondary)', fontStyle: 'normal', fontWeight: 600 }}>
                    Example:{' '}
                  </span>
                  {card.example}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 6 — Who It's For ─────────────────────────────────────────────────

const PERSONAS = [
  {
    title: 'Freelancers & Remote Workers',
    body: "Get paid from anywhere in the world without losing 8% to transfer fees. Create a payment link, share it, get paid in Bitcoin. Set up milestone escrow so clients can't disappear without paying. Stream your retainer by the hour.",
  },
  {
    title: 'Teams & DAOs',
    body: 'Pay contributors automatically. Stream salaries, split revenue, manage treasury payments — all without a bank account or a payroll service. Every payment is on-chain, transparent, and trustless.',
  },
  {
    title: 'Developers',
    body: 'StackPay is open payment infrastructure. Integrate streaming, escrow, and split payments into your app with a single SDK import. Build on top of battle-tested Clarity contracts without writing your own.',
  },
];

function WhoItsForSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      className="py-24 px-6 md:px-20 border-t"
      style={{ borderColor: 'var(--bg-border)' }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.p
          className="text-xs uppercase tracking-widest mb-4 font-mono"
          style={{ color: 'var(--accent)' }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          Built For You
        </motion.p>
        <motion.h2
          className="text-3xl md:text-[40px] font-bold mb-14 leading-tight"
          style={{ fontFamily: 'var(--font-syne)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Whoever you are, StackPay works for you.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PERSONAS.map((persona, i) => (
            <motion.div
              key={persona.title}
              className="rounded-xl border p-6 cursor-default"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--bg-border)',
              }}
              initial={{ opacity: 0, rotateY: 90 }}
              animate={inView ? { opacity: 1, rotateY: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.2 + i * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ scale: 1.02 }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = 'var(--accent)';
                el.style.boxShadow = '0 0 20px var(--accent-glow)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = 'var(--bg-border)';
                el.style.boxShadow = 'none';
              }}
            >
              <h3
                className="text-base font-semibold mb-3"
                style={{ fontFamily: 'var(--font-syne)', color: 'var(--text-primary)' }}
              >
                {persona.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {persona.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 7 — Final CTA ────────────────────────────────────────────────────

function FinalCTASection() {
  return (
    <section
      className="relative py-32 px-6 md:px-20 min-h-[50vh] flex flex-col items-center justify-center text-center border-t overflow-hidden"
      style={{ borderColor: 'var(--bg-border)' }}
    >
      {/* Pulsing orange radial gradient */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(241,90,34,0.12) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-6">
        <motion.h2
          className="text-[48px] md:text-[64px] font-black leading-tight"
          style={{ fontFamily: 'var(--font-syne)' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Your ₿itcoin has been waiting for this.
        </motion.h2>

        <motion.p
          className="text-base md:text-lg leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          Stop settling for slow, expensive, dumb Bitcoin payments. StackPay makes
          your Bitcoin programmable — so it moves exactly when you want, to exactly
          who you choose, under exactly the conditions you set.
        </motion.p>

        <motion.div
          className="flex flex-col items-center gap-4 mt-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <motion.button
            className="h-14 px-10 rounded-lg font-semibold text-white text-base cursor-pointer"
            style={{
              background: 'var(--accent)',
              fontFamily: 'var(--font-syne)',
            }}
            whileHover={{
              boxShadow: '0 0 40px rgba(241,90,34,0.6)',
              scale: 1.04,
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              window.location.href = '/dashboard';
            }}
          >
            Launch App - it&apos;s free, non-custodial, and takes 10 seconds to connect.
          </motion.button>

          {/* Trust signals */}
          <div className="flex flex-wrap justify-center gap-6 mt-2">
            {['Non-custodial', 'Built on Bitcoin', 'Open source'].map((signal) => (
              <span key={signal} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {signal}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div
        className="relative z-10 mt-20 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t"
        style={{ borderColor: 'var(--bg-border)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'var(--accent)', fontFamily: 'var(--font-syne)' }}
          >
            SP
          </div>
          <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-syne)' }}>
            <span style={{ color: 'var(--accent)' }}>Stack</span>Pay
          </span>
          <span className="text-sm mx-2" style={{ color: 'var(--text-dim)' }}>•</span>
          <span className="text-sm" style={{ color: 'var(--text-dim)' }}>Built on Stacks</span>
        </div>
        <div className="flex gap-6">
          {['Docs', 'GitHub'].map((link) => (
            <a
              key={link}
              href="#"
              className="text-xs transition-colors hover:text-[var(--accent)]"
              style={{ color: 'var(--text-dim)' }}
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function LandingScreen() {
  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      <ScrollProgressBar />
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <FeatureCardsSection />
      <WhoItsForSection />
      <FinalCTASection />
    </main>
  );
}
