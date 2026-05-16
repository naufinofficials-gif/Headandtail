import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { transactionsDB, settingsDB } from '../lib/db';
import { showToast } from '../components/Toast';
import { Upload, Copy, CheckCircle, Wallet, AlertCircle } from 'lucide-react';

export default function DepositPage() {
  const { user, refreshUser } = useAuthStore();
  const settings = settingsDB.get();
  const [amount, setAmount] = useState('');
  const [proofText, setProofText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatIDR = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Disalin ke clipboard!', 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amt = parseInt(amount.replace(/\D/g, ''));
    if (isNaN(amt) || amt < settings.minDeposit) {
      showToast(`Minimum deposit ${formatIDR(settings.minDeposit)}`, 'error');
      return;
    }

    transactionsDB.create({
      userId: user.id,
      type: 'deposit',
      amount: amt,
      status: 'pending',
      adminNote: proofText,
      bankName: settings.depositBank,
    });

    setSubmitted(true);
    showToast('Permintaan deposit terkirim! Menunggu konfirmasi admin.', 'success');
  };

  const quickAmounts = [2000, 10000, 100000, 200000, 300000, 2000000];

  if (submitted) {
    return (
      <div className="min-h-screen pt-24 pb-10 px-4 flex items-center justify-center" style={{ background: '#080810' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-black mb-3" style={{ color: '#fff' }}>Menunggu Konfirmasi</h2>
          <p className="mb-6" style={{ color: '#888' }}>Admin akan memverifikasi deposit Anda. Saldo akan ditambahkan setelah konfirmasi.</p>
          <button onClick={() => setSubmitted(false)} className="btn-primary">Deposit Lagi Ahh..!</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-10 px-4" style={{ background: '#080810' }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black" style={{ color: '#fff' }}>Deposit Saldo</h1>
          <p className="text-sm mt-1" style={{ color: '#888' }}>Transfer ke rekening di bawah, lalu konfirmasi</p>
        </div>

        {/* Current Balance */}
        <div className="game-card mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5" style={{ color: '#ffd700' }} />
            <span style={{ color: '#888' }}>Saldo Saat Ini</span>
          </div>
          <span className="text-xl font-black" style={{ color: '#ffd700' }}>{formatIDR(user?.balance || 0)}</span>
        </div>

        {/* Bank Info */}
        <div className="game-card mb-6">
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#fff' }}>
            🏦 Rekening Tujuan
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Bank', value: settings.depositBank },
              { label: 'No. Rekening', value: settings.depositAccount, copy: true },
              { label: 'Atas Nama', value: settings.depositHolder },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <div className="text-xs" style={{ color: '#888' }}>{item.label}</div>
                  <div className="font-bold" style={{ color: '#fff' }}>{item.value}</div>
                </div>
                {item.copy && (
                  <button onClick={() => handleCopy(item.value)} className="p-2 rounded-lg" style={{ background: 'rgba(255,215,0,0.1)' }}>
                    {copied ? <CheckCircle className="w-4 h-4" style={{ color: '#00c864' }} /> : <Copy className="w-4 h-4" style={{ color: '#ffd700' }} />}
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl flex items-start gap-2" style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)' }}>
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#ffd700' }} />
            <p className="text-xs" style={{ color: '#aaa' }}>{settings.depositInstructions}</p>
          </div>
        </div>

        {/* Deposit Form */}
        <form onSubmit={handleSubmit} className="game-card space-y-5">
          <h3 className="font-bold" style={{ color: '#fff' }}>Konfirmasi Transfer</h3>

          <div>
            <label className="input-label">Jumlah Transfer (Rp)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: '#888' }}>Rp</span>
              <input type="text" value={amount} onChange={e => setAmount(e.target.value.replace(/\D/g, ''))}
                className="form-input pl-10" placeholder={`Min. ${formatIDR(settings.minDeposit)}`} required />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {quickAmounts.map(amt => (
                <button key={amt} type="button" onClick={() => setAmount(amt.toString())} className="quick-btn">
                  {amt >= 1000000 ? `${amt / 1000000}JT` : `${amt / 1000}K`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label">Catatan / Bukti Transfer</label>
            <textarea value={proofText} onChange={e => setProofText(e.target.value)}
              className="form-input h-24 resize-none"
              placeholder="Nomor referensi transfer, waktu transfer, atau catatan lainnya..."
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            <Upload className="w-4 h-4 inline mr-2" />
            Kirim Konfirmasi Deposit
          </button>

          <p className="text-xs text-center" style={{ color: '#555' }}><h4>Min. deposit: {formatIDR(settings.minDeposit)}</h4></p>
          <center>Gunakan Barcode di bawah ini jika ingin melakukan Deposit</center>
    <center>[Imgur](https://imgur.com/mG8eZm4)</center>
        </form>
      </div>
    </div>
  );
}
