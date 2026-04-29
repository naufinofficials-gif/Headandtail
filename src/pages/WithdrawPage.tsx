import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { transactionsDB, settingsDB } from '../lib/db';
import { showToast } from '../components/Toast';
import { Wallet, AlertCircle, ArrowDownCircle } from 'lucide-react';

export default function WithdrawPage() {
  const { user } = useAuthStore();
  const settings = settingsDB.get();
  const [form, setForm] = useState({ amount: '', bankName: '', bankAccount: '', bankHolder: '' });
  const [submitted, setSubmitted] = useState(false);

  const formatIDR = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amt = parseInt(form.amount.replace(/\D/g, ''));
    if (isNaN(amt)) return;
    if (amt < settings.minWithdraw) {
      showToast(`Minimum withdraw ${formatIDR(settings.minWithdraw)}`, 'error');
      return;
    }
    if (amt > settings.maxWithdraw) {
      showToast(`Maximum withdraw ${formatIDR(settings.maxWithdraw)}`, 'error');
      return;
    }
    if (amt > (user.balance || 0)) {
      showToast('Saldo tidak mencukupi', 'error');
      return;
    }

    transactionsDB.create({
      userId: user.id,
      type: 'withdraw',
      amount: amt,
      status: 'pending',
      bankName: form.bankName,
      bankAccount: form.bankAccount,
      bankHolder: form.bankHolder,
    });

    setSubmitted(true);
    showToast('Permintaan withdraw terkirim!', 'success');
  };

  const banks = ['BCA', 'BNI', 'BRI', 'Mandiri', 'CIMB Niaga', 'Danamon', 'Permata', 'BSI', 'BTN'];
  const quickAmounts = [50000, 100000, 200000, 500000, 1000000];

  if (submitted) {
    return (
      <div className="min-h-screen pt-24 pb-10 px-4 flex items-center justify-center" style={{ background: '#080810' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-black mb-3" style={{ color: '#fff' }}>Withdraw Diproses</h2>
          <p className="mb-6" style={{ color: '#888' }}>Admin akan memproses withdraw Anda segera. Dana akan dikirim ke rekening yang Anda daftarkan.</p>
          <button onClick={() => setSubmitted(false)} className="btn-primary">Withdraw Lagi Ahh...!!</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-10 px-4" style={{ background: '#080810' }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black" style={{ color: '#fff' }}>Withdraw Saldo</h1>
          <p className="text-sm mt-1" style={{ color: '#888' }}>Tarik saldo ke rekening bank Anda</p>
        </div>

        {/* Balance */}
        <div className="game-card mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5" style={{ color: '#ffd700' }} />
            <span style={{ color: '#888' }}>Saldo Tersedia</span>
          </div>
          <span className="text-xl font-black" style={{ color: '#ffd700' }}>{formatIDR(user?.balance || 0)}</span>
        </div>

        <form onSubmit={handleSubmit} className="game-card space-y-5">
          <h3 className="font-bold" style={{ color: '#fff' }}>Detail Withdraw</h3>

          <div>
            <label className="input-label">Jumlah Withdraw (Rp)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: '#888' }}>Rp</span>
              <input type="text" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value.replace(/\D/g, '') })}
                className="form-input pl-10" placeholder={`Min. ${formatIDR(settings.minWithdraw)}`} required />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {quickAmounts.map(amt => (
                <button key={amt} type="button" onClick={() => setForm({ ...form, amount: amt.toString() })} className="quick-btn">
                  {amt >= 1000000 ? `${amt / 1000000}JT` : `${amt / 1000}K`}
                </button>
              ))}
              <button type="button" onClick={() => setForm({ ...form, amount: String(user?.balance || 0) })} className="quick-btn">Max</button>
            </div>
          </div>

          <div>
            <label className="input-label">Bank Tujuan</label>
            <select value={form.bankName} onChange={e => setForm({ ...form, bankName: e.target.value })}
              className="form-input" required>
              <option value="">Pilih Bank</option>
              {banks.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className="input-label">Nomor Rekening</label>
            <input type="text" value={form.bankAccount} onChange={e => setForm({ ...form, bankAccount: e.target.value })}
              className="form-input" placeholder="Nomor rekening tujuan" required />
          </div>

          <div>
            <label className="input-label">Atas Nama</label>
            <input type="text" value={form.bankHolder} onChange={e => setForm({ ...form, bankHolder: e.target.value })}
              className="form-input" placeholder="Nama pemilik rekening" required />
          </div>

          <div className="p-3 rounded-xl flex items-start gap-2" style={{ background: 'rgba(255,100,100,0.05)', border: '1px solid rgba(255,100,100,0.15)' }}>
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#ff8888' }} />
            <p className="text-xs" style={{ color: '#aaa' }}>Pastikan data rekening benar. Kesalahan data tidak dapat dikembalikan.</p>
          </div>

          <button type="submit" className="btn-primary w-full">
            <ArrowDownCircle className="w-4 h-4 inline mr-2" />
            Ajukan Withdraw
          </button>

          <p className="text-xs text-center" style={{ color: '#555' }}>
            Min: {formatIDR(settings.minWithdraw)} | Max: {formatIDR(settings.maxWithdraw)}
          </p>
        </form>
      </div>
    </div>
  );
}
