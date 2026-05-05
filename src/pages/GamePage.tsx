import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { settingsDB } from '../lib/db';
import CoinFlip from '../components/CoinFlip';
import { Wallet, TrendingUp, TrendingDown, History, Zap } from 'lucide-react';

export default function GamePage() {
  const { user, refreshUser } = useAuthStore();
  const { isFlipping, lastResult, lastWin, lastPayout, recentBets, loadRecentBets, placeBet } = useGameStore();
  const [choice, setChoice] = useState<'heads' | 'tails' | null>(null);
  const [betAmount, setBetAmount] = useState('');
  const [showResult, setShowResult] = useState(false);
  const settings = settingsDB.get();

  useEffect(() => {
    loadRecentBets();
  }, []);

  useEffect(() => {
    if (lastResult !== null) {
      setShowResult(true);
      refreshUser();
      loadRecentBets();
      const t = setTimeout(() => setShowResult(false), 3000);
      return () => clearTimeout(t);
    }
  }, [lastResult]);

  const formatIDR = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  const handleBet = async () => {
    if (!user || !choice || isFlipping) return;
    const amount = parseInt(betAmount.replace(/\D/g, ''));
    if (isNaN(amount) || amount < settings.minBet || amount > settings.maxBet) return;
    if (amount > user.balance) return;
    await placeBet(user.id, user.username, choice, amount);
  };

  const quickAmounts = [500, 1000, 2000, 10000, 50000, 2000000];

  const userBets = user ? recentBets.filter(b => b.userId === user.id) : [];
  const totalWins = userBets.filter(b => b.win).length;
  const totalLosses = userBets.filter(b => !b.win).length;

  return (
    <div className="min-h-screen pt-20 pb-10 px-4" style={{ background: '#080810' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black" style={{ color: '#fff' }}>Klik Pilih Menang</h1>
          <p className="text-sm mt-1" style={{ color: '#888' }}>Pilih sisi Gambar dan menangkan {settings.winMultiplier}x reward Anda</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-2 space-y-5">
            {/* Balance Card */}
            <div className="game-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5" style={{ color: '#ffd700' }} />
                  <span style={{ color: '#888' }}>Saldo Anda</span>
                </div>
                <div className="text-2xl font-black" style={{ color: '#ffd700' }}>
                  {formatIDR(user?.balance || 0)}
                </div>
              </div>
            </div>

            {/* Coin */}
            <div className="game-card flex flex-col items-center py-10">
              <CoinFlip isFlipping={isFlipping} result={lastResult} />

              {/* Result Overlay */}
              <AnimatePresence>
                {showResult && lastResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="mt-6 text-center"
                  >
                    <div className="text-5xl mb-2">{lastWin ? '🎉' : '😢'}</div>
                    <div className="text-2xl font-black" style={{ color: lastWin ? '#00c864' : '#ff4444' }}>
                      {lastWin ? `MENANG! +${formatIDR(lastPayout)}` : 'KALAH!'}
                    </div>
                    <div className="text-sm mt-1" style={{ color: '#888' }}>
                      Hasil: {lastResult === 'heads' ? '👑 HEAD' : '⚡ TAIL'}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {isFlipping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center">
                  <div className="text-lg font-bold" style={{ color: '#ffd700' }}>Mengocok koin...</div>
                </motion.div>
              )}
            </div>

            {/* Choice */}
            <div className="game-card">
              <label className="block text-sm font-semibold mb-3" style={{ color: '#888' }}>PILIH SISI GAMBAR</label>
              <div className="grid grid-cols-2 gap-4">
                {(['heads', 'tails'] as const).map(side => (
                  <motion.button
                    key={side}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setChoice(side)}
                    disabled={isFlipping}
                    className="choice-btn"
                    style={{
                      background: choice === side
                        ? side === 'heads' ? 'linear-gradient(135deg, rgba(255,215,0,0.3), rgba(255,149,0,0.2))' : 'linear-gradient(135deg, rgba(150,150,255,0.3), rgba(100,100,200,0.2))'
                        : 'rgba(255,255,255,0.03)',
                      border: choice === side
                        ? side === 'heads' ? '2px solid #ffd700' : '2px solid #9999ff'
                        : '2px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <span className="text-3xl">{side === 'heads' ? '👑' : '⚡'}</span>
                    <span className="font-bold mt-1" style={{ color: '#fff' }}>{side === 'heads' ? 'HEAD' : 'TAIL'}</span>
                    <span className="text-xs" style={{ color: '#888' }}>50%</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Bet Amount */}
            <div className="game-card">
              <label className="block text-sm font-semibold mb-3" style={{ color: '#888' }}>JUMLAH REWARD</label>
              <div className="relative mb-3">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: '#888' }}>Rp</span>
                <input
                  type="text"
                  value={betAmount}
                  onChange={e => setBetAmount(e.target.value.replace(/\D/g, ''))}
                  className="form-input pl-10"
                  placeholder={`Min. ${formatIDR(settings.minBet)}`}
                  disabled={isFlipping}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {quickAmounts.map(amt => (
                  <button key={amt} onClick={() => setBetAmount(amt.toString())} disabled={isFlipping}
                    className="quick-btn">
                    {amt >= 1000000 ? `${amt / 1000000}JT` : `${amt / 1000}K`}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setBetAmount(String(Math.floor((user?.balance || 0) / 2)))} disabled={isFlipping}
                  className="quick-btn flex-1">½ Saldo</button>
                <button onClick={() => setBetAmount(String(user?.balance || 0))} disabled={isFlipping}
                  className="quick-btn flex-1">Max</button>
              </div>
            </div>

            {/* Bet Button */}
            <motion.button
              whileHover={{ scale: isFlipping ? 1 : 1.02 }}
              whileTap={{ scale: isFlipping ? 1 : 0.98 }}
              onClick={handleBet}
              disabled={isFlipping || !choice || !betAmount || parseInt(betAmount) < settings.minBet}
              className="w-full py-4 rounded-2xl font-black text-xl transition-all"
              style={{
                background: isFlipping || !choice || !betAmount
                  ? 'rgba(255,255,255,0.05)'
                  : 'linear-gradient(135deg, #ffd700, #ff9500)',
                color: isFlipping || !choice || !betAmount ? '#555' : '#000',
                cursor: isFlipping || !choice || !betAmount ? 'not-allowed' : 'pointer',
              }}
            >
              {isFlipping ? (
                <span className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5 animate-spin" />
                  Sedang Melempar...
                </span>
              ) : '🎲 LEMPAR KOIN!'}
            </motion.button>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Stats */}
            <div className="game-card">
              <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#fff' }}>
                <TrendingUp className="w-4 h-4" style={{ color: '#ffd700' }} />
                Statistik Sesi
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span style={{ color: '#888' }}>Total Reward</span>
                  <span className="font-bold" style={{ color: '#fff' }}>{userBets.length}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#888' }}>Menang</span>
                  <span className="font-bold" style={{ color: '#00c864' }}>{totalWins}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#888' }}>Kalah</span>
                  <span className="font-bold" style={{ color: '#ff4444' }}>{totalLosses}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#888' }}>Win Rate</span>
                  <span className="font-bold" style={{ color: '#ffd700' }}>
                    {userBets.length > 0 ? Math.round((totalWins / userBets.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Bets */}
            <div className="game-card">
              <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#fff' }}>
                <History className="w-4 h-4" style={{ color: '#ffd700' }} />
            Histori Permainan
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentBets.length === 0 ? (
                  <p className="text-xs text-center py-4" style={{ color: '#555' }}>Belum ada reward</p>
                ) : (
                  recentBets.map((bet, i) => (
                    <motion.div key={bet.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      className="flex items-center justify-between py-2 px-3 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div>
                        <span className="text-xs font-semibold" style={{ color: '#fff' }}>{bet.username}</span>
                        <div className="text-xs" style={{ color: '#666' }}>{bet.result === 'heads' ? '👑' : '⚡'} {bet.result}</div>
                      </div>
                      <div className="text-xs font-bold" style={{ color: bet.win ? '#00c864' : '#ff4444' }}>
                        {bet.win ? '+' : '-'}{formatIDR(bet.win ? bet.payout : bet.amount)}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Game Rules */}
            <div className="game-card">
              <h3 className="font-bold mb-3" style={{ color: '#fff' }}>📜 Aturan</h3>
              <ul className="space-y-2 text-xs" style={{ color: '#888' }}>
                <li>• Pilih HEAD (👑) atau TAIL (⚡)</li>
                <li>• Menang = {settings.winMultiplier}x Reward</li>
                <li>• Min Reward: {formatIDR(settings.minBet)}</li>
                <li>• Max Reward: {formatIDR(settings.maxBet)}</li>
                <li>• Hasil langsung ke saldo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
