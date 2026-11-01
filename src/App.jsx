import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ParticleCanvas from './components/3d/ParticleCanvas';
import TrailerModal from './components/common/TrailerModal';
import DownloadModal from './components/download/DownloadModal';
import AuthModal from './components/common/AuthModal';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import StaticPages from './pages/StaticPages';
import { dbService } from './services/dbService';
import { authService } from './services/authService';
import { audioService } from './services/audioService';
import { useToast } from './components/common/Toast';

export default function App() {
  const { addToast } = useToast();
  const [movies, setMovies] = useState(dbService.getMovies());
  const [watchlist, setWatchlist] = useState(authService.getWatchlist());
  const [currentRoute, setCurrentRoute] = useState('home');
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [routeParams, setRouteParams] = useState({});

  // Modals
  const [activeTrailerMovie, setActiveTrailerMovie] = useState(null);
  const [activeDownloadMovie, setActiveDownloadMovie] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Theme
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Listen to DB and Auth changes
  useEffect(() => {
    const unsubDb = dbService.subscribe((updatedMovies) => {
      setMovies(updatedMovies);
    });

    const unsubAuth = authService.subscribe(() => {
      setWatchlist(authService.getWatchlist());
    });

    return () => {
      unsubDb();
      unsubAuth();
    };
  }, []);

  // Sync theme with DOM root class
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [isDarkMode]);

  // Handle URL hash changes
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      if (hash.startsWith('movie/')) {
        const id = hash.replace('movie/', '');
        setSelectedMovieId(id);
        setCurrentRoute('movie');
      } else {
        setCurrentRoute(hash);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (route, param = null) => {
    audioService.playClick();
    if (route === 'movie') {
      setSelectedMovieId(param);
      window.location.hash = `movie/${param}`;
      setCurrentRoute('movie');
    } else if (typeof param === 'object' && param !== null) {
      setRouteParams(param);
      window.location.hash = route;
      setCurrentRoute(route);
    } else {
      window.location.hash = route;
      setCurrentRoute(route);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleWatchlist = (movieId) => {
    const isNowIn = authService.toggleWatchlist(movieId);
    setWatchlist(authService.getWatchlist());
    const m = dbService.getMovieById(movieId);
    audioService.playSuccess();
    addToast({
      type: 'success',
      title: isNowIn ? 'Saved to Watchlist' : 'Removed from Watchlist',
      message: `"${m?.title || 'Movie'}" has been updated in your personal watchlist.`
    });
  };

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className="relative min-h-screen bg-background text-zinc-100 flex flex-col font-sans transition-colors duration-500">
      
      {/* 3D Background Particles */}
      <ParticleCanvas />

      {/* Top Navbar */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        movies={movies}
        onOpenLogin={() => setIsAuthModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main View Router */}
      <main className="flex-1 relative z-10">
        {currentRoute === 'home' && (
          <Home
            movies={movies}
            onViewDetails={(id) => navigateTo('movie', id)}
            onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
            onOpenDownload={(movie) => setActiveDownloadMovie(movie)}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onNavigate={navigateTo}
          />
        )}

        {currentRoute === 'movie' && (
          <MovieDetails
            movieId={selectedMovieId}
            onNavigate={navigateTo}
            onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
            onOpenDownload={(movie) => setActiveDownloadMovie(movie)}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
          />
        )}

        {currentRoute === 'explore' && (
          <Explore
            movies={movies}
            initialGenre={routeParams.genre || 'all'}
            onViewDetails={(id) => navigateTo('movie', id)}
            onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
            onOpenDownload={(movie) => setActiveDownloadMovie(movie)}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
          />
        )}

        {currentRoute === 'public-domain' && (
          <Explore
            movies={movies.filter((m) => m.downloadAuthorized)}
            initialGenre="all"
            onViewDetails={(id) => navigateTo('movie', id)}
            onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
            onOpenDownload={(movie) => setActiveDownloadMovie(movie)}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
          />
        )}

        {currentRoute === 'watchlist' && (
          <Profile
            onViewDetails={(id) => navigateTo('movie', id)}
            onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
            onOpenDownload={(movie) => setActiveDownloadMovie(movie)}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onNavigate={navigateTo}
          />
        )}

        {currentRoute === 'profile' && (
          <Profile
            onViewDetails={(id) => navigateTo('movie', id)}
            onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
            onOpenDownload={(movie) => setActiveDownloadMovie(movie)}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onNavigate={navigateTo}
          />
        )}

        {currentRoute === 'admin' && (
          <Admin onNavigate={navigateTo} />
        )}

        {['about', 'faq', 'dmca', 'privacy'].includes(currentRoute) && (
          <StaticPages pageId={currentRoute} onNavigate={navigateTo} />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Global Modals */}
      {activeTrailerMovie && (
        <TrailerModal
          movie={activeTrailerMovie}
          onClose={() => setActiveTrailerMovie(null)}
        />
      )}

      {activeDownloadMovie && (
        <DownloadModal
          movie={activeDownloadMovie}
          onClose={() => setActiveDownloadMovie(null)}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

    </div>
  );
}
