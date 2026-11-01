import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  ShieldCheck,
  AlertTriangle,
  FileVideo,
  HardDrive,
  Cpu,
  Volume2,
  CheckCircle,
  ExternalLink,
  Lock,
  Pause,
  Play,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Check,
  Smartphone,
  Laptop
} from 'lucide-react';
import { audioService } from '../../services/audioService';
import { dbService } from '../../services/dbService';
import { authService } from '../../services/authService';
import { mediaStorageService } from '../../services/mediaStorageService';
import { useToast } from '../common/Toast';

export default function DownloadModal({ movie, onClose }) {
  const { addToast } = useToast();
  const [currentMovie, setCurrentMovie] = useState(movie);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const isAdmin = currentUser?.role === 'admin';

  const [selectedResolution, setSelectedResolution] = useState(null);
  const [confirmedLicense, setConfirmedLicense] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState('24.2 MB/s');
  const [isPaused, setIsPaused] = useState(false);
  const [downloadCompleted, setDownloadCompleted] = useState(false);

  // Admin Upload State
  const [showAdminUpload, setShowAdminUpload] = useState(false);
  const [uploadRes, setUploadRes] = useState('1080p');
  const [uploadFormat, setUploadFormat] = useState('MP4 (H.264)');
  const [uploadSize, setUploadSize] = useState('1.8 GB');
  const [uploadBitrate, setUploadBitrate] = useState('8.5 Mbps');
  const [uploadAudio, setUploadAudio] = useState('Dolby 5.1 Surround');
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const fileInputRef = useRef(null);

  // Resolve object URLs from IndexedDB if file was uploaded locally
  useEffect(() => {
    let isMounted = true;
    async function resolveUrls() {
      if (movie?.downloadFiles && movie.downloadFiles.length > 0) {
        const resolvedFiles = await Promise.all(
          movie.downloadFiles.map(async (file) => {
            if (file.storageFileId) {
              const stored = await mediaStorageService.getMovieFile(file.storageFileId);
              if (stored && stored.url) {
                return { ...file, url: stored.url };
              }
            }
            return file;
          })
        );
        if (isMounted) {
          setCurrentMovie({ ...movie, downloadFiles: resolvedFiles });
          const def = resolvedFiles.find((f) => f.resolution.includes('1080')) || resolvedFiles[0];
          setSelectedResolution(def);
        }
      } else {
        if (isMounted) {
          setCurrentMovie(movie);
        }
      }
    }
    resolveUrls();
    return () => {
      isMounted = false;
    };
  }, [movie]);

  useEffect(() => {
    const unsub = authService.subscribe(() => {
      setCurrentUser(authService.getCurrentUser());
    });
    return unsub;
  }, []);

  // Handle local file selection from computer / Downloads folder
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);

    // Calculate file size
    let formattedSize = '1.2 GB';
    if (file.size > 1024 * 1024 * 1024) {
      formattedSize = `${(file.size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    } else {
      formattedSize = `${Math.round(file.size / (1024 * 1024))} MB`;
    }
    setUploadSize(formattedSize);

    // Auto-detect format from name or type
    const lowerName = file.name.toLowerCase();
    if (lowerName.includes('4k') || lowerName.includes('2160')) {
      setUploadRes('4K UHD');
      setUploadBitrate('22.0 Mbps');
    } else if (lowerName.includes('720')) {
      setUploadRes('720p');
    } else if (lowerName.includes('480')) {
      setUploadRes('480p');
    } else {
      setUploadRes('1080p');
    }

    if (lowerName.endsWith('.mkv')) {
      setUploadFormat('MKV (HEVC)');
    } else {
      setUploadFormat('MP4 (H.264)');
    }

    const localUrl = URL.createObjectURL(file);
    setUploadUrl(localUrl);

    audioService.playClick();
    addToast({
      type: 'info',
      title: 'File Loaded from Downloads',
      message: `${file.name} (${formattedSize}) ready to attach.`
    });
  };

  // Submit Admin Upload to this Movie
  const handleSaveUpload = (e) => {
    e.preventDefault();
    if (!currentMovie) return;

    const newDownloadFile = {
      resolution: uploadRes,
      format: uploadFormat,
      size: uploadSize,
      bitrate: uploadBitrate,
      audio: uploadAudio,
      url: uploadUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
    };

    const existingFiles = currentMovie.downloadFiles || [];
    const updatedFiles = existingFiles.filter((f) => f.resolution !== uploadRes);
    updatedFiles.unshift(newDownloadFile);

    const updatedMovie = dbService.updateMovie(currentMovie.id, {
      downloadFiles: updatedFiles,
      downloadAuthorized: true
    });

    if (updatedMovie) {
      setCurrentMovie(updatedMovie);
      setSelectedResolution(newDownloadFile);
      setShowAdminUpload(false);
      audioService.playSuccess();
      addToast({
        type: 'success',
        title: 'Movie File Uploaded!',
        message: `Successfully attached ${uploadRes} (${uploadSize}) from downloads to "${currentMovie.title}".`
      });
    }
  };

  // Admin delete file
  const handleDeleteFile = (resolution) => {
    if (!confirm(`Delete ${resolution} download file option for "${currentMovie.title}"?`)) return;
    const existing = currentMovie.downloadFiles || [];
    const filtered = existing.filter((f) => f.resolution !== resolution);
    const updated = dbService.updateMovie(currentMovie.id, {
      downloadFiles: filtered,
      downloadAuthorized: filtered.length > 0
    });
    if (updated) {
      setCurrentMovie(updated);
      setSelectedResolution(filtered[0] || null);
      audioService.playClick();
      addToast({
        type: 'info',
        title: 'Download File Removed',
        message: `${resolution} option removed.`
      });
    }
  };

  // Direct 1-tap browser file download trigger for Laptops & Phones
  const triggerDirectDeviceDownload = (targetFile = selectedResolution) => {
    if (!confirmedLicense) {
      addToast({
        type: 'warning',
        title: 'Confirmation Required',
        message: 'Please review and accept the legal authorization confirmation below.'
      });
      return;
    }

    const fileToDownload = targetFile || currentMovie.downloadFiles?.[0];
    if (!fileToDownload || !fileToDownload.url) {
      addToast({
        type: 'error',
        title: 'File Unavailable',
        message: 'No download URL available for this selection.'
      });
      return;
    }

    audioService.playSuccess();
    dbService.recordDownload(currentMovie.id, fileToDownload.resolution);

    const safeTitle = (currentMovie.title || 'Movie').replace(/[^a-zA-Z0-9_-]/g, '_');
    const ext = fileToDownload.format?.toLowerCase().includes('mkv') ? 'mkv' : 'mp4';
    const filename = `${safeTitle}_${fileToDownload.resolution || 'HD'}.${ext}`;

    // Create anchor and dispatch click on real user gesture
    const a = document.createElement('a');
    a.href = fileToDownload.url;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 1000);

    setDownloadCompleted(true);
    addToast({
      type: 'success',
      title: 'Download Started!',
      message: `Saving "${filename}" to your device Downloads folder / Files app.`
    });
  };

  // Live Simulated High-Speed Transfer
  useEffect(() => {
    let interval;
    if (isDownloading && !isPaused && downloadProgress < 100) {
      interval = setInterval(() => {
        setDownloadProgress((prev) => {
          const next = prev + Math.floor(Math.random() * 9 + 4);
          if (next >= 100) {
            clearInterval(interval);
            setDownloadCompleted(true);
            setIsDownloading(false);
            audioService.playSuccess();
            addToast({
              type: 'success',
              title: 'Download Complete!',
              message: `${currentMovie.title} (${selectedResolution?.resolution}) file generated and saved.`
            });
            // Record download in analytics
            dbService.recordDownload(currentMovie.id, selectedResolution?.resolution);
            
            // Trigger actual browser download
            if (selectedResolution?.url) {
              const link = document.createElement('a');
              link.href = selectedResolution.url;
              link.target = '_blank';
              link.download = `${(currentMovie.title || 'Movie').replace(/\s+/g, '_')}_${selectedResolution.resolution}.mp4`;
              document.body.appendChild(link);
              link.click();
              setTimeout(() => {
                document.body.removeChild(link);
              }, 1000);
            }
            return 100;
          }
          setDownloadSpeed(`${(Math.random() * 6 + 22).toFixed(1)} MB/s`);
          return next;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isDownloading, isPaused, downloadProgress, currentMovie, selectedResolution, addToast]);

  if (!currentMovie) return null;

  // Handle Unauthorized Movie (unless Admin is uploading!)
  if (!currentMovie.downloadAuthorized && !showAdminUpload) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
        <div
          className="relative w-full max-w-lg rounded-2xl glass-panel border border-rose-500/30 p-6 sm:p-8 text-center shadow-2xl flex flex-col items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
            <Lock className="w-8 h-8" />
          </div>

          <h3 className="font-bold text-xl text-white">Direct Download Unauthorized</h3>
          
          <p className="text-sm text-zinc-300 mt-3 leading-relaxed">
            {currentMovie.unauthorizedReason ||
              `Downloads for "${currentMovie.title}" are restricted by the rights holder or distributor. CINEVERSE strictly respects intellectual property laws and does not host or distribute unauthorized copyrighted media.`}
          </p>

          <div className="mt-5 p-3.5 rounded-xl bg-zinc-900/80 border border-white/10 text-xs text-zinc-400 text-left w-full space-y-1">
            <div className="font-semibold text-zinc-300">Authorized Access:</div>
            <div>• High Definition official trailer streaming is enabled</div>
            <div>• DRM-protected or proprietary download is unavailable</div>
          </div>

          {/* Admin Upload Shortcut on Unauthorized Movie */}
          {isAdmin && (
            <div className="mt-6 p-4 rounded-xl bg-cine-purple/10 border border-cine-purple/30 w-full text-center space-y-2">
              <span className="text-xs font-semibold text-cine-purple flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Administrator Override
              </span>
              <p className="text-[11px] text-zinc-300">
                As an Admin (Aryan Shah), you can upload an authorized open-media version directly from your computer/downloads.
              </p>
              <button
                onClick={() => setShowAdminUpload(true)}
                className="mt-2 px-5 py-2 rounded-full bg-cine-purple hover:bg-cine-purple/80 text-white font-semibold text-xs transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 mx-auto shadow-glow-purple"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Movie from Downloads</span>
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-6 px-6 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm transition-colors"
          >
            Close Notice
          </button>
        </div>
      </div>
    );
  }

  const files = currentMovie.downloadFiles || [];

  const handleStartDownloadSimulation = () => {
    if (!confirmedLicense) {
      addToast({
        type: 'warning',
        title: 'Confirmation Required',
        message: 'Please review and accept the legal authorization confirmation below.'
      });
      return;
    }
    audioService.playClick();
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl rounded-3xl glass-panel border border-white/20 p-6 sm:p-8 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto"
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

        {/* Modal Header */}
        <div className="flex items-start justify-between pr-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-24 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0 border border-white/10 hidden sm:block">
              <img src={currentMovie.poster} alt={currentMovie.title} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Legally Authorized
                </span>
                <span className="text-xs text-zinc-400">{currentMovie.year} • {currentMovie.duration}</span>
              </div>
              <h2 className="font-bold text-xl sm:text-2xl text-white mt-1">{currentMovie.title}</h2>
              <p className="text-xs text-zinc-400 mt-1">
                License: <span className="text-zinc-200 font-medium">{currentMovie.licenseType || 'Public Domain / Open Media'}</span>
              </p>
            </div>
          </div>

          {/* Admin Upload Toggle Button */}
          {isAdmin && (
            <button
              onClick={() => {
                audioService.playClick();
                setShowAdminUpload(!showAdminUpload);
              }}
              className="px-3.5 py-1.5 rounded-full bg-cine-purple/20 hover:bg-cine-purple/30 border border-cine-purple/40 text-cine-purple text-xs font-semibold flex items-center gap-1.5 transition-all shadow-glow-purple"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{showAdminUpload ? 'Close Uploader' : '+ Upload from Downloads'}</span>
            </button>
          )}
        </div>

        {/* Device Compatibility Badge */}
        <div className="mt-4 p-3 rounded-2xl bg-zinc-900/60 border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <Laptop className="w-4 h-4 text-cine-cyan" />
            <span>Mac / Windows PC Ready</span>
            <span className="text-zinc-600">•</span>
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>iPhone / Android Ready</span>
          </div>
          <span className="text-[11px] text-zinc-400 font-medium">
            Files save straight to your device Downloads / Files app
          </span>
        </div>

        {/* ADMIN UPLOAD PANEL (From Downloads) */}
        {isAdmin && showAdminUpload && (
          <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-cine-purple/15 to-cine-red/10 border border-cine-purple/30 space-y-4 animate-in slide-in-from-top-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-cine-purple" />
                <span>Admin Media File Uploader</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">Signed in: Aryan Shah</span>
            </div>

            <form onSubmit={handleSaveUpload} className="space-y-3.5">
              {/* File Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-5 rounded-xl border-2 border-dashed border-cine-purple/40 hover:border-cine-purple hover:bg-white/5 cursor-pointer text-center transition-all group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="video/*,.mp4,.mkv,.webm,.avi"
                  className="hidden"
                />
                <Upload className="w-7 h-7 text-cine-purple mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-semibold text-white">
                  {uploadedFileName ? (
                    <span className="text-emerald-400">Selected: {uploadedFileName}</span>
                  ) : (
                    'Click to select movie file from your Mac / Downloads'
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Supports MP4, MKV, WebM, AVI (Auto-calculates file size and bitrate)
                </p>
              </div>

              {/* Resolution & Format Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] text-zinc-300 font-medium mb-1">Resolution</label>
                  <select
                    value={uploadRes}
                    onChange={(e) => setUploadRes(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs glass-input"
                  >
                    <option value="480p">480p SD</option>
                    <option value="720p">720p HD</option>
                    <option value="1080p">1080p FHD</option>
                    <option value="4K UHD">4K UHD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-300 font-medium mb-1">Format Codec</label>
                  <select
                    value={uploadFormat}
                    onChange={(e) => setUploadFormat(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs glass-input"
                  >
                    <option value="MP4 (H.264)">MP4 (H.264)</option>
                    <option value="MKV (HEVC)">MKV (HEVC)</option>
                    <option value="MKV (ProRes)">MKV (ProRes)</option>
                    <option value="WebM (VP9)">WebM (VP9)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-300 font-medium mb-1">File Size</label>
                  <input
                    type="text"
                    value={uploadSize}
                    onChange={(e) => setUploadSize(e.target.value)}
                    placeholder="e.g. 1.8 GB"
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs glass-input"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-300 font-medium mb-1">Bitrate</label>
                  <input
                    type="text"
                    value={uploadBitrate}
                    onChange={(e) => setUploadBitrate(e.target.value)}
                    placeholder="e.g. 8.5 Mbps"
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs glass-input"
                  />
                </div>
              </div>

              {/* Audio Track & Storage URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-zinc-300 font-medium mb-1">Audio Track</label>
                  <input
                    type="text"
                    value={uploadAudio}
                    onChange={(e) => setUploadAudio(e.target.value)}
                    placeholder="e.g. Dolby 5.1 Surround / Atmos"
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs glass-input"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-300 font-medium mb-1">File URL / Stream Path</label>
                  <input
                    type="text"
                    value={uploadUrl}
                    onChange={(e) => setUploadUrl(e.target.value)}
                    placeholder="Local ObjectURL or Storage URL"
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs glass-input"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-cine-purple to-cine-red text-white font-semibold text-xs shadow-glow-purple hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Attach File to Movie Downloads</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Resolution Options Grid */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Select Resolution & File Quality:
            </label>
            {isAdmin && (
              <span className="text-[10px] text-zinc-500">
                Admin: Trash icon deletes specific resolution
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {files.map((file) => {
              const isSelected = selectedResolution?.resolution === file.resolution;
              return (
                <div
                  key={file.resolution}
                  onClick={() => {
                    audioService.playClick();
                    setSelectedResolution(file);
                  }}
                  className={`relative p-3.5 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-cine-red/15 border-cine-red shadow-glow-red scale-[1.02]'
                      : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white flex items-center gap-1.5">
                      <FileVideo className={`w-4 h-4 ${isSelected ? 'text-cine-red' : 'text-zinc-400'}`} />
                      {file.resolution}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-emerald-500/20">
                        {file.size}
                      </span>

                      {/* Admin Delete File Option */}
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file.resolution);
                          }}
                          title="Delete this resolution"
                          className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-zinc-400">
                    <div className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-zinc-500" />
                      <span>{file.format}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-zinc-500" />
                      <span>{file.bitrate}</span>
                    </div>
                    <div className="flex items-center gap-1 col-span-2">
                      <Volume2 className="w-3 h-3 text-zinc-500" />
                      <span>{file.audio}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Download Progress View */}
        {isDownloading || downloadCompleted ? (
          <div className="mt-5 p-4 rounded-xl bg-zinc-900/90 border border-cine-red/30 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-2">
                {downloadCompleted ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Download Ready & Completed
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-cine-red animate-ping" />
                    Downloading {selectedResolution?.resolution}...
                  </>
                )}
              </span>
              <span className="text-zinc-400 font-mono">{downloadProgress}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cine-red via-cine-purple to-cine-cyan transition-all duration-300 rounded-full"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span>Transfer Speed: {downloadCompleted ? 'Done' : downloadSpeed}</span>
              <div className="flex items-center gap-2">
                {!downloadCompleted && (
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    <span>{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Confirmation Checkbox */
          <div className="mt-5 p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmedLicense}
                onChange={(e) => setConfirmedLicense(e.target.checked)}
                className="mt-0.5 rounded border-white/20 text-cine-red focus:ring-cine-red/50 bg-zinc-900 w-4 h-4"
              />
              <span className="text-xs text-zinc-300 leading-relaxed">
                I confirm that I am downloading this legally authorized media for personal viewing under the{' '}
                <strong className="text-white">{currentMovie.licenseType || 'Public Domain / Creative Commons license'}</strong>.
                No DRM restrictions are bypassed.
              </span>
            </label>
          </div>
        )}

        {/* Action Buttons: Direct Download (Instant) + Fast Transfer */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 w-full sm:w-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>High-Speed DRM-Free Direct Link</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-full glass-panel hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-medium transition-colors"
            >
              {downloadCompleted ? 'Done' : 'Close'}
            </button>

            {/* PRIMARY: Instant Direct Download to Device (Laptop or Phone) */}
            <button
              onClick={() => triggerDirectDeviceDownload(selectedResolution)}
              disabled={!selectedResolution}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cine-purple hover:scale-105 active:scale-95 text-white font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Direct Download ({selectedResolution?.resolution || 'HD'})</span>
            </button>

            {/* SECONDARY: High-speed transfer simulator */}
            {!downloadCompleted && !isDownloading && (
              <button
                onClick={handleStartDownloadSimulation}
                disabled={!selectedResolution}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-semibold transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Simulated Transfer</span>
              </button>
            )}

            {/* Direct Link in New Tab */}
            {selectedResolution?.url && (
              <a
                href={selectedResolution.url}
                target="_blank"
                rel="noreferrer"
                download
                className="w-full sm:w-auto p-2.5 rounded-full glass-panel hover:bg-white/15 text-zinc-300 hover:text-white transition-colors"
                title="Open Direct Video Stream / Download in New Tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
