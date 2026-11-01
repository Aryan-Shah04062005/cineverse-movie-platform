import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Film,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Download,
  Users,
  CheckCircle,
  X,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Flame,
  Search,
  ExternalLink,
  ShieldCheck,
  Lock,
  Layers,
  Save,
  Upload,
  FolderDown,
  FileVideo,
  Check
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { authService } from '../services/authService';
import { audioService } from '../services/audioService';
import { useToast } from '../components/common/Toast';

export default function Admin({ onNavigate }) {
  const { addToast } = useToast();
  const [movies, setMovies] = useState(dbService.getMovies());
  const [analytics, setAnalytics] = useState(dbService.getAnalytics());
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [searchFilter, setSearchFilter] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

  // Quick Media Upload from Downloads State
  const [quickUploadFile, setQuickUploadFile] = useState(null);
  const [quickUploadName, setQuickUploadName] = useState('');
  const [quickTargetMovieId, setQuickTargetMovieId] = useState(movies[0]?.id || '');
  const [quickRes, setQuickRes] = useState('1080p');
  const [quickFormat, setQuickFormat] = useState('MP4 (H.264)');
  const [quickSize, setQuickSize] = useState('1.5 GB');
  const [quickUrl, setQuickUrl] = useState('');
  const quickFileRef = useRef(null);

  // Admin access unlock state: NEVER open without explicit login!
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
    return sessionStorage.getItem('cineverse_admin_session_unlocked') === 'true' &&
           authService.getCurrentUser()?.role === 'admin';
  });
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPin, setAdminPin] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [movieToEdit, setMovieToEdit] = useState(null);
  const [movieToDelete, setMovieToDelete] = useState(null);

  // Form State
  const initialForm = {
    title: '',
    tagline: '',
    year: new Date().getFullYear(),
    rating: 8.5,
    ageRating: 'PG-13',
    duration: '1h 45m',
    genres: 'Science Fiction, Action',
    languages: 'English',
    director: '',
    synopsis: '',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/embed/aqz-KE-bpKQ',
    downloadAuthorized: true,
    licenseType: 'Public Domain / Creative Commons',
    featured: false,
    trending: true
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    const unsub = dbService.subscribe((updated) => {
      setMovies(updated);
      setAnalytics(dbService.getAnalytics());
    });
    return unsub;
  }, []);

  const handleUnlockAdmin = (e) => {
    e.preventDefault();
    const cleanUser = (adminUsername || '').trim().toLowerCase();
    const isUserValid = cleanUser === 'aryan shah' || cleanUser === 'aryan' || cleanUser === 'aryan.shah@cineverse.io';
    const isPassValid = adminPin === 'Aryan@1234';

    if (isUserValid && isPassValid) {
      authService.login('Aryan Shah', 'Aryan@1234');
      sessionStorage.setItem('cineverse_admin_session_unlocked', 'true');
      setIsAdminUnlocked(true);
      audioService.playSuccess();
      addToast({
        type: 'success',
        title: 'Admin Access Granted',
        message: 'Welcome back, Administrator Aryan Shah. Full management controls unlocked.'
      });
    } else {
      audioService.playClick();
      addToast({
        type: 'error',
        title: 'Access Denied',
        message: 'Invalid administrative credentials. Access denied.'
      });
    }
  };

  const handleAdminLock = () => {
    audioService.playClick();
    sessionStorage.removeItem('cineverse_admin_session_unlocked');
    setIsAdminUnlocked(false);
    setAdminPin('');
    setAdminUsername('');
    addToast({
      type: 'info',
      title: 'Admin Dashboard Locked',
      message: 'Session ended. Dashboard is now locked.'
    });
  };

  // Add Movie
  const handleCreateMovie = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.synopsis) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Title and synopsis are required fields.'
      });
      return;
    }

    const created = dbService.addMovie({
      ...formData,
      genres: formData.genres.split(',').map((g) => g.trim()),
      languages: formData.languages.split(',').map((l) => l.trim())
    });

    audioService.playSuccess();
    addToast({
      type: 'success',
      title: 'Movie Added Successfully',
      message: `"${created.title}" is now published and saved permanently to the database.`
    });

    setIsAddModalOpen(false);
    setFormData(initialForm);
  };

  // Handle file selected from computer / Downloads
  const handleQuickFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setQuickUploadFile(file);
    setQuickUploadName(file.name);

    // Calculate size
    let formattedSize = '1.2 GB';
    if (file.size > 1024 * 1024 * 1024) {
      formattedSize = `${(file.size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    } else {
      formattedSize = `${Math.round(file.size / (1024 * 1024))} MB`;
    }
    setQuickSize(formattedSize);

    // Auto-detect resolution from filename
    const lower = file.name.toLowerCase();
    if (lower.includes('4k') || lower.includes('2160')) {
      setQuickRes('4K UHD');
    } else if (lower.includes('720')) {
      setQuickRes('720p');
    } else if (lower.includes('480')) {
      setQuickRes('480p');
    } else {
      setQuickRes('1080p');
    }

    if (lower.endsWith('.mkv')) {
      setQuickFormat('MKV (HEVC)');
    } else {
      setQuickFormat('MP4 (H.264)');
    }

    const objUrl = URL.createObjectURL(file);
    setQuickUrl(objUrl);

    audioService.playClick();
    addToast({
      type: 'info',
      title: 'File Loaded From Downloads',
      message: `${file.name} (${formattedSize}) is ready to attach or create a movie.`
    });
  };

  // Attach quick upload to existing movie
  const handleQuickAttachToMovie = () => {
    if (!quickTargetMovieId) {
      addToast({
        type: 'warning',
        title: 'Select Movie',
        message: 'Please choose which movie to attach this file to.'
      });
      return;
    }

    const targetMovie = dbService.getMovieById(quickTargetMovieId);
    if (!targetMovie) return;

    const newFile = {
      resolution: quickRes,
      format: quickFormat,
      size: quickSize,
      bitrate: quickRes.includes('4K') ? '22.0 Mbps' : '8.5 Mbps',
      audio: 'Dolby 5.1 Surround',
      url: quickUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
    };

    const existingFiles = targetMovie.downloadFiles || [];
    const updatedFiles = existingFiles.filter(f => f.resolution !== quickRes);
    updatedFiles.unshift(newFile);

    dbService.updateMovie(targetMovie.id, {
      downloadFiles: updatedFiles,
      downloadAuthorized: true
    });

    audioService.playSuccess();
    addToast({
      type: 'success',
      title: 'Download File Attached!',
      message: `Successfully attached ${quickRes} (${quickSize}) to "${targetMovie.title}".`
    });

    setQuickUploadFile(null);
    setQuickUploadName('');
  };

  // Create brand new movie draft from this file
  const handleQuickCreateNewMovie = () => {
    // Generate clean movie title from filename
    const cleanTitle = (quickUploadName || 'New Movie')
      .replace(/\.[^/.]+$/, '')
      .replace(/[._-]/g, ' ')
      .replace(/\b(1080p|720p|4k|2160p|hevc|x264|x265|aac|dts)\b/gi, '')
      .trim()
      .replace(/\b\w/g, l => l.toUpperCase());

    const newFile = {
      resolution: quickRes,
      format: quickFormat,
      size: quickSize,
      bitrate: quickRes.includes('4K') ? '22.0 Mbps' : '8.5 Mbps',
      audio: 'Dolby 5.1 Surround',
      url: quickUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
    };

    setFormData({
      ...initialForm,
      title: cleanTitle,
      tagline: `Experience ${cleanTitle} in pristine ${quickRes}`,
      synopsis: `An authorized public-domain cinematic masterwork featuring high-definition ${quickRes} presentation.`,
      downloadAuthorized: true,
      downloadFiles: [newFile]
    });

    audioService.playClick();
    setIsAddModalOpen(true);
    addToast({
      type: 'info',
      title: 'Movie Draft Created',
      message: `Draft populated from "${quickUploadName}". Review and click Create & Publish.`
    });
  };

  // Open Edit Modal
  const handleOpenEdit = (movie) => {
    audioService.playClick();
    setMovieToEdit(movie);
    setFormData({
      ...movie,
      genres: Array.isArray(movie.genres) ? movie.genres.join(', ') : movie.genres,
      languages: Array.isArray(movie.languages) ? movie.languages.join(', ') : movie.languages
    });
    setIsEditModalOpen(true);
  };

  // Save Edit Movie
  const handleUpdateMovie = (e) => {
    e.preventDefault();
    if (!movieToEdit) return;

    dbService.updateMovie(movieToEdit.id, {
      ...formData,
      genres: formData.genres.split(',').map((g) => g.trim()),
      languages: formData.languages.split(',').map((l) => l.trim())
    });

    audioService.playSuccess();
    addToast({
      type: 'success',
      title: 'Movie Updated',
      message: `Changes for "${formData.title}" have been saved permanently.`
    });

    setIsEditModalOpen(false);
    setMovieToEdit(null);
  };

  // Delete Movie Permanently
  const handleConfirmDelete = () => {
    if (!movieToDelete) return;
    const title = movieToDelete.title;
    dbService.deleteMovie(movieToDelete.id);

    audioService.playClick();
    addToast({
      type: 'info',
      title: 'Movie Deleted',
      message: `"${title}" has been permanently removed from the database and will not reappear on refresh.`
    });

    setMovieToDelete(null);
  };

  // Quick Toggles
  const handleToggleFeatured = (movie) => {
    audioService.playClick();
    const updated = !movie.featured;
    dbService.updateMovie(movie.id, { featured: updated });
    addToast({
      type: 'info',
      title: updated ? 'Added to Hero Premieres' : 'Removed from Hero Premieres',
      message: `"${movie.title}" featured status changed.`
    });
  };

  const handleToggleTrending = (movie) => {
    audioService.playClick();
    const updated = !movie.trending;
    dbService.updateMovie(movie.id, { trending: updated });
    addToast({
      type: 'info',
      title: updated ? 'Flagged as Trending' : 'Removed from Trending',
      message: `"${movie.title}" trending status changed.`
    });
  };

  const handleToggleDownloadAuth = (movie) => {
    audioService.playClick();
    const updated = !movie.downloadAuthorized;
    dbService.updateMovie(movie.id, { downloadAuthorized: updated });
    addToast({
      type: updated ? 'success' : 'warning',
      title: updated ? 'Download Authorized' : 'Download Restricted',
      message: `"${movie.title}" download authorization changed.`
    });
  };

  const handleResetCatalog = () => {
    if (confirm('Reset database to original sample curated movies?')) {
      dbService.resetDatabase();
      audioService.playSuccess();
      addToast({
        type: 'info',
        title: 'Database Reset',
        message: 'Restored original seed movies catalog.'
      });
    }
  };

  // Filtered movies
  const filtered = movies.filter((m) => {
    const matchSearch =
      m.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (m.director && m.director.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchCat =
      activeCategoryFilter === 'all' || (m.genres || []).includes(activeCategoryFilter);
    return matchSearch && matchCat;
  });

  // Locked Gatekeeper View if not admin
  if (!isAdminUnlocked) {
    return (
      <div className="min-h-screen text-zinc-100 flex items-center justify-center p-4 pt-28 pb-20">
        <div className="w-full max-w-md rounded-3xl glass-panel border border-cine-purple/40 p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-cine-purple/20 border border-cine-purple/40 flex items-center justify-center text-cine-purple mx-auto shadow-glow-purple">
            <Shield className="w-8 h-8" />
          </div>

          <div>
            <h1 className="font-cinematic font-bold text-2xl text-white">Admin Management Portal</h1>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Authenticate with your administrative credentials to manage movies, downloads, banners, and analytics.
            </p>
          </div>

          <form onSubmit={handleUnlockAdmin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Admin Username</label>
              <input
                type="text"
                placeholder="Enter admin username"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-xs glass-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Admin Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-xs glass-input"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-gradient-to-r from-cine-red to-cine-purple text-white font-semibold text-xs shadow-glow-red hover:scale-[1.02] active:scale-95 transition-all mt-2"
            >
              Authenticate as Administrator
            </button>
          </form>

          <div className="text-[11px] text-zinc-500 bg-white/5 p-3 rounded-xl border border-white/5 text-center flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Secure Role-Based Authentication Required</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-zinc-100 pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cine-purple mb-1">
              <Shield className="w-4 h-4 text-cine-purple" />
              <span>Full Persistent Content Management</span>
            </div>
            <h1 className="font-cinematic font-black text-3xl sm:text-4xl text-white">
              CINEVERSE Admin Dashboard
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live updates directly synchronize with LocalDB storage and persist across page refreshes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAdminLock}
              title="Lock and sign out of admin console"
              className="px-4 py-2 rounded-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-xs text-rose-300 font-semibold flex items-center gap-1.5 transition-all shadow-lg"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Dashboard</span>
            </button>

            <button
              onClick={handleResetCatalog}
              title="Reset to default seed catalog"
              className="px-4 py-2 rounded-full glass-panel hover:bg-white/10 text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Seed</span>
            </button>

            <button
              onClick={() => {
                audioService.playClick();
                setFormData(initialForm);
                setIsAddModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-cine-red to-cine-purple hover:scale-105 active:scale-95 text-white font-semibold text-xs shadow-glow-red flex items-center gap-2 transition-transform"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Movie</span>
            </button>
          </div>
        </div>

        {/* Analytics KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl glass-panel border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-400 font-medium">Total Movies</div>
              <div className="font-mono text-2xl sm:text-3xl font-black text-white mt-1">
                {analytics.totalMovies}
              </div>
              <div className="text-[10px] text-emerald-400 mt-1 font-semibold">
                {analytics.authorizedDownloadsCount} Legal Downloads
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-cine-red/10 text-cine-red border border-cine-red/20">
              <Film className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-400 font-medium">Platform Views</div>
              <div className="font-mono text-2xl sm:text-3xl font-black text-cine-cyan mt-1">
                {analytics.totalViews.toLocaleString()}
              </div>
              <div className="text-[10px] text-zinc-400 mt-1">Simulated OTT traffic</div>
            </div>
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Eye className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-400 font-medium">Authorized Downloads</div>
              <div className="font-mono text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
                {analytics.totalDownloads.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-400 mt-1 font-semibold">100% Legal DRM-Free</div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Download className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-400 font-medium">Registered Accounts</div>
              <div className="font-mono text-2xl sm:text-3xl font-black text-cine-purple mt-1">
                1,280
              </div>
              <div className="text-[10px] text-zinc-400 mt-1">Active VIP subscribers</div>
            </div>
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Analytics Breakdown Row: Most Viewed & Most Downloaded */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Viewed Titles */}
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-cine-red" />
              <span>Most Streamed & Viewed Titles</span>
            </h3>
            <div className="space-y-3">
              {analytics.topViewed.map((movie, idx) => {
                const maxViews = analytics.topViewed[0]?.views || 1;
                const pct = Math.round(((movie.views || 0) / maxViews) * 100);
                return (
                  <div key={movie.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-200 truncate max-w-[240px]">
                        {idx + 1}. {movie.title}
                      </span>
                      <span className="text-zinc-400 font-mono">
                        {(movie.views || 0).toLocaleString()} views
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cine-red to-cine-purple rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Downloaded Titles */}
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Top Legally Downloaded Titles</span>
            </h3>
            <div className="space-y-3">
              {analytics.topDownloaded.map((movie, idx) => {
                const maxDL = analytics.topDownloaded[0]?.downloadsCount || 1;
                const pct = Math.round(((movie.downloadsCount || 0) / maxDL) * 100);
                return (
                  <div key={movie.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-200 truncate max-w-[240px]">
                        {idx + 1}. {movie.title}
                      </span>
                      <span className="text-emerald-400 font-mono">
                        {(movie.downloadsCount || 0).toLocaleString()} downloads
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Upload Movie from Downloads Widget */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cine-purple/30 bg-gradient-to-br from-cine-purple/10 via-background/40 to-cine-red/10 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cine-purple mb-1">
                <FolderDown className="w-4 h-4 text-cine-purple" />
                <span>Admin Local Media Importer</span>
              </div>
              <h2 className="font-cinematic font-bold text-xl sm:text-2xl text-white">
                Upload Movies from Downloads Folder
              </h2>
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              Admin: <strong className="text-white">Aryan Shah</strong>
            </span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed max-w-3xl">
            Select a movie or video file (.mp4, .mkv, .webm) directly from your computer or downloads folder.
            You can either attach it as a downloadable resolution to an existing movie, or create a brand new movie catalog entry instantly.
          </p>

          {/* File Picker Dropzone */}
          <div
            onClick={() => quickFileRef.current?.click()}
            className="p-6 rounded-2xl border-2 border-dashed border-cine-purple/40 hover:border-cine-purple hover:bg-white/5 cursor-pointer text-center transition-all group select-none"
          >
            <input
              type="file"
              ref={quickFileRef}
              onChange={handleQuickFileSelect}
              accept="video/*,.mp4,.mkv,.webm,.avi"
              className="hidden"
            />
            <Upload className="w-8 h-8 text-cine-purple mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-white">
              {quickUploadName ? (
                <span className="text-emerald-400 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  Loaded: {quickUploadName} ({quickSize})
                </span>
              ) : (
                'Click to choose movie file from your computer or Downloads'
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Supports MP4, MKV, WebM • Auto-computes size, format, and bitrate
            </p>
          </div>

          {/* Options when a file is selected */}
          {quickUploadFile && (
            <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Target Movie Dropdown */}
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Target Existing Movie
                  </label>
                  <select
                    value={quickTargetMovieId}
                    onChange={(e) => setQuickTargetMovieId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  >
                    {movies.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title} ({m.year})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Resolution */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Resolution Level
                  </label>
                  <select
                    value={quickRes}
                    onChange={(e) => setQuickRes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  >
                    <option value="480p">480p SD</option>
                    <option value="720p">720p HD</option>
                    <option value="1080p">1080p FHD</option>
                    <option value="4K UHD">4K UHD Master</option>
                  </select>
                </div>

                {/* Format */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Container Format
                  </label>
                  <select
                    value={quickFormat}
                    onChange={(e) => setQuickFormat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  >
                    <option value="MP4 (H.264)">MP4 (H.264)</option>
                    <option value="MKV (HEVC)">MKV (HEVC)</option>
                    <option value="WebM (VP9)">WebM (VP9)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setQuickUploadFile(null);
                    setQuickUploadName('');
                  }}
                  className="px-4 py-2 rounded-full glass-panel text-xs text-zinc-400 hover:text-white"
                >
                  Clear File
                </button>

                <button
                  type="button"
                  onClick={handleQuickAttachToMovie}
                  className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Attach to Selected Movie Downloads</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickCreateNewMovie}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-cine-purple to-cine-red text-white font-semibold text-xs shadow-glow-purple transition-transform hover:scale-105 active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New Movie Entry with this File</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Movie Management Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-cinematic font-bold text-2xl text-white">
              Movie Catalog Management
            </h2>

            {/* Table Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search catalog by title..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs glass-input"
              />
            </div>
          </div>

          {/* Catalog Table */}
          <div className="rounded-3xl glass-panel border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="p-4">Movie</th>
                    <th className="p-4">Year & Rating</th>
                    <th className="p-4">Genres</th>
                    <th className="p-4">Download Status</th>
                    <th className="p-4">Featured / Trending</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((movie) => (
                    <tr key={movie.id} className="hover:bg-white/5 transition-colors">
                      {/* Movie Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={movie.poster}
                            alt={movie.title}
                            className="w-10 h-14 rounded-lg object-cover border border-white/10 flex-shrink-0"
                          />
                          <div>
                            <div className="font-bold text-sm text-white">{movie.title}</div>
                            <div className="text-[11px] text-zinc-400">{movie.director}</div>
                          </div>
                        </div>
                      </td>

                      {/* Year & Rating */}
                      <td className="p-4">
                        <div className="font-mono text-zinc-300 font-semibold">{movie.year}</div>
                        <div className="text-amber-400 font-semibold mt-0.5">
                          ★ {movie.rating.toFixed(1)}
                        </div>
                      </td>

                      {/* Genres */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {(movie.genres || []).slice(0, 2).map((g) => (
                            <span
                              key={g}
                              className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-zinc-300"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Download Status Toggle */}
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleDownloadAuth(movie)}
                          title="Click to toggle authorized download status"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                            movie.downloadAuthorized
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-zinc-800 text-zinc-400 border border-white/10 hover:border-white/20'
                          }`}
                        >
                          {movie.downloadAuthorized ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Authorized</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>Restricted</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Featured & Trending Toggles */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleFeatured(movie)}
                            title="Toggle Hero Premiere Status"
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                              movie.featured
                                ? 'bg-cine-red/20 text-cine-red border-cine-red/40'
                                : 'bg-white/5 text-zinc-500 border-white/5 hover:text-zinc-300'
                            }`}
                          >
                            Featured
                          </button>

                          <button
                            onClick={() => handleToggleTrending(movie)}
                            title="Toggle Trending Carousel"
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                              movie.trending
                                ? 'bg-cine-purple/20 text-cine-purple border-cine-purple/40'
                                : 'bg-white/5 text-zinc-500 border-white/5 hover:text-zinc-300'
                            }`}
                          >
                            Trending
                          </button>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(movie)}
                            title="Edit Movie"
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setMovieToDelete(movie)}
                            title="Delete Movie Permanently"
                            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* ADD / EDIT MOVIE MODAL */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div
            className="relative w-full max-w-2xl rounded-3xl glass-panel border border-white/20 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-cinematic font-bold text-2xl text-white mb-2">
              {isEditModalOpen ? `Edit "${movieToEdit?.title}"` : 'Add New Movie to CINEVERSE'}
            </h2>
            <p className="text-xs text-zinc-400 mb-6">
              Saved changes are written directly to local storage and update instantly across all pages.
            </p>

            <form onSubmit={isEditModalOpen ? handleUpdateMovie : handleCreateMovie} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Movie Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Sintel 4K Remaster"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Director</label>
                  <input
                    type="text"
                    value={formData.director}
                    onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                    placeholder="e.g. Colin Levy"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. An epic journey through perilous lands"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Synopsis *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.synopsis}
                  onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                  placeholder="Full movie description..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Release Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Rating (IMDb)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Age Rating</label>
                  <input
                    type="text"
                    value={formData.ageRating}
                    onChange={(e) => setFormData({ ...formData, ageRating: e.target.value })}
                    placeholder="PG-13, R, G"
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="1h 45m"
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Genres (comma separated)</label>
                  <input
                    type="text"
                    value={formData.genres}
                    onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
                    placeholder="Action, Sci-Fi, Adventure"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Languages (comma separated)</label>
                  <input
                    type="text"
                    value={formData.languages}
                    onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                    placeholder="English, French"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input"
                  />
                </div>
              </div>

              {/* Media URLs */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Poster Image URL</label>
                  <input
                    type="url"
                    value={formData.poster}
                    onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs glass-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Backdrop Banner URL</label>
                  <input
                    type="url"
                    value={formData.backdrop}
                    onChange={(e) => setFormData({ ...formData, backdrop: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs glass-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Trailer Embed URL</label>
                  <input
                    type="url"
                    value={formData.trailerUrl}
                    onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs glass-input"
                  />
                </div>
              </div>

              {/* Toggles & Permissions */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.downloadAuthorized}
                    onChange={(e) => setFormData({ ...formData, downloadAuthorized: e.target.checked })}
                    className="rounded text-emerald-500 focus:ring-emerald-500 w-4 h-4 bg-zinc-900"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-white">Authorized for Legal Download</span>
                    <p className="text-zinc-400 text-[11px]">Enables 480p, 720p, 1080p, and 4K download buttons</p>
                  </div>
                </label>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded text-cine-red focus:ring-cine-red w-4 h-4 bg-zinc-900"
                    />
                    <span className="text-zinc-300">Feature in Hero Carousel</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={formData.trending}
                      onChange={(e) => setFormData({ ...formData, trending: e.target.checked })}
                      className="rounded text-cine-purple focus:ring-cine-purple w-4 h-4 bg-zinc-900"
                    />
                    <span className="text-zinc-300">Flag as Trending</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-5 py-2.5 rounded-full glass-panel text-zinc-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cine-red to-cine-purple text-white text-xs font-bold shadow-glow-red hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isEditModalOpen ? 'Save Changes' : 'Create & Publish Movie'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {movieToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div
            className="relative w-full max-w-md rounded-3xl glass-panel border border-rose-500/40 p-6 sm:p-8 shadow-2xl text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="font-bold text-xl text-white">Delete Movie Permanently?</h3>
            
            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">"{movieToDelete.title}"</strong>?
              This will update the database permanently and it will not reappear after refreshing the page.
            </p>

            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setMovieToDelete(null)}
                className="px-5 py-2 rounded-full glass-panel text-xs text-zinc-300 hover:text-white font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                className="px-6 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                Yes, Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
