'use client';

import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import GrowingTree from '@/components/animations/GrowingTree';
import { mockYield } from '@/lib/mock-data';

export default function YieldScreen() {
  const yieldPct = (mockYield.earned / mockYield.deposited) * 100;

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: 'var(--font-syne)', color: 'var(--text-primary)' }}
        >
          Yield
        </h1>
        <p className="text-xs mb-8" style={{ color: 'var(--text-secondary)' }}>
          Earn yield on your idle sBTC holdings.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tree animation */}
          <div className="flex flex-col items-center gap-6">
            <GrowingTree yieldPercent={yieldPct * 10} />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 w-full">
              {[
                { label: 'Deposited', value: `${mockYield.deposited} sBTC`, color: 'var(--text-primary)' },
                { label: 'Earned', value: `+${mockYield.earned} sBTC`, color: 'var(--green)' },
                { label: 'APY', value: `${mockYield.apy}%`, color: 'var(--accent)' },
                { label: 'Days Active', value: `${mockYield.daysActive}d`, color: 'var(--blue)' },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="rounded-xl border p-3"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--bg-border)' }}
                >
                  <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {label}
                  </div>
                  <div
                    className="text-lg font-bold font-mono"
                    style={{ color }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Deposit / Withdraw */}
            <div className="flex gap-3 w-full">
              <Button variant="accent" size="md" className="flex-1">
                <TrendingUp size={14} />
                Deposit
              </Button>
              <Button variant="outline" size="md" className="flex-1">
                <TrendingDown size={14} />
                Withdraw
              </Button>
            </div>
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>30-Day Yield History</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={mockYield.history}>
                  <XAxis
                    dataKey="day"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => v.toFixed(4)}
                    width={55}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--bg-border)',
                      borderRadius: 8,
                      color: 'var(--text-primary)',
                      fontSize: 11,
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [`${Number(value).toFixed(6)} sBTC`, 'Earned']}
                    labelFormatter={(l) => `Day ${l}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="earned"
                    stroke="var(--green)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: 'var(--green)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
