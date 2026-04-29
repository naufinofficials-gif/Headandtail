import { create } from 'zustand';
import { betsDB, usersDB, transactionsDB, settingsDB, BetRecord } from '../lib/db';

interface GameState {
  isFlipping: boolean;
  lastResult: 'heads' | 'tails' | null;
  lastWin: boolean | null;
  lastPayout: number;
  recentBets: BetRecord[];
  loadRecentBets: () => void;
  placeBet: (userId: string, username: string, choice: 'heads' | 'tails', amount: number) => Promise<{ win: boolean; result: 'heads' | 'tails'; payout: number } | null>;
}

export const useGameStore = create<GameState>((set, get) => ({
  isFlipping: false,
  lastResult: null,
  lastWin: null,
  lastPayout: 0,
  recentBets: [],

  loadRecentBets: () => {
    set({ recentBets: betsDB.getRecent(15) });
  },

  placeBet: async (userId, username, choice, amount) => {
    const user = usersDB.getById(userId);
    const settings = settingsDB.get();

    if (!user || user.balance < amount) return null;
    if (amount < settings.minBet || amount > settings.maxBet) return null;

    set({ isFlipping: true, lastResult: null, lastWin: null });

    // Deduct bet from balance immediately
    usersDB.updateBalance(userId, -amount);

    // Simulate flip delay
    await new Promise(r => setTimeout(r, 2200));

    // Determine result based on site mode
    let result: 'heads' | 'tails';
    const random = Math.random();

    if (settings.siteMode === 'admin_wins') {
      // Admin always wins = user always loses
      result = choice === 'heads' ? 'tails' : 'heads';
    } else if (settings.siteMode === 'user_wins') {
      // User always wins
      result = choice;
    } else {
      // Fair 50/50
      result = random < 0.5 ? 'heads' : 'tails';
    }

    const win = result === choice;
    const payout = win ? Math.floor(amount * settings.winMultiplier) : 0;

    if (win) {
      usersDB.updateBalance(userId, payout);
      transactionsDB.create({
        userId,
        type: 'bet_win',
        amount: payout,
        status: 'approved',
      });
    } else {
      transactionsDB.create({
        userId,
        type: 'bet_loss',
        amount: -amount,
        status: 'approved',
      });
    }

    const bet = betsDB.create({
      userId,
      username,
      choice,
      result,
      amount,
      win,
      payout,
    });

    set({
      isFlipping: false,
      lastResult: result,
      lastWin: win,
      lastPayout: payout,
      recentBets: betsDB.getRecent(15),
    });

    return { win, result, payout };
  },
}));
