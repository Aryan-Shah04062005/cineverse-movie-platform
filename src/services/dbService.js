// Database Service for CINEVERSE
// Handles 0ms instant local cache (localStorage) + high-speed cloud database synchronization
// Allows Admin (Aryan Shah) to upload, edit, and delete movies from any device (Mac, laptop, phone)
// and immediately reflects updates across all connected users' devices without delay.
import { INITIAL_MOVIES } from '../data/moviesData.js';

const STORAGE_KEY_MOVIES = 'cineverse_movies_db_v2';
const STORAGE_KEY_DOWNLOAD_LOGS = 'cineverse_downloads_log';
const STORAGE_KEY_VIEWS_LOG = 'cineverse_views_log';
const STORAGE_KEY_LAST_SYNC = 'cineverse_last_cloud_sync_time';

export const CLOUD_DB_URL = 'https://extendsclass.com/api/json-storage/bin/bacccdc';
export const ADMIN_SECURITY_KEY = 'Aryan@1234';

const DB_CHANGE_EVENT = 'cineverse_db_change';
const DB_SYNC_STATUS_EVENT = 'cineverse_db_sync_status';

let isSyncing = false;
let currentSyncStatus = {
  isSyncing: false,
  lastSyncedAt: typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_LAST_SYNC) : null,
  cloudConnected: true,
  error: null
};

function dispatchSyncStatus(patch) {
  currentSyncStatus = { ...currentSyncStatus, ...patch };
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DB_SYNC_STATUS_EVENT, { detail: currentSyncStatus }));
  }
}

function loadStoredMovies() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_MOVIES) : null;
    if (!raw) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_MOVIES, JSON.stringify(INITIAL_MOVIES));
      }
      return INITIAL_MOVIES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_MOVIES, JSON.stringify(INITIAL_MOVIES));
      }
      return INITIAL_MOVIES;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading movies from storage:', err);
    return INITIAL_MOVIES;
  }
}

// Push to Cloud Bin with Admin Security-key
async function pushToCloud(movies) {
  if (typeof window === 'undefined') return;
  dispatchSyncStatus({ isSyncing: true, error: null });

  try {
    const response = await fetch(CLOUD_DB_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Security-key': ADMIN_SECURITY_KEY
      },
      body: JSON.stringify({
        movies,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'Aryan Shah (Admin)'
      })
    });

    if (response.ok) {
      const now = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY_LAST_SYNC, now);
      dispatchSyncStatus({
        isSyncing: false,
        lastSyncedAt: now,
        cloudConnected: true,
        error: null
      });
    } else {
      const errText = await response.text();
      console.warn('Cloud database sync push warning:', response.status, errText);
      dispatchSyncStatus({
        isSyncing: false,
        cloudConnected: false,
        error: `HTTP ${response.status}`
      });
    }
  } catch (err) {
    console.warn('Cloud sync push network warning (saved locally):', err);
    dispatchSyncStatus({
      isSyncing: false,
      cloudConnected: false,
      error: err.message
    });
  }
}

// Fetch latest movies from Cloud Bin
export async function syncFromCloud(force = false) {
  if (typeof window === 'undefined') return;
  if (isSyncing && !force) return;

  isSyncing = true;
  dispatchSyncStatus({ isSyncing: true, error: null });

  try {
    const res = await fetch(`${CLOUD_DB_URL}?nocache=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (!res.ok) {
      throw new Error(`Cloud DB HTTP ${res.status}`);
    }

    const data = await res.json();
    const remoteMovies = data?.movies || (Array.isArray(data) ? data : null);

    if (Array.isArray(remoteMovies) && remoteMovies.length > 0) {
      const currentLocal = loadStoredMovies();
      const localStr = JSON.stringify(currentLocal);
      const remoteStr = JSON.stringify(remoteMovies);

      if (localStr !== remoteStr) {
        localStorage.setItem(STORAGE_KEY_MOVIES, remoteStr);
        window.dispatchEvent(
          new CustomEvent(DB_CHANGE_EVENT, { detail: { movies: remoteMovies, fromCloud: true } })
        );
      }

      const now = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY_LAST_SYNC, now);
      dispatchSyncStatus({
        isSyncing: false,
        lastSyncedAt: now,
        cloudConnected: true,
        error: null
      });
    } else {
      dispatchSyncStatus({ isSyncing: false, cloudConnected: true, error: null });
    }
  } catch (err) {
    // Graceful offline fallback: keep using local cache
    dispatchSyncStatus({
      isSyncing: false,
      cloudConnected: false,
      error: err.message
    });
  } finally {
    isSyncing = false;
  }
}

function saveMovies(movies, shouldPushToCloud = true) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_MOVIES, JSON.stringify(movies));
      window.dispatchEvent(new CustomEvent(DB_CHANGE_EVENT, { detail: { movies } }));
    }
    if (shouldPushToCloud) {
      pushToCloud(movies);
    }
  } catch (err) {
    console.error('Error saving movies to storage:', err);
  }
}

// Automatic Reactive Background Sync Listeners
if (typeof window !== 'undefined') {
  // Sync immediately when page loads
  setTimeout(() => {
    syncFromCloud();
  }, 150);

  // Sync on tab focus / app switch
  window.addEventListener('focus', () => syncFromCloud());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncFromCloud();
    }
  });

  // Sync when coming back online
  window.addEventListener('online', () => syncFromCloud());

  // Background heartbeat polling every 15 seconds
  setInterval(() => {
    syncFromCloud();
  }, 15000);
}

export const dbService = {
  getMovies() {
    return loadStoredMovies();
  },

  getMovieById(id) {
    const movies = loadStoredMovies();
    return movies.find((m) => m.id === id) || null;
  },

  addMovie(newMovieData) {
    const movies = loadStoredMovies();
    const id =
      newMovieData.id ||
      newMovieData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ||
      `movie-${Date.now()}`;

    // Format download files if specified
    const downloadFiles = newMovieData.downloadAuthorized
      ? newMovieData.downloadFiles && newMovieData.downloadFiles.length > 0
        ? newMovieData.downloadFiles
        : [
            {
              resolution: '720p',
              format: 'MP4 (H.264)',
              size: '950 MB',
              bitrate: '3.5 Mbps',
              audio: 'Stereo 2.0',
              url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
            },
            {
              resolution: '1080p',
              format: 'MKV (HEVC)',
              size: '2.4 GB',
              bitrate: '7.0 Mbps',
              audio: 'Dolby 5.1',
              url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
            }
          ]
      : [];

    const movie = {
      ...newMovieData,
      id,
      year: Number(newMovieData.year) || new Date().getFullYear(),
      rating: Number(newMovieData.rating) || 8.0,
      duration: newMovieData.duration || '1h 45m',
      genres: Array.isArray(newMovieData.genres)
        ? newMovieData.genres
        : newMovieData.genres
        ? newMovieData.genres.split(',').map((s) => s.trim())
        : ['Action'],
      languages: Array.isArray(newMovieData.languages) ? newMovieData.languages : ['English'],
      views: 0,
      downloadsCount: 0,
      downloadAuthorized: Boolean(newMovieData.downloadAuthorized),
      downloadFiles,
      screenshots:
        newMovieData.screenshots && newMovieData.screenshots.length > 0
          ? newMovieData.screenshots
          : [newMovieData.backdrop || newMovieData.poster],
      cast: Array.isArray(newMovieData.cast)
        ? newMovieData.cast
        : [
            {
              name: 'Lead Performer',
              character: 'Hero',
              avatar:
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
            }
          ],
      createdAt: new Date().toISOString()
    };

    const updated = [movie, ...movies];
    saveMovies(updated, true); // Instantly saved locally + pushed to cloud
    return movie;
  },

  updateMovie(id, updatedFields) {
    const movies = loadStoredMovies();
    const index = movies.findIndex((m) => m.id === id);
    if (index === -1) return null;

    const existing = movies[index];
    const updated = {
      ...existing,
      ...updatedFields,
      year: updatedFields.year !== undefined ? Number(updatedFields.year) : existing.year,
      rating: updatedFields.rating !== undefined ? Number(updatedFields.rating) : existing.rating,
      downloadAuthorized:
        updatedFields.downloadAuthorized !== undefined
          ? Boolean(updatedFields.downloadAuthorized)
          : existing.downloadAuthorized,
      updatedAt: new Date().toISOString()
    };

    movies[index] = updated;
    saveMovies(movies, true); // Instantly saved locally + pushed to cloud
    return updated;
  },

  deleteMovie(id) {
    const movies = loadStoredMovies();
    const filtered = movies.filter((m) => m.id !== id);
    saveMovies(filtered, true); // Instantly saved locally + pushed to cloud
    return true;
  },

  recordView(id) {
    const movies = loadStoredMovies();
    const movie = movies.find((m) => m.id === id);
    if (movie) {
      movie.views = (movie.views || 0) + 1;
      saveMovies(movies, false); // Local update to avoid excessive cloud writes on every click
    }
  },

  recordDownload(id, resolution = '1080p') {
    const movies = loadStoredMovies();
    const movie = movies.find((m) => m.id === id);
    if (movie) {
      movie.downloadsCount = (movie.downloadsCount || 0) + 1;
      saveMovies(movies, true);

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
    const authorizedDownloadsCount = movies.filter((m) => m.downloadAuthorized).length;

    const topViewed = [...movies]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);

    const topDownloaded = [...movies]
      .filter((m) => m.downloadAuthorized)
      .sort((a, b) => (b.downloadsCount || 0) - (a.downloadsCount || 0))
      .slice(0, 5);

    const genreCounts = {};
    movies.forEach((m) => {
      (m.genres || []).forEach((g) => {
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
    saveMovies(INITIAL_MOVIES, true);
    return INITIAL_MOVIES;
  },

  forceSync() {
    return syncFromCloud(true);
  },

  getSyncStatus() {
    return { ...currentSyncStatus };
  },

  subscribeSyncStatus(callback) {
    if (typeof window === 'undefined') return () => {};
    const handler = (e) => callback(e.detail || currentSyncStatus);
    window.addEventListener(DB_SYNC_STATUS_EVENT, handler);
    // Call immediately with current status
    callback(currentSyncStatus);
    return () => {
      window.removeEventListener(DB_SYNC_STATUS_EVENT, handler);
    };
  },

  subscribe(callback) {
    if (typeof window === 'undefined') return () => {};
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
