import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { usersDB, transactionsDB, betsDB, settingsDB, Transaction } from '../../lib/db';
import { showToast } from '../../components/Toast';
import {
  Users, TrendingUp, DollarSign, Settings, CheckCircle, XCircle,
  BarChart3, Shield, Sliders, Bell, LogOut, RefreshCw, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Tab = 'overview' | 'deposits' | 'withdrawals' | 'users' | 'bets' | 'settings';

export default function AdminDashboard() {
  const { user, logout, refreshUser } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [settings, setSettings] = useState(settingsDB.get());
  const [refresh, setRefresh] = useState(0);

  const users = usersDB.getAll().filter(u => u.role !== 'admin');
  const allTxns = transactionsDB.getAll();
  const pendingDeposits = allTxns.filter(t => t.type === 'deposit' && t.status === 'pending');
  const pendingWithdraws = allTxns.filter(t => t.type === 'withdraw' && t.status === 'pending');
  const allBets = betsDB.getAll();

  const totalDeposited = allTxns.filter(t => t.type === 'deposit' && t.status === 'approved').reduce((s, t) => s + t.amount, 0);
  const totalWithdrawn = allTxns.filter(t => t.type === 'withdraw' && t.status === 'approved').reduce((s, t) => s + t.amount, 0);
  const totalBets = allBets.reduce((s, b) => s + b.amount, 0);
  const houseProfit = totalBets - allBets.filter(b => b.win).reduce((s, b) => s + b.payout, 0);

  const formatIDR = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  const handleApproveDeposit = (txn: Transaction) => {
    transactionsDB.update(txn.id, { status: 'approved' });
    usersDB.updateBalance(txn.userId, txn.amount);
    showToast(`Deposit ${formatIDR(txn.amount)} disetujui!`, 'success');
    setRefresh(r => r + 1);
  };

  const handleRejectDeposit = (txn: Transaction) => {
    transactionsDB.update(txn.id, { status: 'rejected', adminNote: 'Ditolak oleh admin' });
    showToast('Deposit ditolak.', 'info');
    setRefresh(r => r + 1);
  };

  const handleApproveWithdraw = (txn: Transaction) => {
    const u = usersDB.getById(txn.userId);
    if (!u || u.balance < txn.amount) {
      showToast('Saldo user tidak mencukupi!', 'error');
      return;
    }
    transactionsDB.update(txn.id, { status: 'approved' });
    usersDB.updateBalance(txn.userId, -txn.amount);
    showToast(`Withdraw ${formatIDR(txn.amount)} disetujui!`, 'success');
    setRefresh(r => r + 1);
  };

  const handleRejectWithdraw = (txn: Transaction) => {
    transactionsDB.update(txn.id, { status: 'rejected', adminNote: 'Ditolak oleh admin' });
    showToast('Withdraw ditolak.', 'info');
    setRefresh(r => r + 1);
  };

  const handleSuspendUser = (userId: string, currentStatus: string) => {
    usersDB.update(userId, { status: currentStatus === 'active' ? 'suspended' : 'active' });
    showToast('Status user diperbarui.', 'success');
    setRefresh(r => r + 1);
  };

  const handleSaveSettings = () => {
    settingsDB.update(settings);
    showToast('Pengaturan disimpan!', 'success');
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const tabs: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'deposits', label: 'Deposit', icon: TrendingUp, badge: pendingDeposits.length },
    { id: 'withdrawals', label: 'Withdraw', icon: DollarSign, badge: pendingWithdraws.length },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'bets', label: 'Riwayat Bet', icon: Shield },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#05050f' }}>
      {/* Admin Header */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6" style={{ background: 'rgba(5,5,15,0.97)', borderBottom: '1px solid rgba(255,50,50,0.15)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6" style={{ color: '#ff5555' }} />
          <span className="font-black text-lg" style={{ color: '#fff' }}>Admin Panel</span>
          <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(255,50,50,0.15)', color: '#ff5555' }}>RESTRICTED</span>
        </div>
        <div className="flex items-center gap-4">
          {(pendingDeposits.length + pendingWithdraws.length) > 0 && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.3)' }}>
              <Bell className="w-4 h-4" style={{ color: '#ffd700' }} />
              <span className="text-xs font-bold" style={{ color: '#ffd700' }}>{pendingDeposits.length + pendingWithdraws.length} pending</span>
            </div>
          )}
          <span className="text-sm" style={{ color: '#888' }}>{user?.username}</span>
          <button onClick={handleLogout} className="flex items-center gap-1 text-sm" style={{ color: '#ff5555' }}>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="pt-16 flex">
        {/* Sidebar */}
        <div className="fixed left-0 top-16 bottom-0 w-56 overflow-y-auto" style={{ background: 'rgba(5,5,15,0.98)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="p-4 space-y-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: tab === t.id ? 'rgba(255,50,50,0.15)' : 'transparent',
                  color: tab === t.id ? '#ff5555' : '#888',
                  border: tab === t.id ? '1px solid rgba(255,50,50,0.2)' : '1px solid transparent',
                }}>
                <div className="flex items-center gap-2">
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </div>
                {t.badge ? (
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#ff5555', color: '#fff' }}>{t.badge}</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-56 flex-1 p-6">
          {/* Overview */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black" style={{ color: '#fff' }}>Dashboard Overview</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Member', value: users.length, icon: Users, color: '#4488ff' },
                  { label: 'Total Deposit', value: formatIDR(totalDeposited), icon: TrendingUp, color: '#00c864' },
                  { label: 'Total Withdraw', value: formatIDR(totalWithdrawn), icon: DollarSign, color: '#ff8800' },
                  { label: 'House Profit', value: formatIDR(houseProfit), icon: BarChart3, color: '#ffd700' },
                ].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <s.icon className="w-6 h-6 mb-3" style={{ color: s.color }} />
                    <div className="text-xl font-black" style={{ color: '#fff' }}>{s.value}</div>
                    <div className="text-xs mt-1" style={{ color: '#888' }}>{s.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Game Mode Control - PROMINENT */}
              <div className="p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(255,50,50,0.1), rgba(255,100,0,0.05))', border: '2px solid rgba(255,50,50,0.3)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <Sliders className="w-6 h-6" style={{ color: '#ff5555' }} />
                  <h3 className="text-xl font-black" style={{ color: '#fff' }}>Kontrol Mode Game</h3>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(255,50,50,0.2)', color: '#ff5555' }}>ADMIN ONLY</span>
                </div>
                <p className="text-sm mb-5" style={{ color: '#888' }}>Atur siapa yang selalu menang dalam setiap permainan.</p>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { mode: 'fair', label: '⚖️ Mode Fair', desc: '50/50 acak', color: '#00c864' },
                    { mode: 'admin_wins', label: '🏦 Admin Menang', desc: 'User selalu kalah', color: '#ff5555' },
                    { mode: 'user_wins', label: '🎁 User Menang', desc: 'User selalu menang', color: '#ffd700' },
                  ] as const).map(m => (
                    <button key={m.mode}
                      onClick={() => { setSettings({ ...settings, siteMode: m.mode }); settingsDB.update({ siteMode: m.mode }); showToast(`Mode diubah: ${m.label}`, 'success'); }}
                      className="p-4 rounded-xl text-center transition-all"
                      style={{
                        background: settings.siteMode === m.mode ? `rgba(${m.color === '#00c864' ? '0,200,100' : m.color === '#ff5555' ? '255,85,85' : '255,215,0'},0.2)` : 'rgba(255,255,255,0.03)',
                        border: `2px solid ${settings.siteMode === m.mode ? m.color : 'rgba(255,255,255,0.06)'}`,
                      }}>
                      <div className="font-bold text-sm" style={{ color: settings.siteMode === m.mode ? m.color : '#fff' }}>{m.label}</div>
                      <div className="text-xs mt-1" style={{ color: '#888' }}>{m.desc}</div>
                      {settings.siteMode === m.mode && (
                        <div className="text-xs mt-2 font-bold" style={{ color: m.color }}>✓ AKTIF</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 className="font-bold mb-4" style={{ color: '#fff' }}>Taruhan Terbaru</h3>
                <div className="space-y-2">
                  {allBets.slice(-8).reverse().map(bet => (
                    <div key={bet.id} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <div className="flex items-center gap-3">
                        <span>{bet.result === 'heads' ? '👑' : '⚡'}</span>
                        <div>
                          <span className="text-sm font-semibold" style={{ color: '#fff' }}>{bet.username}</span>
                          <span className="text-xs ml-2" style={{ color: '#666' }}>{formatDate(bet.createdAt)}</span>
                        </div>
                      </div>
                      <span className="text-sm font-bold" style={{ color: bet.win ? '#00c864' : '#ff4444' }}>
                        {bet.win ? '+' : '-'}{formatIDR(bet.win ? bet.payout : bet.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Deposits */}
          {tab === 'deposits' && (
            <div className="space-y-5">
              <h2 className="text-2xl font-black" style={{ color: '#fff' }}>Manajemen Deposit</h2>
              <div className="space-y-3">
                {allTxns.filter(t => t.type === 'deposit').reverse().map(txn => {
                  const u = usersDB.getById(txn.userId);
                  return (
                    <div key={txn.id} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold" style={{ color: '#fff' }}>{u?.username || 'Unknown'}</div>
                          <div className="text-sm" style={{ color: '#888' }}>{u?.email}</div>
                          <div className="text-lg font-black mt-1" style={{ color: '#ffd700' }}>{formatIDR(txn.amount)}</div>
                          {txn.adminNote && <div className="text-xs mt-1" style={{ color: '#aaa' }}>Catatan: {txn.adminNote}</div>}
                          <div className="text-xs mt-1" style={{ color: '#666' }}>{formatDate(txn.createdAt)}</div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs px-2 py-1 rounded-full" style={{
                            background: txn.status === 'pending' ? 'rgba(255,215,0,0.15)' : txn.status === 'approved' ? 'rgba(0,200,100,0.15)' : 'rgba(255,68,68,0.15)',
                            color: txn.status === 'pending' ? '#ffd700' : txn.status === 'approved' ? '#00c864' : '#ff4444',
                          }}>
                            {txn.status === 'pending' ? 'Menunggu' : txn.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                          </span>
                          {txn.status === 'pending' && (
                            <div className="flex gap-2">
                              <button onClick={() => handleApproveDeposit(txn)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold"
                                style={{ background: 'rgba(0,200,100,0.2)', color: '#00c864', border: '1px solid rgba(0,200,100,0.3)' }}>
                                <CheckCircle className="w-3.5 h-3.5" /> Setujui
                              </button>
                              <button onClick={() => handleRejectDeposit(txn)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold"
                                style={{ background: 'rgba(255,68,68,0.2)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.3)' }}>
                                <XCircle className="w-3.5 h-3.5" /> Tolak
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {allTxns.filter(t => t.type === 'deposit').length === 0 && (
                  <div className="text-center py-16" style={{ color: '#555' }}>Belum ada permintaan deposit</div>
                )}
              </div>
            </div>
          )}

          {/* Withdrawals */}
          {tab === 'withdrawals' && (
            <div className="space-y-5">
              <h2 className="text-2xl font-black" style={{ color: '#fff' }}>Manajemen Withdraw</h2>
              <div className="space-y-3">
                {allTxns.filter(t => t.type === 'withdraw').reverse().map(txn => {
                  const u = usersDB.getById(txn.userId);
                  return (
                    <div key={txn.id} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold" style={{ color: '#fff' }}>{u?.username || 'Unknown'}</div>
                          <div className="text-sm" style={{ color: '#888' }}>{txn.bankName} - {txn.bankAccount}</div>
                          <div className="text-sm" style={{ color: '#888' }}>a.n. {txn.bankHolder}</div>
                          <div className="text-lg font-black mt-1" style={{ color: '#ff8800' }}>{formatIDR(txn.amount)}</div>
                          <div className="text-xs mt-1" style={{ color: '#666' }}>Saldo user: {formatIDR(u?.balance || 0)}</div>
                          <div className="text-xs" style={{ color: '#666' }}>{formatDate(txn.createdAt)}</div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs px-2 py-1 rounded-full" style={{
                            background: txn.status === 'pending' ? 'rgba(255,215,0,0.15)' : txn.status === 'approved' ? 'rgba(0,200,100,0.15)' : 'rgba(255,68,68,0.15)',
                            color: txn.status === 'pending' ? '#ffd700' : txn.status === 'approved' ? '#00c864' : '#ff4444',
                          }}>
                            {txn.status === 'pending' ? 'Menunggu' : txn.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                          </span>
                          {txn.status === 'pending' && (
                            <div className="flex gap-2">
                              <button onClick={() => handleApproveWithdraw(txn)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold"
                                style={{ background: 'rgba(0,200,100,0.2)', color: '#00c864', border: '1px solid rgba(0,200,100,0.3)' }}>
                                <CheckCircle className="w-3.5 h-3.5" /> Setujui
                              </button>
                              <button onClick={() => handleRejectWithdraw(txn)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold"
                                style={{ background: 'rgba(255,68,68,0.2)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.3)' }}>
                                <XCircle className="w-3.5 h-3.5" /> Tolak
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {allTxns.filter(t => t.type === 'withdraw').length === 0 && (
                  <div className="text-center py-16" style={{ color: '#555' }}>Belum ada permintaan withdraw</div>
                )}
              </div>
            </div>
          )}

          {/* Users */}
          {tab === 'users' && (
            <div className="space-y-5">
              <h2 className="text-2xl font-black" style={{ color: '#fff' }}>Manajemen User ({users.length})</h2>
              <div className="space-y-3">
                {users.map(u => {
                  const userBets = betsDB.getByUser(u.id);
                  const wins = userBets.filter(b => b.win).length;
                  return (
                    <div key={u.id} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-black" style={{ background: 'rgba(255,215,0,0.15)', color: '#ffd700' }}>
                            {u.username[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold" style={{ color: '#fff' }}>{u.username}</div>
                            <div className="text-xs" style={{ color: '#888' }}>{u.email}</div>
                            <div className="text-xs mt-1 flex gap-3">
                              <span style={{ color: '#ffd700' }}>Saldo: {formatIDR(u.balance)}</span>
                              <span style={{ color: '#888' }}>Bet: {userBets.length}</span>
                              <span style={{ color: '#00c864' }}>W: {wins}</span>
                              <span style={{ color: '#ff4444' }}>L: {userBets.length - wins}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 rounded-full" style={{
                            background: u.status === 'active' ? 'rgba(0,200,100,0.15)' : 'rgba(255,68,68,0.15)',
                            color: u.status === 'active' ? '#00c864' : '#ff4444',
                          }}>
                            {u.status === 'active' ? 'Aktif' : 'Suspended'}
                          </span>
                          <button onClick={() => handleSuspendUser(u.id, u.status)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold"
                            style={{ background: 'rgba(255,255,255,0.05)', color: '#888', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {u.status === 'active' ? 'Suspend' : 'Aktifkan'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {users.length === 0 && (
                  <div className="text-center py-16" style={{ color: '#555' }}>Belum ada user terdaftar</div>
                )}
              </div>
            </div>
          )}

          {/* Bets History */}
          {tab === 'bets' && (
            <div className="space-y-5">
              <h2 className="text-2xl font-black" style={{ color: '#fff' }}>Riwayat Semua Taruhan</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-xl font-black" style={{ color: '#fff' }}>{allBets.length}</div>
                  <div className="text-xs" style={{ color: '#888' }}>Total Bet</div>
                </div>
                <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-xl font-black" style={{ color: '#00c864' }}>{allBets.filter(b => b.win).length}</div>
                  <div className="text-xs" style={{ color: '#888' }}>User Menang</div>
                </div>
                <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-xl font-black" style={{ color: '#ff4444' }}>{allBets.filter(b => !b.win).length}</div>
                  <div className="text-xs" style={{ color: '#888' }}>User Kalah</div>
                </div>
              </div>
              <div className="space-y-2">
                {allBets.reverse().slice(0, 50).map(bet => (
                  <div key={bet.id} className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${bet.win ? 'rgba(0,200,100,0.1)' : 'rgba(255,68,68,0.08)'}` }}>
                    <div className="flex items-center gap-3">
                      <span>{bet.result === 'heads' ? '👑' : '⚡'}</span>
                      <div>
                        <span className="text-sm font-bold" style={{ color: '#fff' }}>{bet.username}</span>
                        <span className="text-xs ml-2" style={{ color: '#666' }}>pilih {bet.choice} → {bet.result}</span>
                        <div className="text-xs" style={{ color: '#555' }}>{formatDate(bet.createdAt)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold" style={{ color: bet.win ? '#00c864' : '#ff4444' }}>
                        {bet.win ? '+' + formatIDR(bet.payout) : '-' + formatIDR(bet.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          {tab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black" style={{ color: '#fff' }}>Pengaturan Website</h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Game Settings */}
                <div className="p-5 rounded-2xl space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="font-bold" style={{ color: '#fff' }}>🎮 Pengaturan Game</h3>
                  <div>
                    <label className="input-label">Mode Game</label>
                    <select value={settings.siteMode} onChange={e => setSettings({ ...settings, siteMode: e.target.value as any })}
                      className="form-input">
                      <option value="fair">⚖️ Fair (50/50)</option>
                      <option value="admin_wins">🏦 Admin Selalu Menang</option>
                      <option value="user_wins">🎁 User Selalu Menang</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Multiplier Kemenangan</label>
                    <input type="number" step="0.01" min="1" max="2" value={settings.winMultiplier}
                      onChange={e => setSettings({ ...settings, winMultiplier: parseFloat(e.target.value) })}
                      className="form-input" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="input-label">Min Bet (Rp)</label>
                      <input type="number" value={settings.minBet}
                        onChange={e => setSettings({ ...settings, minBet: parseInt(e.target.value) })}
                        className="form-input" />
                    </div>
                    <div>
                      <label className="input-label">Max Bet (Rp)</label>
                      <input type="number" value={settings.maxBet}
                        onChange={e => setSettings({ ...settings, maxBet: parseInt(e.target.value) })}
                        className="form-input" />
                    </div>
                  </div>
                </div>

                {/* Deposit/Withdraw Settings */}
                <div className="p-5 rounded-2xl space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="font-bold" style={{ color: '#fff' }}>🏦 Pengaturan Bank</h3>
                  <div>
                    <label className="input-label">Nama Bank</label>
                    <input type="text" value={settings.depositBank}
                      onChange={e => setSettings({ ...settings, depositBank: e.target.value })}
                      className="form-input" />
                  </div>
                  <div>
                    <label className="input-label">Nomor Rekening</label>
                    <input type="text" value={settings.depositAccount}
                      onChange={e => setSettings({ ...settings, depositAccount: e.target.value })}
                      className="form-input" />
                  </div>
                  <div>
                    <label className="input-label">Atas Nama</label>
                    <input type="text" value={settings.depositHolder}
                      onChange={e => setSettings({ ...settings, depositHolder: e.target.value })}
                      className="form-input" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="input-label">Min Deposit</label>
                      <input type="number" value={settings.minDeposit}
                        onChange={e => setSettings({ ...settings, minDeposit: parseInt(e.target.value) })}
                        className="form-input" />
                    </div>
                    <div>
                      <label className="input-label">Min Withdraw</label>
                      <input type="number" value={settings.minWithdraw}
                        onChange={e => setSettings({ ...settings, minWithdraw: parseInt(e.target.value) })}
                        className="form-input" />
                    </div>
                  </div>
                </div>

                {/* Site Settings */}
                <div className="p-5 rounded-2xl space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h3 className="font-bold" style={{ color: '#fff' }}>🌐 Pengaturan Situs</h3>
                  <div>
                    <label className="input-label">Nama Situs</label>
                    <input type="text" value={settings.siteName}
                      onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                      className="form-input" />
                  </div>
                  <div>
                    <label className="input-label">Instruksi Deposit</label>
                    <textarea value={settings.depositInstructions}
                      onChange={e => setSettings({ ...settings, depositInstructions: e.target.value })}
                      className="form-input h-24 resize-none" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span className="text-sm" style={{ color: '#fff' }}>Mode Maintenance</span>
                    <button onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                      className="relative w-12 h-6 rounded-full transition-all"
                      style={{ background: settings.maintenanceMode ? '#ff5555' : 'rgba(255,255,255,0.1)' }}>
                      <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                        style={{ left: settings.maintenanceMode ? '28px' : '4px' }} />
                    </button>
                  </div>
                </div>
              </div>

              <button onClick={handleSaveSettings} className="btn-primary">
                Simpan Semua Pengaturan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
