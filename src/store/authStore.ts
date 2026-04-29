import { create } from 'zustand';
import { User, usersDB, sessionDB, hashPassword } from '../lib/db';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    await new Promise(r => setTimeout(r, 600));

    const user = usersDB.getByUsername(username);
    if (!user) {
      set({ isLoading: false, error: 'Salah itu bos username dan paswordnya..!!!.' });
      return false;
    }

    if (user.passwordHash !== hashPassword(password)) {
      set({ isLoading: false, error: 'Salah itu bos username dan paswordnya..!!!.' });
      return false;
    }

    if (user.status === 'suspended') {
      set({ isLoading: false, error: 'Akunmu kena suspend, hub admin ya...biar bisa dibuka lagi...!!' });
      return false;
    }

    usersDB.update(user.id, { lastLogin: new Date().toISOString() });
    sessionDB.set(user.id, user.role);
    set({ user, isLoading: false });
    return true;
  },

  register: async (username, email, password) => {
    set({ isLoading: true, error: null });
    await new Promise(r => setTimeout(r, 600));

    if (usersDB.getByUsername(username)) {
      set({ isLoading: false, error: 'udah ada yang punya pula username itu bro..!?.' });
      return false;
    }

    if (usersDB.getByEmail(email)) {
      set({ isLoading: false, error: 'Emailnya udh terdaftar, pake email lain ya....' });
      return false;
    }

    if (password.length < 8) {
      set({ isLoading: false, error: '8 Karakter ya om paswordnya...jangan kurang!!?.' });
      return false;
    }

    const newUser = usersDB.create({
      username,
      email,
      passwordHash: hashPassword(password),
      balance: 0,
      role: 'user',
      status: 'active',
    });

    sessionDB.set(newUser.id, newUser.role);
    set({ user: newUser, isLoading: false });
    return true;
  },

  logout: () => {
    sessionDB.clear();
    set({ user: null });
  },

  refreshUser: () => {
    const session = sessionDB.get();
    if (session) {
      const user = usersDB.getById(session.userId);
      if (user) set({ user });
    }
  },

  clearError: () => set({ error: null }),
}));
