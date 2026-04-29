import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: { bg: 'rgba(0,200,100,0.15)', border: 'rgba(0,200,100,0.4)', icon: '#00c864' },
    error: { bg: 'rgba(255,50,50,0.15)', border: 'rgba(255,50,50,0.4)', icon: '#ff3232' },
    info: { bg: 'rgba(255,215,0,0.15)', border: 'rgba(255,215,0,0.4)', icon: '#ffd700' },
  };
  const c = colors[type];
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? XCircle : AlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl max-w-sm"
      style={{ background: c.bg, border: `1px solid ${c.border}`, backdropFilter: 'blur(20px)' }}
    >
      <Icon className="w-5 h-5 flex-shrink-0" style={{ color: c.icon }} />
      <span className="text-sm" style={{ color: '#fff' }}>{message}</span>
      <button onClick={onClose} className="ml-auto" style={{ color: '#888' }}>
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastCallback: ((msg: string, type: 'success' | 'error' | 'info') => void) | null = null;

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  if (toastCallback) toastCallback(message, type);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    toastCallback = (message, type) => {
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, message, type }]);
    };
    return () => { toastCallback = null; };
  }, []);

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => remove(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}
