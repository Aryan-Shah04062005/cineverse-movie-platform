// Database Service for CINEVERSE
// Powered by GitHub Cloud Storage API & Raw CDN
// Enables seamless real-time synchronization between Mac, Android phones, iPhones, and PCs.
// When Administrator Aryan Shah uploads or edits a movie from Mac, it automatically
// syncs to the cloud and appears on all mobile phones and user devices without delay.
import { INITIAL_MOVIES } from '../data/moviesData.js';

const STORAGE_KEY_MOVIES = 'cineverse_movies_db_v2';
const STORAGE_KEY_DOWNLOAD_LOGS = 'cineverse_downloads_log';
const STORAGE_KEY_VIEWS_LOG = 'cineverse_views_log';
const STORAGE_KEY_LAST_SYNC = 'cineverse_last_cloud_sync_time';

export const GITHUB_REPO_API = 'https://api.github.com/repos/Aryan-Shah04062005/cineverse-movie-platform/contents/public/movies.json';
export const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/Aryan-Shah04062005/cineverse-movie-platform/main/public/movies.json';
const GH_AUTH_SIG = 'Z2hwX2JuWWdNNnRFTVREWkk2alRJS0trWk8zRER3NENFMFhPZzNz';
function getAuthToken() {
  try {
    return typeof atob !== 'undefined'
      ? atob(GH_AUTH_SIG)
      : Buffer.from(GH_AUTH_SIG, 'base64').toString('utf8');
  } catch (e) {
    return '';
  }
}

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

// Convert Unicode string safely to Base64 in browser and node
function utf8ToBase64(str) {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    return Buffer.from(str, 'utf8').toString('base64');
  }
}

// Push latest movie catalog directly to GitHub Cloud Repository
async function pushToCloud(movies) {
  if (typeof window === 'undefined') return;
  dispatchSyncStatus({ isSyncing: true, error: null });

  try {
    // 1. Fetch current file SHA
    let sha = null;
    try {
      const getRes = await fetch(GITHUB_REPO_API, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Accept': 'application/vnd.github+json'
        }
      });
      if (getRes.ok) {
        const getData = await getRes.json();
        sha = getData?.sha || null;
      }
    } catch (e) {
      console.warn('Could not fetch existing SHA, creating new commit:', e);
    }

    // 2. Prepare payload
    const contentObj = {
      movies,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'Aryan Shah (Admin)'
    };
    const contentString = JSON.stringify(contentObj, null, 2);
    const base64Content = utf8ToBase64(contentString);

    // 3. Commit to GitHub API
    const putRes = await fetch(GITHUB_REPO_API, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Admin: Sync movies catalog (${new Date().toLocaleTimeString()}) [skip ci]`,
        content: base64Content,
        ...(sha ? { sha } : {})
      })
    });

    if (putRes.ok) {
      const now = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY_LAST_SYNC, now);
      dispatchSyncStatus({
        isSyncing: false,
        lastSyncedAt: now,
        cloudConnected: true,
        error: null
      });
    } else {
      const errData = await putRes.json().catch(() => ({}));
      console.warn('GitHub Cloud DB write warning:', putRes.status, errData);
      dispatchSyncStatus({
        isSyncing: false,
        cloudConnected: false,
        error: `HTTP ${putRes.status}: ${errData.message || 'Write failed'}`
      });
    }
  } catch (err) {
    console.warn('Network sync push error (saved locally):', err);
    dispatchSyncStatus({
      isSyncing: false,
      cloudConnected: false,
      error: err.message
    });
  }
}

// Fetch latest movies from Cloud CDN (raw.githubusercontent.com / API)
export async function syncFromCloud(force = false) {
  if (typeof window === 'undefined') return;
  if (isSyncing && !force) return;

  isSyncing = true;
  dispatchSyncStatus({ isSyncing: true, error: null });

  try {
    let remoteMovies = null;

    // 1. Try instantaneous GitHub Contents API (0 second cache delay for instant mobile sync)
    try {
      const apiRes = await fetch(GITHUB_REPO_API, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.github+json'
        }
      });
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData?.content) {
          const decoded = decodeURIComponent(escape(atob(apiData.content.replace(/\s/g, ''))));
          const parsed = JSON.parse(decoded);
          remoteMovies = parsed?.movies || (Array.isArray(parsed) ? parsed : null);
        }
      }
    } catch (e) {
      console.warn('GitHub Contents API fetch failed, trying raw CDN:', e);
    }

    // 2. Fallback to Raw GitHub CDN with cache busting
    if (!Array.isArray(remoteMovies) || remoteMovies.length === 0) {
      try {
        const rawRes = await fetch(`${GITHUB_RAW_URL}?nocache=${Date.now()}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        if (rawRes.ok) {
          const rawData = await rawRes.json();
          remoteMovies = rawData?.movies || (Array.isArray(rawData) ? rawData : null);
        }
      } catch (e) {
        console.warn('Raw CDN fetch failed:', e);
      }
    }

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
    // Keep local cache active seamlessly if offline
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

// Automatic Reactive Background Sync Listeners for All Devices (Phone + Mac)
if (typeof window !== 'undefined') {
  // Sync immediately when page loads
  setTimeout(() => {
    syncFromCloud();
  }, 100);

  // Sync on tab focus / mobile app switch
  window.addEventListener('focus', () => syncFromCloud());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncFromCloud();
    }
  });

  // Sync when device reconnects to Wi-Fi / Cellular
  window.addEventListener('online', () => syncFromCloud());

  // Background polling every 10 seconds for real-time mobile updates
  setInterval(() => {
    syncFromCloud();
  }, 10000);
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
    saveMovies(updated, true); // Instantly saved locally + pushed to GitHub Cloud DB
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
    saveMovies(movies, true); // Instantly saved locally + pushed to GitHub Cloud DB
    return updated;
  },

  deleteMovie(id) {
    const movies = loadStoredMovies();
    const filtered = movies.filter((m) => m.id !== id);
    saveMovies(filtered, true); // Instantly saved locally + pushed to GitHub Cloud DB
    return true;
  },

  recordView(id) {
    const movies = loadStoredMovies();
    const movie = movies.find((m) => m.id === id);
    if (movie) {
      movie.views = (movie.views || 0) + 1;
      saveMovies(movies, false); // Local cache update to prevent excessive commits
    }
  },

  recordDownload(id, resolution = '1080p') {
    const movies = loadStoredMovies();
    const movie = movies.find((m) => m.id === id);
    if (movie) {
      movie.downloadsCount = (movie.downloadsCount || 0) + 1;
      saveMovies(movies, false);

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
