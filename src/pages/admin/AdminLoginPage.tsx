import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { Shield, Eye, EyeOff, Lock, User } from 'lucide-react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const ok = await login(username.trim(), password);
    if (ok) {
      const { user } = useAuthStore.getState();
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/game');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#05050f' }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #ff3333, transparent)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="auth-card">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)' }}>
              <Shield className="w-8 h-8" style={{ color: '#ff5555' }} />
            </div>
            <h1 className="text-2xl font-black" style={{ color: '#fff' }}>Admin Panel</h1>
            <p className="text-sm mt-1" style={{ color: '#888' }}>Akses terbatas untuk administrator</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="input-group">
              <label className="input-label">Username Admin</label>
              <div className="input-wrapper">
                <User className="input-icon" />
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  className="form-input pl-10" placeholder="admin" required />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="form-input pl-10 pr-10" placeholder="Password admin" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#888' }}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="error-box">{error}</motion.div>}

            <button type="submit" disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold transition-all"
              style={{ background: 'linear-gradient(135deg, #ff5555, #cc2222)', color: '#fff' }}>
              {isLoading ? <span className="loading-spinner" /> : '🔐 Masuk Admin'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
