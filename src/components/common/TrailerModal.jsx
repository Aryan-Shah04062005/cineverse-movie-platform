import React, { useEffect } from 'react';
import { X, Star, Calendar, Clock, Film } from 'lucide-react';
import { audioService } from '../../services/audioService';

export default function TrailerModal({ movie, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!movie) return null;

  // Format YouTube embed URL if applicable
  let embedUrl = movie.trailerUrl;
  if (embedUrl && embedUrl.includes('youtube.com/watch?v=')) {
    const videoId = embedUrl.split('watch?v=')[1]?.split('&')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  } else if (embedUrl && embedUrl.includes('youtu.be/')) {
    const videoId = embedUrl.split('youtu.be/')[1]?.split('?')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  } else if (embedUrl && embedUrl.includes('youtube.com/embed/')) {
    embedUrl = embedUrl.includes('?') ? `${embedUrl}&autoplay=1` : `${embedUrl}?autoplay=1`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl rounded-2xl overflow-hidden glass-panel border border-white/20 shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cine-red/20 text-cine-red border border-cine-red/30">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white line-clamp-1">
                {movie.title} – Official Trailer
              </h3>
              <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {movie.rating.toFixed(1)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {movie.year}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {movie.duration}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              audioService.playClick();
              onClose();
            }}
            title="Close Trailer"
            className="p-2.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="relative aspect-video w-full bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${movie.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-2">
              <Film className="w-12 h-12 text-zinc-600" />
              <p>Trailer stream is temporarily unavailable.</p>
            </div>
          )}
        </div>

        {/* Footer Synopsis Note */}
        <div className="px-6 py-3.5 bg-black/60 border-t border-white/10 text-xs text-zinc-300 flex items-center justify-between">
          <p className="line-clamp-1 italic text-zinc-400">
            "{movie.tagline || movie.synopsis}"
          </p>
          <span className="text-[11px] text-zinc-500 whitespace-nowrap pl-4">
            Press ESC to exit
          </span>
        </div>
      </div>
    </div>
  );
}
