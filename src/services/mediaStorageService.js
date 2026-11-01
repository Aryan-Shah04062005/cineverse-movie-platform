// IndexedDB Media Storage Service for CINEVERSE
// Handles storing and retrieving full movie video files and blobs (up to multiple GBs)
// directly in the browser's persistent storage on Mac, PC, and mobile.

const DB_NAME = 'CineverseMediaDB';
const DB_VERSION = 1;
const STORE_NAME = 'movie_files';

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        console.error('IndexedDB open error:', event.target.error);
        reject(event.target.error);
      };
    });
  }
  return dbPromise;
}

export const mediaStorageService = {
  // Store a real movie file blob in IndexedDB
  async saveMovieFile(fileId, fileBlob, metadata = {}) {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const record = {
          id: fileId,
          blob: fileBlob,
          name: metadata.name || fileBlob.name || 'movie.mp4',
          type: fileBlob.type || 'video/mp4',
          size: fileBlob.size,
          resolution: metadata.resolution || '1080p',
          format: metadata.format || 'MP4',
          uploadedAt: new Date().toISOString()
        };

        const putRequest = store.put(record);

        putRequest.onsuccess = () => {
          resolve(record);
        };

        putRequest.onerror = (e) => {
          console.error('Error saving movie blob to IndexedDB:', e);
          reject(e);
        };
      });
    } catch (err) {
      console.error('saveMovieFile failed:', err);
      throw err;
    }
  },

  // Retrieve movie file and create a Blob URL for direct download and streaming
  async getMovieFile(fileId) {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const getRequest = store.get(fileId);

        getRequest.onsuccess = () => {
          const result = getRequest.result;
          if (result && result.blob) {
            const objectUrl = URL.createObjectURL(result.blob);
            resolve({
              ...result,
              url: objectUrl
            });
          } else {
            resolve(null);
          }
        };

        getRequest.onerror = (e) => {
          reject(e);
        };
      });
    } catch (err) {
      console.error('getMovieFile failed:', err);
      return null;
    }
  },

  // Delete a movie file from storage
  async deleteMovieFile(fileId) {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const delRequest = store.delete(fileId);
        delRequest.onsuccess = () => resolve(true);
        delRequest.onerror = (e) => reject(e);
      });
    } catch (err) {
      console.error('deleteMovieFile failed:', err);
      return false;
    }
  },

  // Get all uploaded movie files metadata
  async getAllFiles() {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          const items = (getAllRequest.result || []).map((r) => ({
            id: r.id,
            name: r.name,
            size: r.size,
            type: r.type,
            resolution: r.resolution,
            format: r.format,
            uploadedAt: r.uploadedAt
          }));
          resolve(items);
        };

        getAllRequest.onerror = (e) => reject(e);
      });
    } catch {
      return [];
    }
  }
};
