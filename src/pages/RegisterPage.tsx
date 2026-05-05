import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Coins, Eye, EyeOff, Lock, User, Mail, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (form.password !== form.confirm) return;
    const ok = await register(form.username.trim(), form.email.trim(), form.password);
    if (ok) navigate('/game');
  };

  const requirements = [
    { label: 'Min. 8 karakter', ok: form.password.length >= 8 },
    { label: 'Password cocok', ok: form.password === form.confirm && form.confirm.length > 0 },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20" style={{ background: '#080810' }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #ffd700, transparent)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="auth-card">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)' }}>
              <Coins className="w-8 h-8" style={{ color: '#ffd700' }} />
            </div>
            <h1 className="text-2xl font-black" style={{ color: '#fff' }}>Buat Akun Baru</h1>
            <p className="text-sm mt-1" style={{ color: '#888' }}>Bergabung dengan Klik Pilih Menang</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="input-group">
              <label className="input-label">Username</label>
              <div className="input-wrapper">
                <User className="input-icon" />
                <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                  className="form-input pl-10" placeholder="Username unik Anda" required minLength={3} maxLength={20} />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="form-input pl-10" placeholder="email@contoh.com" required />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="form-input pl-10 pr-10" placeholder="Min. 8 karakter" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#888' }}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Konfirmasi Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input type="password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })}
                  className="form-input pl-10" placeholder="Ulangi password" required />
              </div>
            </div>

            {/* Password Requirements */}
            <div className="space-y-1">
              {requirements.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <CheckCircle className="w-3.5 h-3.5" style={{ color: r.ok ? '#00c864' : '#444' }} />
                  <span style={{ color: r.ok ? '#00c864' : '#666' }}>{r.label}</span>
                </div>
              ))}
            </div>

            {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="error-box">{error}</motion.div>}

            <button type="submit" disabled={isLoading || form.password !== form.confirm} className="btn-primary w-full">
              {isLoading ? <span className="loading-spinner" /> : 'Daftar Sekarang'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: '#888' }}>
              Sudah punya akun?{' '}
              <Link to="/login" style={{ color: '#ffd700', fontWeight: 600 }}>Masuk</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
