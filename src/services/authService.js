// Authentication & User Personalization Service
// Handles user session, favorites, watchlist, watch history, and recently viewed movies.

const STORAGE_KEY_USER = 'cineverse_user';
const STORAGE_KEY_WATCHLIST = 'cineverse_watchlist';
const STORAGE_KEY_FAVORITES = 'cineverse_favorites';
const STORAGE_KEY_HISTORY = 'cineverse_history';
const STORAGE_KEY_RECENT = 'cineverse_recent';
const AUTH_CHANGE_EVENT = 'cineverse_auth_change';

const DEFAULT_ADMIN_USER = {
  id: 'usr-admin-01',
  name: 'Aryan Shah',
  email: 'aryan.shah@cineverse.io',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  role: 'admin',
  plan: 'Cineverse Ultra Executive VIP 4K',
  joinDate: 'November 2026'
};

const DEFAULT_DEMO_USER = DEFAULT_ADMIN_USER;

function dispatchChange() {
  window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
}

export const authService = {
  getCurrentUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER);
      if (!raw) {
        return null; // Default to unauthenticated/guest
      }
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  login(identifier, password) {
    const cleanId = (identifier || '').trim().toLowerCase();
    const isAryan = 
      cleanId === 'aryan shah' || cleanId === 'aryan' || cleanId === 'aryan.shah@cineverse.io' || cleanId === 'admin';

    if (isAryan) {
      if (password === 'Aryan@1234') {
        const admin = {
          ...DEFAULT_ADMIN_USER,
          role: 'admin'
        };
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(admin));
        dispatchChange();
        return admin;
      } else {
        return null; // Reject login if password is not Aryan@1234
      }
    }

    const user = {
      id: `usr-${Date.now()}`,
      name: identifier.includes('@')
        ? identifier.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : identifier,
      email: identifier.includes('@') ? identifier : `${cleanId.replace(/\s+/g, '.')}@cineverse.io`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      role: 'user',
      plan: 'Cineverse Pro HD',
      joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    dispatchChange();
    return user;
  },

  loginAsGuest() {
    const guestUser = {
      id: 'usr-guest-01',
      name: 'Guest Member',
      email: 'guest@cineverse.io',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      role: 'user',
      plan: 'Cineverse Free Explorer',
      joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(guestUser));
    dispatchChange();
    return guestUser;
  },

  loginAsAdmin(password) {
    if (password === 'Aryan@1234') {
      const adminUser = {
        ...DEFAULT_ADMIN_USER,
        role: 'admin'
      };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(adminUser));
      dispatchChange();
      return adminUser;
    }
    return null;
  },

  logout() {
    localStorage.removeItem(STORAGE_KEY_USER);
    dispatchChange();
  },

  updateProfile(updates) {
    const current = this.getCurrentUser();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
    dispatchChange();
    return updated;
  },

  // Watchlist
  getWatchlist() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_WATCHLIST);
      return raw ? JSON.parse(raw) : ['tears-of-steel', 'metropolis'];
    } catch {
      return [];
    }
  },

  toggleWatchlist(movieId) {
    const list = this.getWatchlist();
    let updated;
    const exists = list.includes(movieId);
    if (exists) {
      updated = list.filter(id => id !== movieId);
    } else {
      updated = [movieId, ...list];
    }
    localStorage.setItem(STORAGE_KEY_WATCHLIST, JSON.stringify(updated));
    dispatchChange();
    return !exists;
  },

  isInWatchlist(movieId) {
    return this.getWatchlist().includes(movieId);
  },

  // Favorites
  getFavorites() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FAVORITES);
      return raw ? JSON.parse(raw) : ['big-buck-bunny', 'sintel'];
    } catch {
      return [];
    }
  },

  toggleFavorite(movieId) {
    const list = this.getFavorites();
    let updated;
    const exists = list.includes(movieId);
    if (exists) {
      updated = list.filter(id => id !== movieId);
    } else {
      updated = [movieId, ...list];
    }
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(updated));
    dispatchChange();
    return !exists;
  },

  isFavorite(movieId) {
    return this.getFavorites().includes(movieId);
  },

  // Watch History
  getHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
      return raw ? JSON.parse(raw) : [
        { movieId: 'tears-of-steel', watchedAt: new Date(Date.now() - 3600000 * 4).toISOString(), progress: 100 },
        { movieId: 'metropolis', watchedAt: new Date(Date.now() - 3600000 * 24).toISOString(), progress: 65 }
      ];
    } catch {
      return [];
    }
  },

  addToHistory(movieId, progress = 100) {
    const history = this.getHistory().filter(item => item.movieId !== movieId);
    const updated = [
      { movieId, watchedAt: new Date().toISOString(), progress },
      ...history
    ].slice(0, 30);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    dispatchChange();
  },

  clearHistory() {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify([]));
    dispatchChange();
  },

  // Recently Viewed
  getRecentlyViewed() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_RECENT);
      return raw ? JSON.parse(raw) : ['tears-of-steel', 'big-buck-bunny', 'sintel'];
    } catch {
      return [];
    }
  },

  addRecentlyViewed(movieId) {
    const recent = this.getRecentlyViewed().filter(id => id !== movieId);
    const updated = [movieId, ...recent].slice(0, 15);
    localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(updated));
    dispatchChange();
  },

  subscribe(callback) {
    const handler = () => callback();
    window.addEventListener(AUTH_CHANGE_EVENT, handler);
    window.addEventListener('storage', (e) => {
      if (
        e.key === STORAGE_KEY_USER ||
        e.key === STORAGE_KEY_WATCHLIST ||
        e.key === STORAGE_KEY_FAVORITES ||
        e.key === STORAGE_KEY_HISTORY
      ) {
        callback();
      }
    });
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, handler);
  }
};
