import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Coins, LogOut, User, LayoutDashboard, Menu, X, Wallet, History } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatBalance = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(10,10,20,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,215,0,0.15)' }}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
            <Coins className="w-7 h-7" style={{ color: '#ffd700' }} />
          </motion.div>
          <span className="text-xl font-black tracking-tight" style={{ background: 'linear-gradient(135deg, #ffd700, #ff9500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Tebak<span style={{ WebkitTextFillColor: '#fff', fontWeight: 300 }}>Tebakan</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              {user.role === 'admin' ? (
                <Link to="/admin" className="nav-btn flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Admin Panel
                </Link>
              ) : (
                <>
                  <Link to="/game" className="nav-btn">
                    🎮 Main
                  </Link>
                  <Link to="/deposit" className="nav-btn flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Deposit
                  </Link>
                  <Link to="/withdraw" className="nav-btn flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Withdraw
                  </Link>
                  <Link to="/history" className="nav-btn flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Riwayat
                  </Link>
                </>
              )}
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl" style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)' }}>
                <User className="w-4 h-4" style={{ color: '#ffd700' }} />
                <div className="text-sm">
                  <div className="font-bold" style={{ color: '#ffd700' }}>{user.username}</div>
                  {user.role !== 'admin' && (
                    <div className="text-xs" style={{ color: '#aaa' }}>{formatBalance(user.balance)}</div>
                  )}
                </div>
              </div>
              <button onClick={handleLogout} className="nav-btn-danger flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-btn">Masuk</Link>
              <Link to="/register" className="nav-btn-primary">Daftar</Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{ color: '#ffd700' }}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden px-4 pb-4 space-y-2"
            style={{ background: 'rgba(10,10,20,0.98)' }}
          >
            {user ? (
              <>
                <div className="py-3 border-b" style={{ borderColor: 'rgba(255,215,0,0.2)' }}>
                  <div className="font-bold" style={{ color: '#ffd700' }}>{user.username}</div>
                  {user.role !== 'admin' && (
                    <div className="text-sm" style={{ color: '#aaa' }}>{formatBalance(user.balance)}</div>
                  )}
                </div>
                {user.role === 'admin' ? (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="block py-2" style={{ color: '#ffd700' }}>Admin Panel</Link>
                ) : (
                  <>
                    <Link to="/game" onClick={() => setMenuOpen(false)} className="block py-2" style={{ color: '#fff' }}>🎮 Main</Link>
                    <Link to="/deposit" onClick={() => setMenuOpen(false)} className="block py-2" style={{ color: '#fff' }}>Deposit</Link>
                    <Link to="/withdraw" onClick={() => setMenuOpen(false)} className="block py-2" style={{ color: '#fff' }}>Withdraw</Link>
                    <Link to="/history" onClick={() => setMenuOpen(false)} className="block py-2" style={{ color: '#fff' }}>Riwayat</Link>
                  </>
                )}
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block py-2 text-red-400">Keluar</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-2" style={{ color: '#fff' }}>Masuk</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="block py-2" style={{ color: '#ffd700' }}>Daftar</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
