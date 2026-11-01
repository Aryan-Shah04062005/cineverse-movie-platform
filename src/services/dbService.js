// Database Service for CINEVERSE
// Handles persistence in localStorage, real-time reactive sync, analytics and CRUD operations.
import { INITIAL_MOVIES } from '../data/moviesData.js';

const STORAGE_KEY_MOVIES = 'cineverse_movies_db_v2';
const STORAGE_KEY_DOWNLOAD_LOGS = 'cineverse_downloads_log';
const STORAGE_KEY_VIEWS_LOG = 'cineverse_views_log';
const DB_CHANGE_EVENT = 'cineverse_db_change';

function loadStoredMovies() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MOVIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_MOVIES, JSON.stringify(INITIAL_MOVIES));
      return INITIAL_MOVIES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY_MOVIES, JSON.stringify(INITIAL_MOVIES));
      return INITIAL_MOVIES;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading movies from storage:', err);
    return INITIAL_MOVIES;
  }
}

function saveMovies(movies) {
  try {
    localStorage.setItem(STORAGE_KEY_MOVIES, JSON.stringify(movies));
    window.dispatchEvent(new CustomEvent(DB_CHANGE_EVENT, { detail: { movies } }));
  } catch (err) {
    console.error('Error saving movies to storage:', err);
  }
}

export const dbService = {
  getMovies() {
    return loadStoredMovies();
  },

  getMovieById(id) {
    const movies = loadStoredMovies();
    return movies.find(m => m.id === id) || null;
  },

  addMovie(newMovieData) {
    const movies = loadStoredMovies();
    const id = newMovieData.id || newMovieData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `movie-${Date.now()}`;
    
    // Format download files if specified
    const downloadFiles = newMovieData.downloadAuthorized ? (newMovieData.downloadFiles && newMovieData.downloadFiles.length > 0 ? newMovieData.downloadFiles : [
      { resolution: "720p", format: "MP4 (H.264)", size: "950 MB", bitrate: "3.5 Mbps", audio: "Stereo 2.0", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
      { resolution: "1080p", format: "MKV (HEVC)", size: "2.4 GB", bitrate: "7.0 Mbps", audio: "Dolby 5.1", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }
    ]) : [];

    const movie = {
      ...newMovieData,
      id,
      year: Number(newMovieData.year) || new Date().getFullYear(),
      rating: Number(newMovieData.rating) || 8.0,
      duration: newMovieData.duration || "1h 45m",
      genres: Array.isArray(newMovieData.genres) ? newMovieData.genres : (newMovieData.genres ? newMovieData.genres.split(',').map(s => s.trim()) : ["Action"]),
      languages: Array.isArray(newMovieData.languages) ? newMovieData.languages : ["English"],
      views: 0,
      downloadsCount: 0,
      downloadAuthorized: Boolean(newMovieData.downloadAuthorized),
      downloadFiles,
      screenshots: newMovieData.screenshots && newMovieData.screenshots.length > 0 ? newMovieData.screenshots : [newMovieData.backdrop || newMovieData.poster],
      cast: Array.isArray(newMovieData.cast) ? newMovieData.cast : [
        { name: "Lead Performer", character: "Hero", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" }
      ],
      createdAt: new Date().toISOString()
    };

    const updated = [movie, ...movies];
    saveMovies(updated);
    return movie;
  },

  updateMovie(id, updatedFields) {
    const movies = loadStoredMovies();
    const index = movies.findIndex(m => m.id === id);
    if (index === -1) return null;

    const existing = movies[index];
    const updated = {
      ...existing,
      ...updatedFields,
      year: updatedFields.year !== undefined ? Number(updatedFields.year) : existing.year,
      rating: updatedFields.rating !== undefined ? Number(updatedFields.rating) : existing.rating,
      downloadAuthorized: updatedFields.downloadAuthorized !== undefined ? Boolean(updatedFields.downloadAuthorized) : existing.downloadAuthorized,
      updatedAt: new Date().toISOString()
    };

    movies[index] = updated;
    saveMovies(movies);
    return updated;
  },

  deleteMovie(id) {
    const movies = loadStoredMovies();
    const filtered = movies.filter(m => m.id !== id);
    saveMovies(filtered);
    return true;
  },

  recordView(id) {
    const movies = loadStoredMovies();
    const movie = movies.find(m => m.id === id);
    if (movie) {
      movie.views = (movie.views || 0) + 1;
      saveMovies(movies);
    }
  },

  recordDownload(id, resolution = '1080p') {
    const movies = loadStoredMovies();
    const movie = movies.find(m => m.id === id);
    if (movie) {
      movie.downloadsCount = (movie.downloadsCount || 0) + 1;
      saveMovies(movies);

      // Log download event
      try {
        const rawLogs = localStorage.getItem(STORAGE_KEY_DOWNLOAD_LOGS);
        const logs = rawLogs ? JSON.parse(rawLogs) : [];
        logs.unshift({
          movieId: id,
          movieTitle: movie.title,
          resolution,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem(STORAGE_KEY_DOWNLOAD_LOGS, JSON.stringify(logs.slice(0, 50)));
      } catch (e) {
        console.error('Error logging download:', e);
      }
    }
  },

  getAnalytics() {
    const movies = loadStoredMovies();
    const totalMovies = movies.length;
    const totalViews = movies.reduce((sum, m) => sum + (m.views || 0), 0);
    const totalDownloads = movies.reduce((sum, m) => sum + (m.downloadsCount || 0), 0);
    const authorizedDownloadsCount = movies.filter(m => m.downloadAuthorized).length;

    // Sort by views
    const topViewed = [...movies]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);

    // Sort by downloads
    const topDownloaded = [...movies]
      .filter(m => m.downloadAuthorized)
      .sort((a, b) => (b.downloadsCount || 0) - (a.downloadsCount || 0))
      .slice(0, 5);

    // Genre count
    const genreCounts = {};
    movies.forEach(m => {
      (m.genres || []).forEach(g => {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      });
    });

    return {
      totalMovies,
      totalViews,
      totalDownloads,
      authorizedDownloadsCount,
      topViewed,
      topDownloaded,
      genreCounts
    };
  },

  resetDatabase() {
    localStorage.setItem(STORAGE_KEY_MOVIES, JSON.stringify(INITIAL_MOVIES));
    window.dispatchEvent(new CustomEvent(DB_CHANGE_EVENT, { detail: { movies: INITIAL_MOVIES } }));
    return INITIAL_MOVIES;
  },

  subscribe(callback) {
    const handler = (e) => callback(e.detail?.movies || loadStoredMovies());
    window.addEventListener(DB_CHANGE_EVENT, handler);
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY_MOVIES) {
        callback(loadStoredMovies());
      }
    });
    return () => {
      window.removeEventListener(DB_CHANGE_EVENT, handler);
    };
  }
};
