import React, { useState, useEffect } from 'react';
import { Play, Info, Download, ShieldCheck, ChevronLeft, ChevronRight, Star, Sparkles, Volume2 } from 'lucide-react';
import { audioService } from '../../services/audioService';

export default function HeroBanner3D({
  featuredMovies = [],
  onViewDetails,
  onPlayTrailer,
  onOpenDownload
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const activeMovie = featuredMovies[currentIndex] || featuredMovies[0];

  useEffect(() => {
    if (!featuredMovies.length || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [featuredMovies.length, isPaused]);

  const handlePrev = () => {
    audioService.playClick();
    setCurrentIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  };

  const handleNext = () => {
    audioService.playClick();
    setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
  };

  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    const x = ((clientX - left) / width - 0.5) * 20;
    const y = ((clientY - top) / height - 0.5) * -20;
    setMousePos({ x, y });
  };

  if (!activeMovie) return null;

  return (
    <div
      className="relative w-full min-h-[580px] lg:min-h-[720px] flex items-center overflow-hidden bg-background select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        setMousePos({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Background Images with Crossfade */}
      {featuredMovies.map((movie, idx) => (
        <div
          key={movie.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
          }`}
          style={{
            transform: `scale(${idx === currentIndex ? 1.05 : 1.1}) translate3d(${mousePos.x * 0.4}px, ${-mousePos.y * 0.4}px, 0)`,
            transition: 'transform 10s ease-out, opacity 1s ease-in-out'
          }}
        >
          <img
            src={movie.backdrop || movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover object-center filter brightness-[0.6] contrast-[1.1]"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&auto=format&fit=crop&q=80';
            }}
          />
        </div>
      ))}

      {/* Cinematic Gradient Vignettes */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent z-10 w-full lg:w-3/4" />
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none z-10" />

      {/* Hero Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text & Actions Column */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-5">
            {/* Top Trending Badge */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-cine-red/30 to-cine-purple/30 text-white border border-cine-red/40 backdrop-blur-md shadow-glow-red">
                <Sparkles className="w-3.5 h-3.5 text-cine-red animate-pulse" />
                Featured Premiere #0{currentIndex + 1}
              </span>

              {activeMovie.downloadAuthorized && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Authorized 4K Download
                </span>
              )}
            </div>

            {/* Movie Title with 3D Depth */}
            <h1
              className="font-cinematic font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide leading-tight drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
              style={{
                transform: `translate3d(${mousePos.x * 0.8}px, ${-mousePos.y * 0.8}px, 20px)`,
                transition: 'transform 0.15s ease-out'
              }}
            >
              {activeMovie.title}
            </h1>

            {/* Meta Tags Row */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-zinc-300 font-medium">
              <div className="flex items-center gap-1 text-amber-400 bg-black/50 px-2.5 py-1 rounded-full border border-amber-400/20">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-bold">{activeMovie.rating.toFixed(1)}</span>
                <span className="text-zinc-500 text-[10px]">IMDb</span>
              </div>
              <span>{activeMovie.year}</span>
              <span className="text-zinc-500">•</span>
              <span>{activeMovie.duration}</span>
              <span className="text-zinc-500">•</span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/10 text-xs">
                {activeMovie.ageRating || 'PG-13'}
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-cine-blue font-semibold">Ultra HD / 4K</span>
            </div>

            {/* Tagline & Synopsis */}
            <p className="text-sm sm:text-base text-zinc-300 max-w-xl line-clamp-3 leading-relaxed drop-shadow">
              {activeMovie.synopsis}
            </p>

            {/* Genres Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {(activeMovie.genres || []).map((genre) => (
                <span
                  key={genre}
                  className="text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 text-zinc-200 border border-white/10 backdrop-blur-md transition-colors"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              {/* Watch Trailer */}
              <button
                onClick={() => {
                  audioService.playClick();
                  onPlayTrailer?.(activeMovie);
                }}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-cine-red to-cine-crimson hover:from-cine-crimson hover:to-cine-red text-white font-semibold text-sm sm:text-base shadow-glow-red hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Watch Trailer</span>
              </button>

              {/* View Details */}
              <button
                onClick={() => {
                  audioService.playClick();
                  onViewDetails?.(activeMovie.id);
                }}
                className="flex items-center gap-2 px-5 py-3.5 rounded-full glass-panel hover:bg-white/15 text-white font-medium text-sm sm:text-base border border-white/20 hover:border-white/40 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <Info className="w-5 h-5 text-zinc-300" />
                <span>View Details</span>
              </button>

              {/* Download Button (Only when authorized) */}
              {activeMovie.downloadAuthorized && (
                <button
                  onClick={() => {
                    audioService.playClick();
                    onOpenDownload?.(activeMovie);
                  }}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 font-medium text-sm sm:text-base backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Movie</span>
                </button>
              )}
            </div>
          </div>

          {/* Right 3D Poster Showcase (Desktop) */}
          <div className="hidden lg:col-span-5 lg:flex justify-center items-center perspective-1000">
            <div
              className="relative w-72 xl:w-80 aspect-[2/3] rounded-2xl overflow-hidden glass-card shadow-2xl border border-white/20 transition-transform duration-300 ease-out preserve-3d group cursor-pointer"
              style={{
                transform: `rotateY(${-mousePos.x * 0.8}deg) rotateX(${mousePos.y * 0.8}deg) scale3d(1.02, 1.02, 1.02)`
              }}
              onClick={() => {
                audioService.playClick();
                onViewDetails?.(activeMovie.id);
              }}
            >
              <img
                src={activeMovie.poster}
                alt={activeMovie.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white z-20">
                <span className="font-semibold text-zinc-200">Click to explore film</span>
                <span className="px-2 py-0.5 rounded bg-cine-red/80 font-bold uppercase text-[10px]">
                  {activeMovie.duration}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-6 right-6 sm:right-10 z-30 flex items-center gap-3">
        {/* Pagination Dots */}
        <div className="flex items-center gap-1.5 mr-2">
          {featuredMovies.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                audioService.playClick();
                setCurrentIndex(idx);
              }}
              title={`Slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-8 bg-cine-red shadow-glow-red' : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Prev / Next Buttons */}
        <button
          onClick={handlePrev}
          title="Previous Movie"
          className="p-2.5 rounded-full glass-panel hover:bg-white/20 border border-white/20 text-white transition-all hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          title="Next Movie"
          className="p-2.5 rounded-full glass-panel hover:bg-white/20 border border-white/20 text-white transition-all hover:scale-110 active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
