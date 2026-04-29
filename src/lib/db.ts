// ============================================================
// DATABASE LAYER - Uses localStorage as persistent storage
// In production: Replace with PostgreSQL/MySQL via API routes
// ============================================================

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  balance: number;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  createdAt: string;
  lastLogin: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw' | 'bet_win' | 'bet_loss';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  proofImage?: string;
  bankName?: string;
  bankAccount?: string;
  bankHolder?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BetRecord {
  id: string;
  userId: string;
  username: string;
  choice: 'heads' | 'tails';
  result: 'heads' | 'tails';
  amount: number;
  win: boolean;
  payout: number;
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  siteMode: 'fair' | 'admin_wins' | 'user_wins';
  minBet: number;
  maxBet: number;
  winMultiplier: number;
  maintenanceMode: boolean;
  depositBank: string;
  depositAccount: string;
  depositHolder: string;
  depositInstructions: string;
  welcomeBonus: number;
  maxWithdraw: number;
  minWithdraw: number;
  minDeposit: number;
}

const DB_KEYS = {
  users: 'ht_users',
  transactions: 'ht_transactions',
  bets: 'ht_bets',
  settings: 'ht_settings',
  session: 'ht_session',
};

// Simple hash function (in production use bcrypt)
export function hashPassword(password: string): string {
  let hash = 0;
  const salt = 'HT_SALT_2024_SECURE';
  const str = password + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36) + str.length.toString(36);
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Initialize DB with defaults
export function initDB(): void {
  if (!localStorage.getItem(DB_KEYS.users)) {
    const adminUser: User = {
      id: 'admin_001',
      username: 'admin',
      email: 'admin@headtail.game',
      passwordHash: hashPassword('Hasilku!'),
      balance: 999999,
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    localStorage.setItem(DB_KEYS.users, JSON.stringify([adminUser]));
  }

  if (!localStorage.getItem(DB_KEYS.transactions)) {
    localStorage.setItem(DB_KEYS.transactions, JSON.stringify([]));
  }

  if (!localStorage.getItem(DB_KEYS.bets)) {
    localStorage.setItem(DB_KEYS.bets, JSON.stringify([]));
  }

  if (!localStorage.getItem(DB_KEYS.settings)) {
    const defaultSettings: SiteSettings = {
      siteName: 'HeadTail.Game',
      siteMode: 'fair',
      minBet: 5000,
      maxBet: 1000000,
      winMultiplier: 1.95,
      maintenanceMode: false,
      depositBank: 'BCA',
      depositAccount: '1234567890',
      depositHolder: 'PT HeadTail Game',
      depositInstructions: 'Transfer ke rekening di atas, lalu upload bukti transfer.',
      welcomeBonus: 0,
      maxWithdraw: 10000000,
      minWithdraw: 50000,
      minDeposit: 10000,
    };
    localStorage.setItem(DB_KEYS.settings, JSON.stringify(defaultSettings));
  }
}

// Users
export const usersDB = {
  getAll: (): User[] => JSON.parse(localStorage.getItem(DB_KEYS.users) || '[]'),
  getById: (id: string): User | null => {
    return usersDB.getAll().find(u => u.id === id) || null;
  },
  getByUsername: (username: string): User | null => {
    return usersDB.getAll().find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
  },
  getByEmail: (email: string): User | null => {
    return usersDB.getAll().find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },
  create: (data: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): User => {
    const users = usersDB.getAll();
    const newUser: User = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(DB_KEYS.users, JSON.stringify(users));
    return newUser;
  },
  update: (id: string, data: Partial<User>): User | null => {
    const users = usersDB.getAll();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...data };
    localStorage.setItem(DB_KEYS.users, JSON.stringify(users));
    return users[idx];
  },
  updateBalance: (id: string, amount: number): User | null => {
    const user = usersDB.getById(id);
    if (!user) return null;
    return usersDB.update(id, { balance: user.balance + amount });
  },
};

// Transactions
export const transactionsDB = {
  getAll: (): Transaction[] => JSON.parse(localStorage.getItem(DB_KEYS.transactions) || '[]'),
  getByUser: (userId: string): Transaction[] => {
    return transactionsDB.getAll().filter(t => t.userId === userId);
  },
  getPending: (): Transaction[] => {
    return transactionsDB.getAll().filter(t => t.status === 'pending');
  },
  create: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction => {
    const txns = transactionsDB.getAll();
    const newTxn: Transaction = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    txns.push(newTxn);
    localStorage.setItem(DB_KEYS.transactions, JSON.stringify(txns));
    return newTxn;
  },
  update: (id: string, data: Partial<Transaction>): Transaction | null => {
    const txns = transactionsDB.getAll();
    const idx = txns.findIndex(t => t.id === id);
    if (idx === -1) return null;
    txns[idx] = { ...txns[idx], ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem(DB_KEYS.transactions, JSON.stringify(txns));
    return txns[idx];
  },
};

// Bets
export const betsDB = {
  getAll: (): BetRecord[] => JSON.parse(localStorage.getItem(DB_KEYS.bets) || '[]'),
  getByUser: (userId: string): BetRecord[] => {
    return betsDB.getAll().filter(b => b.userId === userId);
  },
  getRecent: (limit = 20): BetRecord[] => {
    return betsDB.getAll().slice(-limit).reverse();
  },
  create: (data: Omit<BetRecord, 'id' | 'createdAt'>): BetRecord => {
    const bets = betsDB.getAll();
    const newBet: BetRecord = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    bets.push(newBet);
    localStorage.setItem(DB_KEYS.bets, JSON.stringify(bets));
    return newBet;
  },
};

// Settings
export const settingsDB = {
  get: (): SiteSettings => JSON.parse(localStorage.getItem(DB_KEYS.settings) || '{}'),
  update: (data: Partial<SiteSettings>): SiteSettings => {
    const settings = settingsDB.get();
    const updated = { ...settings, ...data };
    localStorage.setItem(DB_KEYS.settings, JSON.stringify(updated));
    return updated;
  },
};

// Session
export const sessionDB = {
  get: (): { userId: string; role: string } | null => {
    const s = localStorage.getItem(DB_KEYS.session);
    return s ? JSON.parse(s) : null;
  },
  set: (userId: string, role: string): void => {
    localStorage.setItem(DB_KEYS.session, JSON.stringify({ userId, role }));
  },
  clear: (): void => {
    localStorage.removeItem(DB_KEYS.session);
  },
};
