import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Flame,
  Star,
  Award,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Film,
  Zap,
  ArrowRight
} from 'lucide-react';
import HeroBanner3D from '../components/3d/HeroBanner3D';
import Card3D from '../components/3d/Card3D';
import { CATEGORIES } from '../data/moviesData';
import { audioService } from '../services/audioService';

export default function Home({
  movies = [],
  onViewDetails,
  onPlayTrailer,
  onOpenDownload,
  watchlist = [],
  onToggleWatchlist,
  onNavigate
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const trendingScrollRef = useRef(null);
  const classicsScrollRef = useRef(null);

  const featuredMovies = movies.filter((m) => m.featured);
  const trendingMovies = [...movies].sort((a, b) => (b.views || 0) - (a.views || 0));
  const topRatedMovies = [...movies].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);
  const publicDomainClassics = movies.filter((m) => m.downloadAuthorized);
  const latestMovies = [...movies].sort((a, b) => (b.year || 0) - (a.year || 0)).slice(0, 8);

  // Filtered movies by category
  const categoryMovies = selectedCategory === 'all'
    ? movies
    : movies.filter((m) => (m.genres || []).includes(selectedCategory));

  const scrollContainer = (ref, direction) => {
    audioService.playClick();
    if (!ref.current) return;
    const scrollAmount = direction === 'left' ? -420 : 420;
    ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen text-zinc-100 pb-20">
      
      {/* 1. Hero 3D Carousel Section */}
      <section className="relative">
        <HeroBanner3D
          featuredMovies={featuredMovies.length > 0 ? featuredMovies : movies.slice(0, 5)}
          onViewDetails={onViewDetails}
          onPlayTrailer={onPlayTrailer}
          onOpenDownload={onOpenDownload}
        />
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 mt-10">

        {/* 2. Trending Movies 3D Horizontal Carousel */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cine-red mb-1">
                <Flame className="w-4 h-4 fill-cine-red animate-pulse" />
                <span>What The World Is Streaming</span>
              </div>
              <h2 className="font-cinematic font-bold text-2xl sm:text-3xl text-white">
                Trending Movies
              </h2>
            </div>

            {/* Scroll Navigation Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollContainer(trendingScrollRef, 'left')}
                title="Scroll Left"
                className="p-2.5 rounded-full glass-panel hover:bg-white/20 text-white transition-all hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollContainer(trendingScrollRef, 'right')}
                title="Scroll Right"
                className="p-2.5 rounded-full glass-panel hover:bg-white/20 text-white transition-all hover:scale-105 active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Scroll Row */}
          <div
            ref={trendingScrollRef}
            className="flex gap-5 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {trendingMovies.map((movie) => (
              <div key={movie.id} className="w-[260px] sm:w-[280px] flex-shrink-0 snap-start">
                <Card3D
                  movie={movie}
                  onViewDetails={onViewDetails}
                  onPlayTrailer={onPlayTrailer}
                  onOpenDownload={onOpenDownload}
                  isInWatchlist={watchlist.includes(movie.id)}
                  onToggleWatchlist={onToggleWatchlist}
                />
              </div>
            ))}
          </div>
        </section>

        {/* 3. Movie Categories Pill Bar & Live Grid */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cine-purple mb-1">
                <Sparkles className="w-4 h-4 text-cine-purple" />
                <span>Explore By Atmosphere</span>
              </div>
              <h2 className="font-cinematic font-bold text-2xl sm:text-3xl text-white">
                Movie Categories
              </h2>
            </div>

            <button
              onClick={() => {
                audioService.playClick();
                onNavigate('explore');
              }}
              className="text-xs font-semibold text-cine-red hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Explore All Filters</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Category Pill Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.name || (cat.id === 'all' && selectedCategory === 'all');
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    audioService.playClick();
                    setSelectedCategory(cat.id === 'all' ? 'all' : cat.name);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-r from-cine-red to-cine-purple text-white shadow-glow-red scale-105'
                      : 'glass-panel text-zinc-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Filtered Movies Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-5 sm:gap-6 mt-6">
            {categoryMovies.slice(0, 8).map((movie) => (
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
        </section>

        {/* 4. Public-Domain Classics Spotlight Banner */}
        <section className="relative rounded-3xl overflow-hidden glass-panel border border-emerald-500/30 p-8 sm:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Preserved Heritage & Open Cinema</span>
              </div>
              <h2 className="font-cinematic font-black text-3xl sm:text-4xl text-white">
                Legally Authorized 4K Downloads
              </h2>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                CINEVERSE celebrates film history and open-source animation. Explore fully restored public-domain masterpieces like Fritz Lang's <em className="text-white">Metropolis</em> and George A. Romero's <em className="text-white">Night of the Living Dead</em>, as well as Blender Foundation 4K open movies with genuine, high-bitrate direct downloads.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => {
                    audioService.playClick();
                    onNavigate('public-domain');
                  }}
                  className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>Browse Legal Classics Catalog</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="w-56 aspect-[2/3] rounded-2xl overflow-hidden border border-emerald-500/40 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 cursor-pointer"
                   onClick={() => onViewDetails('metropolis')}>
                <img
                  src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80"
                  alt="Metropolis"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 5. Public-Domain Classics Slider */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                <Award className="w-4 h-4" />
                <span>Free & Open Cinema</span>
              </div>
              <h2 className="font-cinematic font-bold text-2xl sm:text-3xl text-white">
                Authorized Public-Domain Masterpieces
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollContainer(classicsScrollRef, 'left')}
                title="Scroll Left"
                className="p-2.5 rounded-full glass-panel hover:bg-white/20 text-white transition-all hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollContainer(classicsScrollRef, 'right')}
                title="Scroll Right"
                className="p-2.5 rounded-full glass-panel hover:bg-white/20 text-white transition-all hover:scale-105 active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={classicsScrollRef}
            className="flex gap-5 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {publicDomainClassics.map((movie) => (
              <div key={movie.id} className="w-[260px] sm:w-[280px] flex-shrink-0 snap-start">
                <Card3D
                  movie={movie}
                  onViewDetails={onViewDetails}
                  onPlayTrailer={onPlayTrailer}
                  onOpenDownload={onOpenDownload}
                  isInWatchlist={watchlist.includes(movie.id)}
                  onToggleWatchlist={onToggleWatchlist}
                />
              </div>
            ))}
          </div>
        </section>

        {/* 6. Top Rated Movies Grid */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>Critically Acclaimed</span>
              </div>
              <h2 className="font-cinematic font-bold text-2xl sm:text-3xl text-white">
                Top Rated Masterpieces
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-6">
            {topRatedMovies.map((movie) => (
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
        </section>

        {/* 7. Latest Releases */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cine-blue mb-1">
                <Zap className="w-4 h-4 text-cine-blue" />
                <span>Fresh Additions</span>
              </div>
              <h2 className="font-cinematic font-bold text-2xl sm:text-3xl text-white">
                Latest Additions & Restorations
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-6">
            {latestMovies.map((movie) => (
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
        </section>

      </div>
    </div>
  );
}
