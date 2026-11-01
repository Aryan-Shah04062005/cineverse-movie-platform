import React, { useState, useEffect } from 'react';
import {
  Play,
  Download,
  Star,
  Bookmark,
  Heart,
  Share2,
  Calendar,
  Clock,
  Globe,
  Film,
  User,
  ShieldCheck,
  Check,
  ArrowLeft,
  Lock,
  Layers,
  Sparkles,
  Maximize2,
  Upload
} from 'lucide-react';
import Card3D from '../components/3d/Card3D';
import { audioService } from '../services/audioService';
import { dbService } from '../services/dbService';
import { authService } from '../services/authService';
import { useToast } from '../components/common/Toast';

export default function MovieDetails({
  movieId,
  onNavigate,
  onPlayTrailer,
  onOpenDownload,
  watchlist = [],
  onToggleWatchlist
}) {
  const { addToast } = useToast();
  const [movie, setMovie] = useState(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const found = dbService.getMovieById(movieId);
    if (found) {
      setMovie(found);
      setIsFavorite(authService.isFavorite(found.id));
      // Track recently viewed & record view
      authService.addRecentlyViewed(found.id);
      dbService.recordView(found.id);
    }
  }, [movieId]);

  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    const x = ((clientX - left) / width - 0.5) * 15;
    const y = ((clientY - top) / height - 0.5) * -15;
    setMousePos({ x, y });
  };

  const handleToggleFavorite = () => {
    if (!movie) return;
    audioService.playClick();
    const isNowFav = authService.toggleFavorite(movie.id);
    setIsFavorite(isNowFav);
    addToast({
      type: 'success',
      title: isNowFav ? 'Added to Favorites' : 'Removed from Favorites',
      message: `${movie.title} has been updated in your profile library.`
    });
  };

  const handleShare = () => {
    audioService.playClick();
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${movie.title} on CINEVERSE`,
        text: movie.synopsis,
        url: shareUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      addToast({
        type: 'info',
        title: 'Link Copied!',
        message: 'Direct movie link copied to clipboard.'
      });
    }
  };

  if (!movie) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 text-zinc-300">
        <Film className="w-16 h-16 text-zinc-600 mb-4 animate-bounce" />
        <h2 className="font-bold text-2xl text-white">Movie Not Found</h2>
        <p className="text-sm text-zinc-400 mt-2">The requested movie may have been removed or updated.</p>
        <button
          onClick={() => onNavigate('home')}
          className="mt-6 px-6 py-2.5 rounded-full bg-cine-red text-white font-semibold text-sm"
        >
          Return to Homepage
        </button>
      </div>
    );
  }

  // Similar movies: same genre, excluding current
  const allMovies = dbService.getMovies();
  const similarMovies = allMovies
    .filter((m) => m.id !== movie.id && m.genres?.some((g) => movie.genres?.includes(g)))
    .slice(0, 4);

  const isInWatchlist = watchlist.includes(movie.id);

  return (
    <div className="min-h-screen text-zinc-100 pb-24">
      
      {/* 1. Hero Backdrop Banner with 3D Depth */}
      <div
        className="relative w-full h-[480px] sm:h-[580px] lg:h-[660px] overflow-hidden select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
      >
        <div
          className="absolute inset-0 transition-transform duration-300 ease-out"
          style={{
            transform: `scale(1.08) translate3d(${mousePos.x * 0.5}px, ${-mousePos.y * 0.5}px, 0)`
          }}
        >
          <img
            src={movie.backdrop || movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover object-center filter brightness-[0.55] contrast-[1.1]"
          />
        </div>

        {/* Ambient Overlay Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent w-full lg:w-3/5" />

        {/* Back Button */}
        <div className="absolute top-24 left-4 sm:left-8 z-30">
          <button
            onClick={() => {
              audioService.playClick();
              onNavigate('home');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel hover:bg-white/20 text-xs font-semibold text-zinc-200 transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Discovery</span>
          </button>
        </div>
      </div>

      {/* 2. Main Content Container (Negative margin pulling over banner) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-72 sm:-mt-80 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: 3D Floating Poster & Fast Actions */}
          <div className="lg:col-span-4 flex flex-col items-center sm:items-start perspective-1000">
            <div
              className="relative w-64 sm:w-80 aspect-[2/3] rounded-3xl overflow-hidden glass-card shadow-2xl border border-white/20 preserve-3d group transition-transform duration-300 ease-out"
              style={{
                transform: `rotateY(${-mousePos.x * 0.6}deg) rotateX(${mousePos.y * 0.6}deg) scale3d(1.02, 1.02, 1.02)`
              }}
            >
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

              {/* Legal Badge on Poster */}
              {movie.downloadAuthorized && (
                <div className="absolute top-4 left-4 z-20">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Authorized 4K
                  </span>
                </div>
              )}
            </div>

            {/* Poster Quick Action Buttons */}
            <div className="w-full max-w-xs mt-6 space-y-3">
              {/* Play Trailer Primary */}
              <button
                onClick={() => {
                  audioService.playClick();
                  onPlayTrailer(movie);
                }}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-r from-cine-red to-cine-purple hover:scale-[1.02] active:scale-95 text-white font-bold text-sm shadow-glow-red transition-all"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Watch Official Trailer</span>
              </button>

              {/* Download Button (or Disabled Notice) */}
              {movie.downloadAuthorized ? (
                <button
                  onClick={() => {
                    audioService.playClick();
                    onOpenDownload(movie);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-sm font-semibold backdrop-blur-md transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Movie (Legal 4K)</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    audioService.playClick();
                    onOpenDownload(movie);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-zinc-900/80 text-zinc-400 border border-white/10 text-xs font-medium cursor-pointer hover:border-white/20 hover:text-zinc-300"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Download Info (Restricted)</span>
                </button>
              )}

              {/* Admin Direct Upload Action */}
              {authService.getCurrentUser()?.role === 'admin' && (
                <button
                  onClick={() => {
                    audioService.playClick();
                    onOpenDownload(movie);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-cine-purple/15 hover:bg-cine-purple/25 text-cine-purple border border-cine-purple/30 text-xs font-semibold transition-all hover:scale-[1.01]"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Admin: Upload / Manage Movie Files</span>
                </button>
              )}

              {/* Utility Row: Watchlist, Favorite, Share */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  onClick={() => {
                    audioService.playClick();
                    onToggleWatchlist(movie.id);
                  }}
                  title="Watchlist"
                  className={`p-3 rounded-xl glass-panel border flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-all ${
                    isInWatchlist
                      ? 'bg-cine-red/20 border-cine-red text-cine-red'
                      : 'text-zinc-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {isInWatchlist ? <Check className="w-4 h-4 stroke-[3]" /> : <Bookmark className="w-4 h-4" />}
                  <span>{isInWatchlist ? 'Saved' : 'Watchlist'}</span>
                </button>

                <button
                  onClick={handleToggleFavorite}
                  title="Favorite"
                  className={`p-3 rounded-xl glass-panel border flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-all ${
                    isFavorite
                      ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                      : 'text-zinc-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>Favorite</span>
                </button>

                <button
                  onClick={handleShare}
                  title="Share"
                  className="p-3 rounded-xl glass-panel border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Metadata, Cast, Screenshots */}
          <div className="lg:col-span-8 space-y-8 pt-4">
            
            {/* Title & Tagline */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cine-red/20 text-cine-red border border-cine-red/30">
                  {movie.genres?.[0] || 'Feature'}
                </span>
                <span className="text-xs text-zinc-400">
                  License: <strong className="text-zinc-200">{movie.licenseType || 'Public Domain'}</strong>
                </span>
              </div>

              <h1 className="font-cinematic font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-wide leading-tight">
                {movie.title}
              </h1>

              {movie.tagline && (
                <p className="text-base sm:text-lg text-cine-cyan font-medium italic mt-2">
                  "{movie.tagline}"
                </p>
              )}
            </div>

            {/* Meta Specs Grid Bar */}
            <div className="p-4 rounded-2xl glass-panel border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Star className="w-5 h-5 fill-amber-400" />
                </div>
                <div>
                  <div className="text-zinc-400 font-medium">IMDb Rating</div>
                  <div className="font-bold text-sm text-white">{movie.rating.toFixed(1)} / 10</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-zinc-400 font-medium">Duration</div>
                  <div className="font-bold text-sm text-white">{movie.duration}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-zinc-400 font-medium">Release Year</div>
                  <div className="font-bold text-sm text-white">{movie.year}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-zinc-400 font-medium">Audio Specs</div>
                  <div className="font-bold text-sm text-white">Dolby 5.1 / Atmos</div>
                </div>
              </div>
            </div>

            {/* Synopsis */}
            <div>
              <h3 className="font-cinematic font-bold text-xl text-white mb-2">Synopsis</h3>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                {movie.synopsis}
              </p>
            </div>

            {/* Genres & Languages */}
            <div className="flex flex-wrap gap-8 py-3 border-y border-white/5">
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                  Genres
                </span>
                <div className="flex flex-wrap gap-2">
                  {(movie.genres || []).map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-zinc-200 border border-white/10"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                  Languages
                </span>
                <div className="flex flex-wrap gap-2">
                  {(movie.languages || ['English']).map((lang) => (
                    <span
                      key={lang}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-zinc-300 border border-white/10"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Director & Cast Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-cinematic font-bold text-xl text-white">Cast & Crew</h3>
                {movie.director && (
                  <span className="text-xs text-zinc-400">
                    Directed by <strong className="text-cine-red">{movie.director}</strong>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(movie.cast || []).map((member, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-2xl glass-panel border border-white/10"
                  >
                    <img
                      src={member.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                      alt={member.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/10 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{member.name}</div>
                      <div className="text-[11px] text-zinc-400 truncate">{member.character}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Screenshots Gallery */}
            {movie.screenshots && movie.screenshots.length > 0 && (
              <div>
                <h3 className="font-cinematic font-bold text-xl text-white mb-4">
                  Cinematic Stills & Gallery
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {movie.screenshots.map((shot, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        audioService.playClick();
                        setSelectedScreenshot(shot);
                      }}
                      className="relative aspect-video rounded-2xl overflow-hidden glass-panel border border-white/10 group cursor-pointer shadow-lg"
                    >
                      <img
                        src={shot}
                        alt={`${movie.title} Still ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Formats & Resolutions Info Box */}
            {movie.downloadAuthorized && movie.downloadFiles && (
              <div className="p-5 rounded-2xl glass-panel border border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorized File Distribution Info</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {movie.downloadFiles.map((f) => (
                    <div key={f.resolution} className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <div className="font-bold text-white">{f.resolution}</div>
                      <div className="text-[11px] text-emerald-400 font-mono mt-0.5">{f.size}</div>
                      <div className="text-[10px] text-zinc-400">{f.format}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* 3. Similar Movies Section */}
        {similarMovies.length > 0 && (
          <div className="mt-24 pt-12 border-t border-white/10">
            <h2 className="font-cinematic font-bold text-2xl sm:text-3xl text-white mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-6">
              {similarMovies.map((simMovie) => (
                <Card3D
                  key={simMovie.id}
                  movie={simMovie}
                  onViewDetails={(id) => onNavigate('movie', id)}
                  onPlayTrailer={onPlayTrailer}
                  onOpenDownload={onOpenDownload}
                  isInWatchlist={watchlist.includes(simMovie.id)}
                  onToggleWatchlist={onToggleWatchlist}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Screenshot Lightbox Modal */}
      {selectedScreenshot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div className="relative max-w-5xl w-full rounded-2xl overflow-hidden glass-panel border border-white/20">
            <img
              src={selectedScreenshot}
              alt="Movie Still"
              className="w-full h-auto max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}

    </div>
  );
}
