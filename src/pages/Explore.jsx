import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Star,
  ShieldCheck,
  RotateCcw,
  Film,
  Sparkles
} from 'lucide-react';
import Card3D from '../components/3d/Card3D';
import { CATEGORIES } from '../data/moviesData';
import { audioService } from '../services/audioService';

export default function Explore({
  movies = [],
  initialGenre = 'all',
  onViewDetails,
  onPlayTrailer,
  onOpenDownload,
  watchlist = [],
  onToggleWatchlist
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [yearFilter, setYearFilter] = useState('all');
  const [authorizedOnly, setAuthorizedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popularity'); // popularity | rating | year-desc | year-asc | title

  // Unique languages
  const languages = useMemo(() => {
    const set = new Set();
    movies.forEach((m) => {
      (m.languages || []).forEach((l) => set.add(l));
    });
    return Array.from(set);
  }, [movies]);

  // Filtered and sorted movies
  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      // Search term: title, actor, director, genre, synopsis
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = movie.title.toLowerCase().includes(query);
        const matchDirector = movie.director && movie.director.toLowerCase().includes(query);
        const matchCast = (movie.cast || []).some(
          (c) => c.name.toLowerCase().includes(query) || c.character.toLowerCase().includes(query)
        );
        const matchGenre = (movie.genres || []).some((g) => g.toLowerCase().includes(query));
        const matchSynopsis = movie.synopsis && movie.synopsis.toLowerCase().includes(query);

        if (!matchTitle && !matchDirector && !matchCast && !matchGenre && !matchSynopsis) {
          return false;
        }
      }

      // Genre filter
      if (selectedGenre !== 'all') {
        if (!(movie.genres || []).includes(selectedGenre)) return false;
      }

      // Language filter
      if (selectedLanguage !== 'all') {
        if (!(movie.languages || []).includes(selectedLanguage)) return false;
      }

      // Rating filter
      if (movie.rating < minRating) return false;

      // Year filter
      if (yearFilter === 'classics' && movie.year > 1970) return false;
      if (yearFilter === 'modern' && movie.year <= 1970) return false;
      if (yearFilter === '2020s' && movie.year < 2020) return false;

      // Authorized downloads filter
      if (authorizedOnly && !movie.downloadAuthorized) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'year-desc') return (b.year || 0) - (a.year || 0);
      if (sortBy === 'year-asc') return (a.year || 0) - (b.year || 0);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return (b.views || 0) - (a.views || 0); // default: popularity
    });
  }, [movies, searchTerm, selectedGenre, selectedLanguage, minRating, yearFilter, authorizedOnly, sortBy]);

  const handleResetFilters = () => {
    audioService.playClick();
    setSearchTerm('');
    setSelectedGenre('all');
    setSelectedLanguage('all');
    setMinRating(0);
    setYearFilter('all');
    setAuthorizedOnly(false);
    setSortBy('popularity');
  };

  const hasActiveFilters =
    searchTerm ||
    selectedGenre !== 'all' ||
    selectedLanguage !== 'all' ||
    minRating > 0 ||
    yearFilter !== 'all' ||
    authorizedOnly;

  return (
    <div className="min-h-screen text-zinc-100 pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cine-red mb-1">
            <Sparkles className="w-4 h-4 fill-cine-red" />
            <span>Intelligent Search & Catalog</span>
          </div>
          <h1 className="font-cinematic font-black text-3xl sm:text-5xl text-white">
            Explore CINEVERSE
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Search across {movies.length} restored films, director catalogs, and open-source masterworks.
          </p>
        </div>

        {/* Search Bar & Primary Filter Controls */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by movie title, actor, director, genre, or keyword..."
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl text-sm glass-input placeholder:text-zinc-500 shadow-xl"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-3.5 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Genre Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedGenre === cat.name || (cat.id === 'all' && selectedGenre === 'all');
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    audioService.playClick();
                    setSelectedGenre(cat.id === 'all' ? 'all' : cat.name);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-cine-red text-white shadow-glow-red'
                      : 'glass-panel text-zinc-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Filter Toolbar Card */}
          <div className="p-4 rounded-2xl glass-panel border border-white/10 flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Language Dropdown */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-zinc-400">Language:</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cine-red"
                >
                  <option value="all">All Languages</option>
                  {languages.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Release Era */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-zinc-400">Era:</span>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cine-red"
                >
                  <option value="all">All Eras</option>
                  <option value="modern">Modern (Post 1970)</option>
                  <option value="classics">Classic Cinema (Pre 1970)</option>
                  <option value="2020s">2020s Releases</option>
                </select>
              </div>

              {/* Rating Threshold */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-zinc-400">Min Rating:</span>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cine-red"
                >
                  <option value={0}>Any Rating</option>
                  <option value={8.0}>8.0+ Stars</option>
                  <option value={8.5}>8.5+ Stars</option>
                  <option value={9.0}>9.0+ Masterpiece</option>
                </select>
              </div>

              {/* Authorized Downloads Toggle */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 hover:border-emerald-500/40 transition-colors">
                <input
                  type="checkbox"
                  checked={authorizedOnly}
                  onChange={(e) => setAuthorizedOnly(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-emerald-500 bg-zinc-900 w-3.5 h-3.5"
                />
                <span className={`flex items-center gap-1 ${authorizedOnly ? 'text-emerald-400' : 'text-zinc-300'}`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Authorized Downloads Only
                </span>
              </label>
            </div>

            {/* Sort & Reset */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-zinc-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cine-red"
                >
                  <option value="popularity">Most Popular</option>
                  <option value="rating">Top Rated (IMDb)</option>
                  <option value="year-desc">Year (Newest First)</option>
                  <option value="year-asc">Year (Oldest First)</option>
                  <option value="title">Alphabetical (A-Z)</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-xs text-cine-red hover:underline px-2 py-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-white/5 pb-3">
          <span>
            Showing <strong className="text-white font-mono">{filteredMovies.length}</strong> of{' '}
            <strong className="text-white font-mono">{movies.length}</strong> titles
          </span>

          {hasActiveFilters && (
            <span className="text-cine-blue font-medium">Filters Active</span>
          )}
        </div>

        {/* Movies 3D Grid */}
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-5 sm:gap-6">
            {filteredMovies.map((movie) => (
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
          <div className="p-16 rounded-3xl glass-panel border border-white/10 text-center space-y-4 max-w-lg mx-auto">
            <Film className="w-12 h-12 text-zinc-600 mx-auto" />
            <h3 className="font-bold text-xl text-white">No Movies Match Your Criteria</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We couldn't find any titles with the active filters. Try loosening your keywords or reset all filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 rounded-full bg-cine-red text-white font-semibold text-xs shadow-glow-red hover:scale-105 transition-transform"
            >
              Reset All Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
