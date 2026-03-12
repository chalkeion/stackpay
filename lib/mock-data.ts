export const mockTransactions = [
  {
    id: '0x1a2b...',
    type: 'stream',
    direction: 'incoming',
    amount: 0.001,
    from: 'SP3K...',
    status: 'active',
    timestamp: Date.now() - 60000,
  },
  {
    id: '0x3c4d...',
    type: 'escrow',
    direction: 'outgoing',
    amount: 0.025,
    to: 'SP7M...',
    status: 'locked',
    timestamp: Date.now() - 3600000,
  },
  {
    id: '0x5e6f...',
    type: 'split',
    direction: 'incoming',
    amount: 0.008,
    from: 'SP1N...',
    status: 'complete',
    timestamp: Date.now() - 86400000,
  },
];

export const mockStream = {
  id: 'stream-001',
  recipient: 'SP3KN...8QR',
  ratePerMinute: 0.0001,
  totalStreamed: 0.00423,
  startedAt: Date.now() - 2520000,
  status: 'active',
};

export const mockEscrow = {
  id: 'escrow-001',
  amount: 0.05,
  recipient: 'SP7MN...2XY',
  milestones: [
    { label: 'Design approved', amount: 0.01, complete: true },
    { label: 'Development done', amount: 0.03, complete: true },
    { label: 'Final delivery', amount: 0.01, complete: false },
  ],
  status: 'in-progress',
};

export const mockYield = {
  deposited: 0.1,
  earned: 0.00412,
  apy: 4.8,
  daysActive: 42,
  history: Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    earned: parseFloat((0.00412 * (i + 1) / 30).toFixed(6)),
  })),
};

export const mockSplit = {
  total: 0.05,
  recipients: [
    { address: 'SP3KN...8QR', shortAddress: 'SP3KN...8QR', percentage: 50, amount: 0.025 },
    { address: 'SP7MN...2XY', shortAddress: 'SP7MN...2XY', percentage: 30, amount: 0.015 },
    { address: 'SP1NA...4AB', shortAddress: 'SP1NA...4AB', percentage: 20, amount: 0.010 },
  ],
};

export const mockActivityChart = Array.from({ length: 7 }, (_, i) => ({
  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  volume: parseFloat((Math.random() * 0.05 + 0.01).toFixed(4)),
  transactions: Math.floor(Math.random() * 8 + 1),
}));
