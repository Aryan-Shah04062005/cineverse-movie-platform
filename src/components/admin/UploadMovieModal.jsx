import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Film,
  HardDrive,
  CheckCircle,
  Sparkles,
  Lock,
  Plus,
  Play,
  Layers,
  ArrowRight
} from 'lucide-react';
import { dbService } from '../../services/dbService';
import { authService } from '../../services/authService';
import { audioService } from '../../services/audioService';
import { mediaStorageService } from '../../services/mediaStorageService';
import { useToast } from '../common/Toast';

export default function UploadMovieModal({ isOpen, onClose, targetMovie = null }) {
  const { addToast } = useToast();
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const isAdmin = currentUser?.role === 'admin';

  // Admin authentication if not already logged in
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Upload Form State
  const [videoFile, setVideoFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSizeFormatted, setFileSizeFormatted] = useState('');
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [movieTitle, setMovieTitle] = useState('');
  const [movieYear, setMovieYear] = useState(new Date().getFullYear());
  const [movieGenre, setMovieGenre] = useState('Action, Sci-Fi');
  const [movieDuration, setMovieDuration] = useState('1h 45m');
  const [movieResolution, setMovieResolution] = useState('1080p');
  const [movieFormat, setMovieFormat] = useState('MP4 (H.264)');
  const [movieSynopsis, setMovieSynopsis] = useState('');
  const [uploadMode, setUploadMode] = useState(targetMovie ? 'attach' : 'new'); // 'new' | 'attach'
  const [selectedTargetId, setSelectedTargetId] = useState(targetMovie?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef(null);
  const allMovies = dbService.getMovies();

  // Listen to auth changes
  useEffect(() => {
    const unsub = authService.subscribe(() => {
      setCurrentUser(authService.getCurrentUser());
    });
    return unsub;
  }, []);

  // Update target if passed
  useEffect(() => {
    if (targetMovie) {
      setSelectedTargetId(targetMovie.id);
      setUploadMode('attach');
    }
  }, [targetMovie]);

  if (!isOpen) return null;

  // Handle Quick Admin Auth
  const handleQuickLogin = (e) => {
    e.preventDefault();
    if (adminPassword === 'Aryan@1234') {
      const user = authService.login('Aryan Shah', 'Aryan@1234');
      setCurrentUser(user);
      sessionStorage.setItem('cineverse_admin_session_unlocked', 'true');
      setAuthError('');
      audioService.playSuccess();
      addToast({
        type: 'success',
        title: 'Admin Verified',
        message: 'Welcome Aryan Shah. You can now upload full movies directly.'
      });
    } else {
      setAuthError('Incorrect password. Please enter Aryan@1234 to proceed.');
      audioService.playClick();
    }
  };

  // Handle Mac File Selection from Downloads
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFile(file);
    setFileName(file.name);

    // Format size in MB or GB
    let formatted = '';
    if (file.size > 1024 * 1024 * 1024) {
      formatted = `${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    } else {
      formatted = `${Math.round(file.size / (1024 * 1024))} MB`;
    }
    setFileSizeFormatted(formatted);

    // Clean title from filename (e.g. "Tears_Of_Steel_4K.mp4" -> "Tears Of Steel")
    const clean = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[._-]/g, ' ')
      .replace(/\b(1080p|720p|480p|4k|2160p|hevc|x264|x265|aac|dts|bluray|webrip)\b/gi, '')
      .trim()
      .replace(/\b\w/g, (l) => l.toUpperCase());

    setMovieTitle(clean);
    setMovieSynopsis(`Experience ${clean} in full high-definition. Uploaded and legally authorized for direct download and streaming on CINEVERSE.`);

    // Auto-detect resolution
    const lower = file.name.toLowerCase();
    if (lower.includes('4k') || lower.includes('2160')) {
      setMovieResolution('4K UHD');
    } else if (lower.includes('720')) {
      setMovieResolution('720p');
    } else if (lower.includes('480')) {
      setMovieResolution('480p');
    } else {
      setMovieResolution('1080p');
    }

    if (lower.endsWith('.mkv')) {
      setMovieFormat('MKV (HEVC)');
    } else if (lower.endsWith('.mov')) {
      setMovieFormat('MOV (Apple ProRes)');
    } else {
      setMovieFormat('MP4 (H.264)');
    }

    // Create local preview URL
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);

    audioService.playClick();
    addToast({
      type: 'info',
      title: 'Movie File Selected',
      message: `${file.name} (${formatted}) loaded from your Mac.`
    });
  };

  // Submit Upload
  const handleUploadMovie = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      addToast({
        type: 'warning',
        title: 'No File Selected',
        message: 'Please choose a movie file from your Mac Downloads folder.'
      });
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Store the full video file in browser's persistent IndexedDB
      const fileId = `file-${Date.now()}`;
      await mediaStorageService.saveMovieFile(fileId, videoFile, {
        name: videoFile.name,
        resolution: movieResolution,
        format: movieFormat
      });

      // Direct persistent object URL
      const directDownloadUrl = videoPreviewUrl;

      const downloadFileEntry = {
        resolution: movieResolution,
        format: movieFormat,
        size: fileSizeFormatted,
        bitrate: movieResolution.includes('4K') ? '24.0 Mbps' : '8.5 Mbps',
        audio: 'Dolby 5.1 Surround',
        url: directDownloadUrl,
        storageFileId: fileId,
        isUploaded: true
      };

      if (uploadMode === 'attach') {
        // Attach to existing movie
        const target = dbService.getMovieById(selectedTargetId || allMovies[0]?.id);
        if (target) {
          const existing = target.downloadFiles || [];
          const updated = existing.filter((f) => f.resolution !== movieResolution);
          updated.unshift(downloadFileEntry);

          dbService.updateMovie(target.id, {
            downloadFiles: updated,
            downloadAuthorized: true
          });

          audioService.playSuccess();
          addToast({
            type: 'success',
            title: 'File Attached to Movie!',
            message: `"${target.title}" now has ${movieResolution} (${fileSizeFormatted}) ready for instant download.`
          });
        }
      } else {
        // Publish as a new movie
        const newMovie = {
          title: movieTitle || 'New Movie',
          tagline: `Full ${movieResolution} Feature Presentation`,
          year: Number(movieYear) || new Date().getFullYear(),
          rating: 8.8,
          ageRating: 'PG-13',
          duration: movieDuration || '1h 45m',
          genres: movieGenre.split(',').map((g) => g.trim()),
          languages: ['English'],
          director: 'Aryan Shah Production',
          synopsis: movieSynopsis,
          poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
          backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&auto=format&fit=crop&q=80',
          trailerUrl: directDownloadUrl,
          downloadAuthorized: true,
          licenseType: 'Authorized Distribution',
          downloadFiles: [downloadFileEntry],
          featured: true,
          trending: true
        };

        const created = dbService.addMovie(newMovie);
        audioService.playSuccess();
        addToast({
          type: 'success',
          title: 'Movie Published & Ready!',
          message: `"${created.title}" is now published on CINEVERSE! Users on laptops and phones can download it directly.`
        });
      }

      setIsProcessing(false);
      onClose();
    } catch (err) {
      console.error('Upload error:', err);
      setIsProcessing(false);
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: 'Could not store movie file. Please try again.'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl rounded-3xl glass-panel border border-cine-purple/40 p-6 sm:p-8 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            audioService.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cine-purple to-cine-red p-0.5 shadow-glow-purple flex-shrink-0">
            <div className="w-full h-full bg-background rounded-[14px] flex items-center justify-center">
              <Upload className="w-6 h-6 text-cine-purple" />
            </div>
          </div>
          <div>
            <h2 className="font-cinematic font-bold text-xl sm:text-2xl text-white">
              Upload Movie from Mac Downloads
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select full movie files (.mp4, .mkv, .mov) from your computer to enable instant downloads for all users.
            </p>
          </div>
        </div>

        {/* Gatekeeper if Admin is not logged in */}
        {!isAdmin ? (
          <div className="p-6 rounded-2xl bg-black/60 border border-cine-purple/30 text-center space-y-4 my-2">
            <div className="w-12 h-12 rounded-xl bg-cine-purple/20 text-cine-purple flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Admin Authentication Required</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Enter your Admin password to unlock full movie uploading from your Mac.
              </p>
            </div>

            <form onSubmit={handleQuickLogin} className="space-y-3 max-w-xs mx-auto text-left">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Admin Username</label>
                <input
                  type="text"
                  disabled
                  value="Aryan Shah"
                  className="w-full px-3 py-2 rounded-xl text-xs glass-input opacity-80"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Admin Password</label>
                <input
                  type="password"
                  placeholder="Aryan@1234"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  autoFocus
                />
              </div>

              {authError && (
                <div className="text-[11px] text-rose-400 font-medium">{authError}</div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-cine-purple to-cine-red text-white font-bold text-xs shadow-glow-purple hover:scale-105 active:scale-95 transition-transform"
              >
                Verify & Unlock Uploader
              </button>
            </form>
          </div>
        ) : (
          /* Full Uploader Form */
          <form onSubmit={handleUploadMovie} className="space-y-5">
            {/* Mac File Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed cursor-pointer text-center transition-all select-none group ${
                videoFile
                  ? 'border-emerald-500/50 bg-emerald-500/10'
                  : 'border-cine-purple/40 hover:border-cine-purple hover:bg-white/5'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="video/*,.mp4,.mkv,.mov,.avi,.webm,.m4v"
                className="hidden"
              />
              <Upload className={`w-10 h-10 mx-auto mb-2 group-hover:scale-110 transition-transform ${
                videoFile ? 'text-emerald-400' : 'text-cine-purple'
              }`} />
              
              {videoFile ? (
                <div>
                  <div className="text-sm font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Selected: {fileName}</span>
                  </div>
                  <div className="text-xs text-zinc-300 font-mono mt-1">
                    File Size: <strong className="text-white">{fileSizeFormatted}</strong> • Format:{' '}
                    <strong className="text-white">{movieFormat}</strong>
                  </div>
                  <span className="inline-block mt-2 text-[10px] text-zinc-400 underline">
                    Click to choose a different video file
                  </span>
                </div>
              ) : (
                <div>
                  <div className="text-sm font-bold text-white">
                    Click to Choose Movie from your Mac Downloads (~/Downloads)
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Accepts all video formats: MP4, MKV, Apple QuickTime MOV, WebM, AVI
                  </p>
                </div>
              )}
            </div>

            {/* Upload Destination Choice */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUploadMode('new')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  uploadMode === 'new'
                    ? 'bg-cine-purple/20 border-cine-purple shadow-glow-purple text-white'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Plus className="w-4 h-4 text-cine-purple" />
                  <span>Publish as New Movie</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Creates a new title card on CINEVERSE homepage with this video file.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setUploadMode('attach')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  uploadMode === 'attach'
                    ? 'bg-cine-red/20 border-cine-red shadow-glow-red text-white'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <HardDrive className="w-4 h-4 text-cine-red" />
                  <span>Attach to Existing Movie</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Adds this resolution file to an existing movie's download options.
                </p>
              </button>
            </div>

            {/* Mode-Specific Fields */}
            {uploadMode === 'attach' ? (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Select Existing Movie
                </label>
                <select
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input"
                >
                  {allMovies.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.year})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              /* New Movie Details */
              <div className="space-y-3 p-4 rounded-2xl bg-black/40 border border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Movie Title</label>
                    <input
                      type="text"
                      required
                      value={movieTitle}
                      onChange={(e) => setMovieTitle(e.target.value)}
                      placeholder="e.g. Inception 4K"
                      className="w-full px-3.5 py-2 rounded-xl text-xs glass-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Genres</label>
                    <input
                      type="text"
                      value={movieGenre}
                      onChange={(e) => setMovieGenre(e.target.value)}
                      placeholder="Action, Sci-Fi, Adventure"
                      className="w-full px-3.5 py-2 rounded-xl text-xs glass-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Release Year</label>
                    <input
                      type="number"
                      value={movieYear}
                      onChange={(e) => setMovieYear(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Duration</label>
                    <input
                      type="text"
                      value={movieDuration}
                      onChange={(e) => setMovieDuration(e.target.value)}
                      placeholder="1h 48m"
                      className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Resolution</label>
                    <select
                      value={movieResolution}
                      onChange={(e) => setMovieResolution(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                    >
                      <option value="480p">480p SD</option>
                      <option value="720p">720p HD</option>
                      <option value="1080p">1080p FHD</option>
                      <option value="4K UHD">4K UHD Master</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Synopsis</label>
                  <textarea
                    rows={2}
                    value={movieSynopsis}
                    onChange={(e) => setMovieSynopsis(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>
              </div>
            )}

            {/* Submit Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full glass-panel text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!videoFile || isProcessing}
                className={`px-6 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 transition-all shadow-glow-red ${
                  !videoFile || isProcessing
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cine-red to-cine-purple hover:scale-105 active:scale-95 text-white'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>{isProcessing ? 'Processing Movie File...' : 'Upload & Enable User Downloads'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
