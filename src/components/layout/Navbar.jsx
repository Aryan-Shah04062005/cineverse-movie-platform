import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Film,
  Sparkles,
  Volume2,
  VolumeX,
  Bookmark,
  Shield,
  User,
  Compass,
  Menu,
  X,
  Sun,
  Moon,
  Star,
  LogOut,
  Upload
} from 'lucide-react';
import { audioService } from '../../services/audioService';
import { authService } from '../../services/authService';

export default function Navbar({
  currentRoute,
  onNavigate,
  movies = [],
  onOpenLogin,
  isDarkMode,
  onToggleTheme,
  onOpenUpload
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(audioService.isMuted());
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = authService.subscribe(() => {
      setCurrentUser(authService.getCurrentUser());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleSound = () => {
    const muted = audioService.toggleMute();
    setIsMuted(muted);
  };

  // Autocomplete matching
  const matchingMovies = searchQuery.trim()
    ? movies
        .filter((m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.director && m.director.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (m.genres && m.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase())))
        )
        .slice(0, 5)
    : [];

  const handleSelectMovie = (id) => {
    audioService.playClick();
    setIsSearchOpen(false);
    setSearchQuery('');
    onNavigate('movie', id);
  };

  const navLinks = [
    { id: 'home', label: 'Home', icon: Film },
    { id: 'explore', label: 'Explore & Search', icon: Compass },
    { id: 'public-domain', label: 'Public Domain Classics', icon: Sparkles },
    { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
    { id: 'admin', label: 'Admin Dashboard', icon: Shield, badge: 'CMS' }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'glass-panel border-b border-white/10 shadow-2xl py-3'
          : 'bg-gradient-to-b from-background/90 via-background/40 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div
          onClick={() => {
            audioService.playClick();
            onNavigate('home');
          }}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cine-red to-cine-purple p-0.5 shadow-glow-red group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
              <Film className="w-5 h-5 text-cine-red group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <span className="font-cinematic font-black text-xl sm:text-2xl tracking-wider text-gradient-cine">
              CINE<span className="text-cine-red">VERSE</span>
            </span>
            <span className="block text-[8px] font-mono tracking-widest text-zinc-400 uppercase -mt-1">
              3D Cinema Platform
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentRoute === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  audioService.playClick();
                  onNavigate(link.id);
                }}
                className={`relative px-3.5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? 'text-white bg-white/10 shadow-[0_0_15px_rgba(255,26,83,0.3)] border border-cine-red/40'
                    : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cine-red' : 'text-zinc-400'}`} />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="ml-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-cine-purple/30 text-cine-purple border border-cine-purple/40">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Icons & Search */}
        <div className="flex items-center gap-2.5">
          
          {/* Search Bar with Autocomplete Dropdown */}
          <div ref={searchContainerRef} className="relative hidden md:block">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search movies, actors..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="w-48 lg:w-64 pl-9 pr-4 py-1.5 rounded-full text-xs glass-input transition-all duration-300 focus:w-72"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-zinc-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {isSearchOpen && matchingMovies.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl glass-panel border border-white/20 p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-3 py-1">
                  Top Results
                </div>
                {matchingMovies.map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => handleSelectMovie(movie.id)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-9 h-12 rounded object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{movie.title}</div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                        <span className="flex items-center gap-0.5 text-amber-400">
                          <Star className="w-2.5 h-2.5 fill-amber-400" />
                          {movie.rating.toFixed(1)}
                        </span>
                        <span>•</span>
                        <span>{movie.year}</span>
                        <span>•</span>
                        <span className="truncate">{movie.genres?.[0]}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    audioService.playClick();
                    setIsSearchOpen(false);
                    onNavigate('explore');
                  }}
                  className="w-full text-center py-2 text-xs text-cine-red font-semibold hover:underline block border-t border-white/5 mt-1"
                >
                  View All Search Results & Filters →
                </button>
              </div>
            )}
          </div>

          {/* Sound SFX Toggle */}
          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute Futuristic SFX' : 'Mute Futuristic SFX'}
            className="p-2 rounded-full glass-panel hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-cine-red" />}
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => {
              audioService.playClick();
              onToggleTheme?.();
            }}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Cinematic Dark Mode'}
            className="p-2 rounded-full glass-panel hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cine-purple" />}
          </button>

          {/* Quick Upload from Mac Action Button */}
          <button
            onClick={() => {
              audioService.playClick();
              onOpenUpload?.();
            }}
            title="Upload movie file from your Mac Downloads (~/Downloads)"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-cine-purple to-cine-red hover:from-purple-500 hover:to-rose-500 text-white font-semibold text-xs shadow-glow-purple hover:scale-105 active:scale-95 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload from Mac</span>
          </button>

          {/* User Account / Profile Button */}
          <div className="relative">
            {currentUser ? (
              <button
                onClick={() => {
                  audioService.playClick();
                  setIsProfileOpen(!isProfileOpen);
                }}
                className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full glass-panel hover:border-cine-red/50 transition-all border border-white/10"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-cine-red/50"
                />
                <span className="text-xs font-semibold text-zinc-200 hidden sm:inline max-w-[90px] truncate">
                  {currentUser.name}
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  audioService.playClick();
                  onOpenLogin?.();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cine-red to-cine-purple text-white text-xs font-semibold shadow-glow-red hover:scale-105 transition-transform"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Profile Dropdown Menu */}
            {isProfileOpen && currentUser && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel border border-white/20 p-2 shadow-2xl z-50 animate-in fade-in">
                <div className="p-2.5 border-b border-white/10">
                  <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                  <div className="text-[11px] text-zinc-400 truncate">{currentUser.email}</div>
                  <div className="mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded-full bg-cine-purple/20 text-cine-purple border border-cine-purple/30 font-medium">
                    {currentUser.role === 'admin' ? 'Administrator' : 'Premium Member'}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      audioService.playClick();
                      setIsProfileOpen(false);
                      onOpenUpload?.();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-cine-purple hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 font-medium"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Movie (~/Downloads)</span>
                  </button>

                  <button
                    onClick={() => {
                      audioService.playClick();
                      setIsProfileOpen(false);
                      onNavigate('profile');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-zinc-200 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    <span>My Profile & Watchlist</span>
                  </button>

                  <button
                    onClick={() => {
                      audioService.playClick();
                      setIsProfileOpen(false);
                      onNavigate('admin');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-zinc-200 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Shield className="w-3.5 h-3.5 text-cine-purple" />
                    <span>Admin Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      audioService.playClick();
                      setIsProfileOpen(false);
                      authService.logout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl glass-panel text-zinc-300 hover:text-white lg:hidden"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden glass-panel border-b border-white/15 px-6 py-5 mt-2 space-y-4 animate-in slide-in-from-top duration-200">
          {/* Mobile Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsMobileMenuOpen(false);
                  onNavigate('explore');
                }
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs glass-input"
            />
          </div>

          <div className="space-y-1">
            {/* Quick Upload from Mac in Mobile Drawer */}
            <button
              onClick={() => {
                audioService.playClick();
                setIsMobileMenuOpen(false);
                onOpenUpload?.();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-cine-purple/20 to-cine-red/20 text-white border border-cine-purple/40 mb-2"
            >
              <div className="flex items-center gap-3">
                <Upload className="w-4 h-4 text-cine-purple" />
                <span>Upload Movie from Mac Downloads</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cine-purple/30 text-cine-purple">
                ~/Downloads
              </span>
            </button>

            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentRoute === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    audioService.playClick();
                    setIsMobileMenuOpen(false);
                    onNavigate(link.id);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold ${
                    isActive ? 'bg-cine-red/20 text-cine-red border border-cine-red/30' : 'text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cine-purple/30 text-cine-purple">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
