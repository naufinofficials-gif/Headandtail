import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, CheckCircle, Terminal, Database, Globe, Server, Code, Package } from 'lucide-react';

export default function InstallGuide() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const CodeBlock = ({ id, code }: { id: string; code: string }) => (
    <div className="relative mt-2 rounded-xl overflow-hidden" style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.08)' }}>
      <button onClick={() => copyCode(id, code)}
        className="absolute top-3 right-3 p-1.5 rounded-lg transition-all"
        style={{ background: 'rgba(255,215,0,0.1)', color: copied === id ? '#00c864' : '#ffd700' }}>
        {copied === id ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
      <pre className="p-4 text-sm overflow-x-auto" style={{ color: '#00ff88', fontFamily: 'monospace' }}>
        <code>{code}</code>
      </pre>
    </div>
  );

  const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl mb-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <h3 className="text-xl font-black mb-4 flex items-center gap-3" style={{ color: '#fff' }}>
        <Icon className="w-5 h-5" style={{ color: '#ffd700' }} />
        {title}
      </h3>
      {children}
    </motion.div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: '#080810' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-3" style={{ background: 'linear-gradient(135deg, #ffd700, #ff9500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Panduan Instalasi Full Stack
          </h1>
          <p style={{ color: '#888' }}>Source code lengkap + panduan deploy ke hosting gratisan</p>
        </div>

        {/* Stack Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: '⚛️', label: 'React 19 + Vite', desc: 'Frontend' },
            { icon: '🔷', label: 'TypeScript', desc: 'Type Safety' },
            { icon: '🎨', label: 'Tailwind CSS v4', desc: 'Styling' },
            { icon: '🗃️', label: 'LocalStorage DB', desc: 'Database' },
          ].map((s, i) => (
            <div key={i} className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)' }}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-bold text-sm" style={{ color: '#fff' }}>{s.label}</div>
              <div className="text-xs" style={{ color: '#888' }}>{s.desc}</div>
            </div>
          ))}
        </div>

        <Section icon={Package} title="1. Requirements">
          <ul className="space-y-2 text-sm" style={{ color: '#aaa' }}>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" style={{ color: '#00c864' }} /> Node.js v18+ (download: nodejs.org)</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" style={{ color: '#00c864' }} /> npm v9+ (otomatis dengan Node.js)</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" style={{ color: '#00c864' }} /> Git (opsional, untuk deploy)</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4" style={{ color: '#00c864' }} /> Akun Vercel / Netlify (gratis)</li>
          </ul>
        </Section>

        <Section icon={Terminal} title="2. Install & Jalankan Lokal">
          <p className="text-sm mb-3" style={{ color: '#aaa' }}>Clone atau download source code, lalu jalankan perintah berikut:</p>
          <CodeBlock id="install" code={`# Clone repository
git clone https://github.com/username/headtail-game.git
cd headtail-game

# Install dependencies
npm install

# Jalankan development server
npm run dev

# Buka browser: http://localhost:5173`} />
        </Section>

        <Section icon={Code} title="3. Struktur Project">
          <CodeBlock id="structure" code={`headtail-game/
├── src/
│   ├── lib/
│   │   └── db.ts              # Database layer (localStorage)
│   ├── store/
│   │   ├── authStore.ts       # Auth state (Zustand)
│   │   └── gameStore.ts       # Game state (Zustand)
│   ├── components/
│   │   ├── CoinFlip.tsx       # Animasi koin
│   │   ├── Navbar.tsx         # Navigation bar
│   │   ├── ProtectedRoute.tsx # Route guard
│   │   └── Toast.tsx          # Notifikasi
│   ├── pages/
│   │   ├── LandingPage.tsx    # Halaman utama
│   │   ├── LoginPage.tsx      # Login user
│   │   ├── RegisterPage.tsx   # Registrasi
│   │   ├── GamePage.tsx       # Halaman game
│   │   ├── DepositPage.tsx    # Deposit saldo
│   │   ├── WithdrawPage.tsx   # Withdraw saldo
│   │   ├── HistoryPage.tsx    # Riwayat
│   │   └── admin/
│   │       ├── AdminLoginPage.tsx
│   │       └── AdminDashboard.tsx
│   ├── App.tsx                # Router utama
│   └── index.css              # Global styles
├── public/
├── package.json
└── vite.config.ts`} />
        </Section>

        <Section icon={Database} title="4. Upgrade ke Database Real (PostgreSQL)">
          <p className="text-sm mb-3" style={{ color: '#aaa' }}>Untuk production, ganti localStorage dengan PostgreSQL:</p>
          <CodeBlock id="db" code={`# Install dependencies backend
npm install express pg cors bcryptjs jsonwebtoken
npm install -D @types/pg @types/express @types/cors

# Buat file server/index.ts
import express from 'express';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

# Schema PostgreSQL
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  balance BIGINT DEFAULT 0,
  role VARCHAR(10) DEFAULT 'user',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(20) NOT NULL,
  amount BIGINT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  choice VARCHAR(10) NOT NULL,
  result VARCHAR(10) NOT NULL,
  amount BIGINT NOT NULL,
  win BOOLEAN NOT NULL,
  payout BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);`} />
        </Section>

        <Section icon={Globe} title="5. Deploy ke Vercel (Gratis)">
          <p className="text-sm mb-3" style={{ color: '#aaa' }}>Deploy frontend ke Vercel dalam 3 langkah:</p>
          <CodeBlock id="vercel" code={`# Opsi 1: Via CLI
npm install -g vercel
vercel login
vercel --prod

# Opsi 2: Via GitHub
# 1. Push ke GitHub:
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/repo.git
git push -u origin main

# 2. Buka vercel.com
# 3. Klik "New Project"
# 4. Import dari GitHub
# 5. Deploy otomatis!

# Build command: npm run build
# Output directory: dist`} />
        </Section>

        <Section icon={Globe} title="6. Deploy ke Netlify (Gratis)">
          <CodeBlock id="netlify" code={`# Build project
npm run build

# Opsi 1: Drag & Drop
# 1. Buka netlify.com/drop
# 2. Drag folder 'dist' ke browser
# 3. Selesai! Dapat URL gratis

# Opsi 2: Via CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist

# Opsi 3: Via GitHub (Auto Deploy)
# 1. Push ke GitHub
# 2. Buka netlify.com
# 3. New site from Git
# 4. Build: npm run build
# 5. Publish dir: dist`} />
        </Section>

        <Section icon={Server} title="7. Environment Variables (Production)">
          <CodeBlock id="env" code={`# .env.local (jangan commit ke Git!)
VITE_APP_NAME=HeadTail.Game
VITE_API_URL=https://your-backend.vercel.app/api

# Untuk backend (Vercel/Railway):
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://your-frontend.vercel.app

# Di Vercel Dashboard:
# Settings > Environment Variables > Add`} />
        </Section>

        <Section icon={Terminal} title="8. Akun Default">
          <div className="space-y-3">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,85,85,0.08)', border: '1px solid rgba(255,85,85,0.2)' }}>
              <div className="font-bold mb-1" style={{ color: '#ff5555' }}>👑 Admin Default</div>
              <CodeBlock id="admin" code={`Username: admin\nPassword: Admin@123\nURL: /admin-login`} />
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)' }}>
              <div className="font-bold mb-1" style={{ color: '#ffd700' }}>⚠️ PENTING: Ganti password admin setelah deploy!</div>
              <p className="text-sm" style={{ color: '#aaa' }}>Di AdminDashboard &gt; Pengaturan &gt; Ubah password admin</p>
            </div>
          </div>
        </Section>

        <Section icon={Code} title="9. Keamanan & Best Practices">
          <ul className="space-y-2 text-sm" style={{ color: '#aaa' }}>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#00c864' }} /> Ganti hash password dengan bcrypt di production</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#00c864' }} /> Gunakan JWT token untuk session management</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#00c864' }} /> Validasi input di server-side (backend)</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#00c864' }} /> Rate limiting untuk endpoint login/register</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#00c864' }} /> HTTPS wajib di production (Vercel/Netlify otomatis)</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#00c864' }} /> Simpan secret key di environment variables</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#00c864' }} /> Backup database secara berkala</li>
            <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#00c864' }} /> Log semua transaksi untuk audit trail</li>
          </ul>
        </Section>

        <div className="text-center p-8 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,149,0,0.05))', border: '1px solid rgba(255,215,0,0.2)' }}>
          <div className="text-3xl mb-3">🚀</div>
          <h3 className="text-xl font-black mb-2" style={{ color: '#fff' }}>Siap Deploy!</h3>
          <p className="text-sm" style={{ color: '#888' }}>Website ini sudah berjalan. Deploy ke Vercel atau Netlify gratis dalam hitungan menit.</p>
        </div>
      </div>
    </div>
  );
}
