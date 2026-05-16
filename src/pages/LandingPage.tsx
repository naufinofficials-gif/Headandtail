import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Coins, Shield, Zap, TrendingUp, Users, Star } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { betsDB } from '../lib/db';

export default function LandingPage() {
  const { user } = useAuthStore();
  const recentBets = betsDB.getRecent(5);

  const formatIDR = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-screen" style={{ background: '#080810' }}>
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* BG Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #ffd700, transparent)' }} />
          <div className="absolute top-40 left-20 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #ff9500, transparent)' }} />
          <div className="absolute top-60 right-20 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #9945ff, transparent)' }} />
          {/* Grid */}
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,215,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)' }}>
              <Star className="w-4 h-4" style={{ color: '#ffd700' }} />
              <span className="text-sm font-semibold" style={{ color: '#ffd700' }}>Main Game #1 Indonesia</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span style={{ color: '#fff' }}>Cuma Pilih Gambar Doank..,</span>
              <br />
              <span style={{ background: 'linear-gradient(135deg, #ffd700, #ff9500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Menangkan Reward!</span>
            </h1>
            <p className="text-xl mb-10" style={{ color: '#888', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
              Reward Klik Pilih Menang, dan rasakan sensasi dengan  kemenangan hingga 1.75x. Deposit & Withdraw mudah dan cepat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to={user.role === 'admin' ? '/admin' : '/game'} className="btn-primary-lg">
                  {user.role === 'admin' ? 'Admin Panel' : '🎮 Main Sekarang'}
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary-lg">🎮 Main Sekarang</Link>
                  <Link to="/login" className="btn-secondary-lg">Sudah Punya Akun</Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Member', value: '200+', icon: Users },
            { label: 'Total Payout', value: 'Rp 500.000+', icon: TrendingUp },
            { label: 'Win Rate', value: '50%', icon: Zap },
            { label: 'Keamanan', value: '256-bit', icon: Shield },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="stat-card text-center">
              <s.icon className="w-6 h-6 mx-auto mb-2" style={{ color: '#ffd700' }} />
              <div className="text-2xl font-black" style={{ color: '#fff' }}>{s.value}</div>
              <div className="text-xs" style={{ color: '#888' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12" style={{ color: '#fff' }}>Kenapa Pilih <span style={{ color: '#ffd700' }}>Klik Pilih Menang?</span></h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '⚡', title: 'Instant Play', desc: 'Tidak perlu download. Main langsung di browser dengan animasi koin yang smooth.' },
              { icon: '💰', title: 'Deposit Mudah', desc: 'Transfer bank lokal (BCA, BNI, BRI, Mandiri). Konfirmasi otomatis oleh admin.' },
              { icon: '🔒', title: 'Aman & Terpercaya', desc: 'Data terenkripsi, saldo terlindungi. Sistem keamanan berlapis untuk akun Anda.' },
              { icon: '🎯', title: 'Win Rate Adil', desc: 'Sistem 50/50 yang transparan. Multiplier 1.75x untuk setiap kemenangan.' },
              { icon: '📱', title: 'Mobile Friendly', desc: 'Tampilan responsif, nyaman dimainkan di HP maupun PC kapan saja.' },
              { icon: '⚡', title: 'Withdraw Cepat', desc: 'Request withdraw diproses admin dalam hitungan menit.' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="feature-card">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2" style={{ color: '#fff' }}>{f.title}</h3>
                <p className="text-sm" style={{ color: '#888' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12" style={{ color: '#fff' }}>Apa Kata <span style={{ color: '#ffd700' }}>Mereka?</span></h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '', title: 'BAHARUDIN', desc: 'Satu satunya Game yang bisa buat saya cuan, hanya di sini...!!' },
              { icon: '', title: 'HERU JUNAIDI', desc: 'Deposif gak pake lama, withdrawnya hitungan menit, paling lama 5 menit, toplah pokoknya!!.' },
              { icon: '', title: 'DENI WARDANI', desc: 'Baru kali ini saya bisa merasakan nikmatnya bermain game dan dapat cuan.' },
              { icon: '', title: 'WINDA AYU LESTARI', desc: 'Dulu saya sering main game ini, eee...sekarang masih ada juga game ini..Seru Banget..!!.' },
              { icon: '', title: 'AYU DEWI', desc: 'Profitnya bisa buat bayar cicilan motor bro....' },
              { icon: '', title: 'JURAGAM COIM', desc: 'Awalnya ragu, tap sekarang jadi ketagihan karena gampang gacornya....' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="feature-card">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2" style={{ color: '#fff' }}>{f.title}</h3>
                <p className="text-sm" style={{ color: '#888' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Bets */}
      {recentBets.length > 0 && (
        <section className="py-10 px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-black text-center mb-6" style={{ color: '#fff' }}>🎲 Live Reward</h2>
            <div className="space-y-2">
              {recentBets.map((bet, i) => (
                <motion.div key={bet.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{bet.result === 'heads' ? '👑' : '⚡'}</span>
                    <div>
                      <span className="font-semibold text-sm" style={{ color: '#fff' }}>{bet.username}</span>
                      <span className="text-xs ml-2" style={{ color: '#666' }}>pilih {bet.choice === 'heads' ? 'Head' : 'Tail'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ color: bet.win ? '#00c864' : '#ff4444' }}>
                      {bet.win ? '+' + formatIDR(bet.payout) : '-' + formatIDR(bet.amount)}
                    </div>
                    <div className="text-xs" style={{ color: '#555' }}>{bet.win ? 'MENANG' : 'KALAH'}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-10 rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,149,0,0.05))', border: '1px solid rgba(255,215,0,0.2)' }}>
            <h2 className="text-3xl font-black mb-4" style={{ color: '#fff' }}>Siap Mencoba Keberuntungan?</h2>
            <p className="mb-8" style={{ color: '#888' }}>Daftar gratis, deposit, dan mulai dapatkan Rewardmu sekarang!</p>
            {!user && (
              <Link to="/register" className="btn-primary-lg">🎮 Daftar & Main Sekarang</Link>
      <center><B>Gunakan Barcode ini untuk deposit</B></center>
<br>
<center><img src="https://imgur.com/IFE3Fko" width="300" height="300"></center>
<br>
<center><B>Setelah Deposit lakukan konfirmasi dengan format</B></center>
<ul>
<li>Deposit 5000 Arman</li>
<li>kirim ke 089529141932</li>
</ul>
<center><B>Tunggu Kurang lebih 5 Menit, Maka deposit anda akan terkonfirmasi</B></center>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <Coins className="w-5 h-5" style={{ color: '#ffd700' }} />
          <span className="font-bold" style={{ color: '#ffd700' }}>Klik Pilih Menang</span>
        </div>
        <p className="text-xs" style={{ color: '#444' }}>© 2026 Klik Pilih Menang. Game Viral Saat ini</p>
      </footer>
    </div>
  );
}
