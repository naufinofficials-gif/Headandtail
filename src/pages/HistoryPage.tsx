import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { betsDB, transactionsDB } from '../lib/db';
import { History, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export default function HistoryPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'bets' | 'transactions'>('bets');

  const bets = user ? betsDB.getByUser(user.id).reverse() : [];
  const transactions = user ? transactionsDB.getByUser(user.id).reverse() : [];

  const formatIDR = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const totalWinnings = bets.filter(b => b.win).reduce((s, b) => s + b.payout, 0);
  const totalLost = bets.filter(b => !b.win).reduce((s, b) => s + b.amount, 0);

  return (
    <div className="min-h-screen pt-24 pb-10 px-4" style={{ background: '#080810' }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black" style={{ color: '#fff' }}>Riwayat</h1>
          <p className="text-sm mt-1" style={{ color: '#888' }}>Semua aktivitas akun Anda</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="stat-card text-center">
            <div className="text-lg font-black" style={{ color: '#fff' }}>{bets.length}</div>
            <div className="text-xs" style={{ color: '#888' }}>Total Bet</div>
          </div>
          <div className="stat-card text-center">
            <div className="text-lg font-black" style={{ color: '#00c864' }}>{formatIDR(totalWinnings)}</div>
            <div className="text-xs" style={{ color: '#888' }}>Total Menang</div>
          </div>
          <div className="stat-card text-center">
            <div className="text-lg font-black" style={{ color: '#ff4444' }}>{formatIDR(totalLost)}</div>
            <div className="text-xs" style={{ color: '#888' }}>Total Kalah</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['bets', 'transactions'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: tab === t ? 'linear-gradient(135deg, #ffd700, #ff9500)' : 'rgba(255,255,255,0.05)',
                color: tab === t ? '#000' : '#888',
              }}>
              {t === 'bets' ? '🎲 Taruhan' : '💰 Deposit/Withdraw'}
            </button>
          ))}
        </div>

        {/* Bets Table */}
        {tab === 'bets' && (
          <div className="space-y-2">
            {bets.length === 0 ? (
              <div className="text-center py-16" style={{ color: '#555' }}>Belum ada taruhan</div>
            ) : bets.map((bet, i) => (
              <motion.div key={bet.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${bet.win ? 'rgba(0,200,100,0.15)' : 'rgba(255,68,68,0.1)'}` }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{bet.result === 'heads' ? '👑' : '⚡'}</span>
                  <div>
                    <div className="text-sm font-bold" style={{ color: '#fff' }}>
                      Pilih {bet.choice === 'heads' ? 'HEAD' : 'TAIL'} → Hasil {bet.result === 'heads' ? 'HEAD' : 'TAIL'}
                    </div>
                    <div className="text-xs" style={{ color: '#666' }}>{formatDate(bet.createdAt)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold" style={{ color: bet.win ? '#00c864' : '#ff4444' }}>
                    {bet.win ? '+' + formatIDR(bet.payout) : '-' + formatIDR(bet.amount)}
                  </div>
                  <div className="text-xs px-2 py-0.5 rounded-full" style={{ background: bet.win ? 'rgba(0,200,100,0.15)' : 'rgba(255,68,68,0.15)', color: bet.win ? '#00c864' : '#ff4444' }}>
                    {bet.win ? 'MENANG' : 'KALAH'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Transactions */}
        {tab === 'transactions' && (
          <div className="space-y-2">
            {transactions.length === 0 ? (
              <div className="text-center py-16" style={{ color: '#555' }}>Belum ada transaksi</div>
            ) : transactions.map((txn, i) => {
              const statusColors = { pending: '#ffd700', approved: '#00c864', rejected: '#ff4444' };
              const typeLabels: Record<string, string> = { deposit: '⬆️ Deposit', withdraw: '⬇️ Withdraw', bet_win: '🎉 Menang', bet_loss: '💀 Kalah' };
              return (
                <motion.div key={txn.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <div className="text-sm font-bold" style={{ color: '#fff' }}>{typeLabels[txn.type] || txn.type}</div>
                    <div className="text-xs" style={{ color: '#666' }}>{formatDate(txn.createdAt)}</div>
                    {txn.adminNote && <div className="text-xs mt-1" style={{ color: '#888' }}>{txn.adminNote}</div>}
                  </div>
                  <div className="text-right">
                    <div className="font-bold" style={{ color: txn.type === 'deposit' || txn.type === 'bet_win' ? '#00c864' : '#ff4444' }}>
                      {txn.type === 'deposit' || txn.type === 'bet_win' ? '+' : ''}{formatIDR(Math.abs(txn.amount))}
                    </div>
                    <div className="text-xs" style={{ color: statusColors[txn.status] }}>
                      {txn.status === 'pending' ? 'Menunggu' : txn.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
