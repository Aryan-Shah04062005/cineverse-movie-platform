import React, { useState, useEffect } from 'react';
import {
  User,
  Bookmark,
  Heart,
  History,
  Eye,
  Settings,
  Shield,
  Trash2,
  Sparkles,
  Film,
  Calendar,
  LogOut,
  Edit2
} from 'lucide-react';
import Card3D from '../components/3d/Card3D';
import { authService } from '../services/authService';
import { dbService } from '../services/dbService';
import { audioService } from '../services/audioService';
import { useToast } from '../components/common/Toast';

export default function Profile({
  onViewDetails,
  onPlayTrailer,
  onOpenDownload,
  watchlist = [],
  onToggleWatchlist,
  onNavigate
}) {
  const { addToast } = useToast();
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [activeTab, setActiveTab] = useState('watchlist'); // watchlist | favorites | history | recent | settings
  const [favorites, setFavorites] = useState(authService.getFavorites());
  const [history, setHistory] = useState(authService.getHistory());
  const [recent, setRecent] = useState(authService.getRecentlyViewed());
  const [allMovies, setAllMovies] = useState(dbService.getMovies());

  const [editName, setEditName] = useState(currentUser?.name || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const unsub = authService.subscribe(() => {
      const user = authService.getCurrentUser();
      setCurrentUser(user);
      setFavorites(authService.getFavorites());
      setHistory(authService.getHistory());
      setRecent(authService.getRecentlyViewed());
    });
    return unsub;
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    const updated = authService.updateProfile({ name: editName });
    setCurrentUser(updated);
    setIsEditing(false);
    audioService.playSuccess();
    addToast({
      type: 'success',
      title: 'Profile Updated',
      message: `Your display name has been updated to "${editName}".`
    });
  };

  const handleClearHistory = () => {
    audioService.playClick();
    authService.clearHistory();
    setHistory([]);
    addToast({
      type: 'info',
      title: 'History Cleared',
      message: 'Your watch history has been reset.'
    });
  };

  // Movie lookups
  const watchlistMovies = allMovies.filter((m) => watchlist.includes(m.id));
  const favoriteMovies = allMovies.filter((m) => favorites.includes(m.id));
  const recentMovies = allMovies.filter((m) => recent.includes(m.id));

  // Compute favorite genre
  const genreCount = {};
  watchlistMovies.concat(favoriteMovies).forEach((m) => {
    (m.genres || []).forEach((g) => {
      genreCount[g] = (genreCount[g] || 0) + 1;
    });
  });
  const topGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Sci-Fi';

  const tabs = [
    { id: 'watchlist', label: 'Watchlist', icon: Bookmark, count: watchlistMovies.length },
    { id: 'favorites', label: 'Favorites', icon: Heart, count: favoriteMovies.length },
    { id: 'history', label: 'Watch History', icon: History, count: history.length },
    { id: 'recent', label: 'Recently Viewed', icon: Eye, count: recentMovies.length },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen text-zinc-100 pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* User Profile Card Banner */}
        <div className="relative rounded-3xl p-6 sm:p-10 glass-panel border border-white/10 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-tr from-cine-red/15 to-cine-purple/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="relative w-24 h-24 rounded-3xl overflow-hidden p-1 bg-gradient-to-tr from-cine-red via-cine-purple to-cine-blue shadow-glow-red flex-shrink-0">
                <img
                  src={currentUser?.avatar}
                  alt={currentUser?.name}
                  className="w-full h-full object-cover rounded-[20px]"
                />
              </div>

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="font-cinematic font-bold text-2xl sm:text-3xl text-white">
                    {currentUser?.name}
                  </h1>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
                    title="Edit name"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-zinc-400 mt-0.5">{currentUser?.email}</p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-cine-purple/20 text-cine-purple border border-cine-purple/30">
                    {currentUser?.role === 'admin' ? 'Administrator' : 'Premium VIP'}
                  </span>
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Member since {currentUser?.joinDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick KPI Stats */}
            <div className="grid grid-cols-3 gap-3 text-center w-full sm:w-auto">
              <div className="p-3 sm:p-4 rounded-2xl bg-black/40 border border-white/5 min-w-[90px]">
                <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                  {watchlistMovies.length}
                </div>
                <div className="text-[10px] text-zinc-400 font-semibold uppercase mt-0.5">Watchlist</div>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-black/40 border border-white/5 min-w-[90px]">
                <div className="text-xl sm:text-2xl font-bold font-mono text-cine-red">
                  {favoriteMovies.length}
                </div>
                <div className="text-[10px] text-zinc-400 font-semibold uppercase mt-0.5">Favorites</div>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-black/40 border border-white/5 min-w-[90px]">
                <div className="text-xl sm:text-2xl font-bold font-mono text-cine-blue">
                  {topGenre}
                </div>
                <div className="text-[10px] text-zinc-400 font-semibold uppercase mt-0.5">Top Genre</div>
              </div>
            </div>
          </div>

          {/* Inline Edit Form */}
          {isEditing && (
            <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-white/10 flex gap-3 max-w-md">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter new display name"
                className="flex-1 px-4 py-2 rounded-xl text-xs glass-input"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cine-red text-white text-xs font-semibold shadow-glow-red"
              >
                Save
              </button>
            </form>
          )}
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-white/10 pb-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  audioService.playClick();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cine-red to-cine-purple text-white shadow-glow-red'
                    : 'glass-panel text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-black/40 text-white' : 'bg-white/10 text-zinc-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Watchlist */}
        {activeTab === 'watchlist' && (
          <div>
            {watchlistMovies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-6">
                {watchlistMovies.map((movie) => (
                  <Card3D
                    key={movie.id}
                    movie={movie}
                    onViewDetails={onViewDetails}
                    onPlayTrailer={onPlayTrailer}
                    onOpenDownload={onOpenDownload}
                    isInWatchlist={true}
                    onToggleWatchlist={onToggleWatchlist}
                  />
                ))}
              </div>
            ) : (
              <div className="p-16 rounded-3xl glass-panel border border-white/10 text-center space-y-4 max-w-md mx-auto">
                <Bookmark className="w-12 h-12 text-zinc-600 mx-auto" />
                <h3 className="font-bold text-lg text-white">Your Watchlist is Empty</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Save movies to your watchlist while browsing to easily access and stream them later.
                </p>
                <button
                  onClick={() => onNavigate('explore')}
                  className="px-6 py-2.5 rounded-full bg-cine-red text-white font-semibold text-xs shadow-glow-red"
                >
                  Explore Movies
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Favorites */}
        {activeTab === 'favorites' && (
          <div>
            {favoriteMovies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-6">
                {favoriteMovies.map((movie) => (
                  <Card3D
                    key={movie.id}
                    movie={movie}
                    onViewDetails={onViewDetails}
                    onPlayTrailer={onPlayTrailer}
                    onOpenDownload={onOpenDownload}
                    isInWatchlist={watchlist.includes(movie.id)}
                    onToggleWatchlist={onToggleWatchlist}
                  />
                ))}
              </div>
            ) : (
              <div className="p-16 rounded-3xl glass-panel border border-white/10 text-center space-y-4 max-w-md mx-auto">
                <Heart className="w-12 h-12 text-zinc-600 mx-auto" />
                <h3 className="font-bold text-lg text-white">No Favorites Added Yet</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Mark movies as favorite from their details page to curate your personal hall of fame.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Watch History */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                Logged trailer and playback sessions:
              </span>
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="flex items-center gap-1.5 text-xs text-rose-400 hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map((item, idx) => {
                  const m = allMovies.find((movie) => movie.id === item.movieId);
                  if (!m) return null;
                  return (
                    <div
                      key={idx}
                      onClick={() => onViewDetails(m.id)}
                      className="flex items-center justify-between p-4 rounded-2xl glass-panel border border-white/10 hover:border-white/20 cursor-pointer transition-all hover:scale-[1.01]"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={m.poster}
                          alt={m.title}
                          className="w-12 h-16 rounded-xl object-cover"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-white">{m.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                            <span>{m.duration}</span>
                            <span>•</span>
                            <span>{m.genres?.[0]}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-zinc-400">
                          {new Date(item.watchedAt).toLocaleDateString()}
                        </span>
                        <div className="text-[11px] font-bold text-emerald-400">
                          {item.progress}% Streamed
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-16 rounded-3xl glass-panel text-center text-xs text-zinc-400">
                No watch history recorded yet.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Recently Viewed */}
        {activeTab === 'recent' && (
          <div>
            {recentMovies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-6">
                {recentMovies.map((movie) => (
                  <Card3D
                    key={movie.id}
                    movie={movie}
                    onViewDetails={onViewDetails}
                    onPlayTrailer={onPlayTrailer}
                    onOpenDownload={onOpenDownload}
                    isInWatchlist={watchlist.includes(movie.id)}
                    onToggleWatchlist={onToggleWatchlist}
                  />
                ))}
              </div>
            ) : (
              <div className="p-16 rounded-3xl glass-panel text-center text-xs text-zinc-400">
                No recently viewed movies.
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Settings */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl rounded-3xl p-6 sm:p-8 glass-panel border border-white/10 space-y-6">
            <h3 className="font-bold text-lg text-white">Account Preferences</h3>

            <div className="space-y-4 text-xs text-zinc-300">
              <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                <div>
                  <div className="font-semibold text-white">Streaming Quality Preference</div>
                  <div className="text-zinc-400 mt-0.5">Default playback resolution for trailers</div>
                </div>
                <span className="font-bold text-cine-cyan">4K UHD</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                <div>
                  <div className="font-semibold text-white">Audio Enhancement</div>
                  <div className="text-zinc-400 mt-0.5">High-fidelity Web Audio sound effects</div>
                </div>
                <span className="font-bold text-emerald-400">Enabled</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                <div>
                  <div className="font-semibold text-white">Data Persistence</div>
                  <div className="text-zinc-400 mt-0.5">Client-side synchronized storage</div>
                  </div>
                <span className="font-bold text-zinc-400">Active (LocalDB)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
              <button
                onClick={() => {
                  audioService.playClick();
                  authService.logout();
                }}
                className="px-5 py-2.5 rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of CINEVERSE</span>
              </button>

              <button
                onClick={() => onNavigate('admin')}
                className="px-5 py-2.5 rounded-full bg-cine-purple/20 text-cine-purple hover:bg-cine-purple/30 text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span>Open Admin CMS</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
