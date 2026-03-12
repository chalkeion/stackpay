"use client";

import { useEffect, useRef, useState } from "react";
import { motion, type Variants, type Easing } from "framer-motion";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Send,
  Activity,
  Lock,
  Split,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import CircuitBoard from "@/components/animations/CircuitBoard";
import LiquidFill from "@/components/animations/LiquidFill";
import { mockTransactions, mockActivityChart } from "@/lib/mock-data";
import { useWalletContext } from "@/context/WalletContext";
import { usePageTransition } from "@/context/TransitionContext";
import { Button } from "@/components/ui/button";
import { getTokenPrices } from "@/lib/getTokensPrices";
import { fetchUserTransactions } from "@/lib/getUserAccountDetails";

function CountUp({
  end,
  decimals = 0,
  prefix = "",
}: {
  end: number;
  decimals?: number;
  prefix?: string;
}) {
  const [val, setVal] = useState(0);
  const ref = useRef(false);

  useEffect(() => {
    ref.current = false;
  }, [end]);

  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    const dur = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setVal(ease * end);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end]);

  return (
    <>
      {prefix}
      {val.toFixed(decimals)}
    </>
  );
}

function BalanceSkeleton({ width = "60%" }: { width?: string }) {
  return (
    <motion.div
      style={{
        height: 22,
        borderRadius: 6,
        background: "rgba(255,255,255,0.08)",
        width,
      }}
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  );
}

const statusColor = (s: string) =>
  s === "success"
    ? "var(--green)"
    : s === "locked"
      ? "var(--amber)"
      : "var(--text-dim)";

const QUICK_ACTIONS = [
  { href: "/send", label: "Send", icon: Send },
  { href: "/stream", label: "Stream", icon: Activity },
  { href: "/escrow", label: "Escrow", icon: Lock },
  { href: "/split", label: "Split", icon: Split },
];

const EASE_OUT: Easing = [0.22, 1, 0.36, 1] as [number, number, number, number];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
};

/* ── not-connected prompt ─────────────────────────────────────────── */

function NotConnectedPrompt() {
  const { openModal } = useWalletContext();

  return (
    <CircuitBoard>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          padding: 32,
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: "rgba(241,90,34,0.1)",
            border: "1px solid rgba(241,90,34,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Wallet size={32} style={{ color: "var(--accent)" }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: EASE_OUT }}
        >
          <h2
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 700,
              fontSize: 24,
              color: "var(--text-primary)",
              margin: "0 0 8px",
            }}
          >
            Connect Your Wallet
          </h2>
          <p
            style={{
              fontFamily: "var(--font-ibm-plex-mono)",
              fontSize: 14,
              color: "var(--text-secondary)",
              margin: 0,
              maxWidth: 340,
            }}
          >
            Connect a Stacks wallet to view your dashboard, balances, and
            transaction history.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4, ease: EASE_OUT }}
        >
          <Button variant="accent" size="lg" onClick={openModal}>
            Connect Wallet
          </Button>
        </motion.div>
      </div>
    </CircuitBoard>
  );
}

/* ── connected dashboard ─────────────────────────────────────────── */

export default function DashboardScreen() {
  const [prices, setPrices] = useState({ stx: 0, btc: 0 })
  const [transactions, setTransactions] = useState<{txId: string, amount: string, type: string, timestamp: string, status: string, sender: string, recipient: string}[]>([])
  const { isConnected, address, stxBalance, sbtcBalance } = useWalletContext();
  const { disconnectPhase } = usePageTransition();

  useEffect(() => {
    if(!address) return;
    getTokenPrices().then(setPrices)
    fetchUserTransactions(address).then(
      (res) => {
        setTransactions(res.transactions)
        console.log("the transactions", res.transactions)
      }
    )
  }, [address])
  
  if (!isConnected) return <NotConnectedPrompt />;
  

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  const sbtcVal = sbtcBalance ?? 0;
  const stxVal = stxBalance ?? 0;
  const fillPct = Math.min((sbtcVal / 0.1) * 100, 100);
  const usdValue = (sbtcVal * prices.btc) + (stxVal * prices.stx);

  return (
    <>
      {/* Grayscale wrapper — kicks in at disconnect phase 1 */}
      <motion.div
        style={{ width: "100%", height: "100%", overflow: "hidden" }}
        animate={
          disconnectPhase >= 1
            ? { filter: "saturate(0)" }
            : { filter: "saturate(1)" }
        }
        transition={{ duration: 0.5, ease: "easeIn" }}
      >
        <motion.div
          className="flex-1 p-4 md:p-6 overflow-y-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between mb-4 md:mb-6"
          >
            <div>
              <h1
                className="font-bold"
                style={{
                  fontFamily: "var(--font-syne)",
                  color: "var(--text-primary)",
                  fontSize: "var(--text-section)",
                }}
              >
                Dashboard
              </h1>
              <p
                className="text-xs mt-0.5 font-mono"
                style={{ color: "var(--text-secondary)" }}
              >
                {shortAddress}
              </p>
            </div>
            <div
              className="px-3 py-1.5 rounded-lg text-xs font-mono border"
              style={{
                borderColor: "var(--green)",
                color: "var(--green)",
                background: "rgba(34,197,94,0.08)",
              }}
            >
              Testnet
            </div>
          </motion.div>

          {/* Balance + Stats row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
            {/* Liquid fill balance */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="flex flex-col items-center py-6 gap-2">
                <CardTitle className="mb-2">sBTC Balance</CardTitle>
                <div className="anim-scale">
                  {sbtcBalance === null ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 12,
                        padding: "20px 0",
                      }}
                    >
                      <BalanceSkeleton width="80px" />
                      <BalanceSkeleton width="60px" />
                    </div>
                  ) : (
                    <LiquidFill
                      fillPercent={fillPct}
                      value={sbtcVal}
                      label="sBTC"
                      width={180}
                      height={180}
                    />
                  )}
                </div>
                <div
                  className="mt-2 text-xs font-mono"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {sbtcBalance === null ? (
                    <BalanceSkeleton width="120px" />
                  ) : (
                    `≈ $${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD`
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Mini stat cards */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-3 grid grid-cols-2 md:grid-cols-2 gap-3"
            >
              {[
                {
                  label: "STX Balance",
                  value: stxVal,
                  decimals: 2,
                  suffix: " STX",
                  loading: stxBalance === null,
                },
                {
                  label: "USD Value",
                  value: usdValue,
                  decimals: 2,
                  prefix: "$",
                  loading: sbtcBalance === null,
                },
                {
                  label: "Transactions",
                  value: transactions.length,
                  decimals: 0,
                  loading: false,
                },
                {
                  label: "Active Streams",
                  value: 0,
                  decimals: 0,
                  loading: false,
                },
              ].map(({ label, value, decimals, suffix, prefix, loading }) => (
                <Card key={label} className="flex flex-col justify-between p-4">
                  <div
                    className="text-xs uppercase tracking-wider mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {label}
                  </div>
                  <div
                    className="text-xl font-bold"
                    style={{
                      fontFamily: "var(--font-syne)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {loading ? (
                      <BalanceSkeleton width="70%" />
                    ) : (
                      <>
                        <CountUp
                          end={value}
                          decimals={decimals}
                          prefix={prefix ?? ""}
                        />
                        {suffix ?? ""}
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </motion.div>
          </div>

          {/* Activity chart + Quick actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>7-Day Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={mockActivityChart}>
                      <defs>
                        <linearGradient
                          id="areaGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#F15A22"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#F15A22"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="day"
                        tick={{ fill: "var(--text-secondary)", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--bg-border)",
                          borderRadius: 8,
                          color: "var(--text-primary)",
                          fontSize: 11,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="volume"
                        stroke="#F15A22"
                        strokeWidth={2}
                        fill="url(#areaGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick actions */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 gap-3"
            >
              {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}>
                  <motion.div
                    className="h-full min-h-[80px] rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200"
                    style={{
                      background: "var(--bg-surface)",
                      borderColor: "var(--bg-border)",
                    }}
                    whileHover={{
                      borderColor: "var(--accent)",
                      boxShadow: "0 0 16px var(--accent-glow)",
                      y: -2,
                    }}
                  >
                    <Icon size={20} style={{ color: "var(--accent)" }} />
                    <span
                      className="text-xs font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {label}
                    </span>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          </div>

          {/* Activity feed */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {transactions.map((tx, i) => (
                    <motion.div
                      key={tx.txId}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                      style={{
                        background: "var(--bg-elevated)",
                        borderColor: "var(--bg-border)",
                      }}
                      initial={{ opacity: 0, rotateY: 90 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "var(--bg-surface)" }}
                      >
                        {!(tx.sender === address) ? (
                          <ArrowDownLeft
                            size={14}
                            style={{ color: "var(--green)" }}
                          />
                        ) : (
                          <ArrowUpRight
                            size={14}
                            style={{ color: "var(--accent)" }}
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-semibold uppercase tracking-wider"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {tx.type}
                          </span>
                          <motion.div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: statusColor(tx.status) }}
                            animate={{
                              opacity: tx.status === "success" ? [1, 0.3, 1] : 1,
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: tx.status === "success" ? Infinity : 0,
                            }}
                          />
                        </div>
                        <div
                          className="text-xs font-mono truncate mt-0.5"
                          style={{ color: "var(--text-dim)" }}
                        >
                          {!(tx.sender === address) ? tx.sender : tx.recipient}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div
                          className="text-sm font-mono font-semibold"
                          style={{
                            color:
                              !(tx.sender === address)
                                ? "var(--green)"
                                : "var(--text-primary)",
                          }}
                        >
                          {(tx.sender === address) ? "-" : "+"}
                          {tx.amount} sBTC
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: "var(--text-dim)" }}
                        >
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}
