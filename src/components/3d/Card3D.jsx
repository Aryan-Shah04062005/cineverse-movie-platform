import React, { useRef, useState } from 'react';
import { Play, Download, Star, Bookmark, Check, ShieldCheck, Eye } from 'lucide-react';
import { audioService } from '../../services/audioService';

export default function Card3D({
  movie,
  onViewDetails,
  onPlayTrailer,
  onOpenDownload,
  isInWatchlist = false,
  onToggleWatchlist
}) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareOpacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setCoords({ x, y });
    setTilt({
      rotateX,
      rotateY,
      glareOpacity: 0.4
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    audioService.playHover();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0, glareOpacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative cursor-pointer select-none perspective-1000 w-full"
      style={{ minHeight: '380px' }}
      onClick={() => {
        audioService.playClick();
        onViewDetails?.(movie.id);
      }}
    >
      <div
        className="relative h-full w-full rounded-2xl overflow-hidden glass-card transition-transform duration-200 ease-out preserve-3d border border-white/10 group-hover:border-cine-red/50 group-hover:shadow-glow-red"
        style={{
          transform: isHovered
            ? `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(1.03, 1.03, 1.03)`
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          willChange: 'transform'
        }}
      >
        {/* Dynamic Specular Sheen Glare */}
        <div
          className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
          style={{
            opacity: tilt.glareOpacity,
            background: `radial-gradient(circle 220px at ${coords.x}px ${coords.y}px, rgba(255, 255, 255, 0.25), transparent 80%)`
          }}
        />

        {/* Poster Image Container */}
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
          <img
            src={movie.poster}
            alt={movie.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80';
            }}
          />

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-black/40 group-hover:via-background/40 transition-colors" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-auto">
            {/* Rating Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-amber-300 shadow-lg">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{movie.rating.toFixed(1)}</span>
            </div>

            {/* Quick Watchlist Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                audioService.playClick();
                onToggleWatchlist?.(movie.id);
              }}
              title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              className={`p-2 rounded-full backdrop-blur-md border transition-all duration-300 ${
                isInWatchlist
                  ? 'bg-cine-red text-white border-cine-red shadow-glow-red scale-110'
                  : 'bg-black/60 text-zinc-300 hover:text-white border-white/10 hover:border-white/30 hover:bg-black/80'
              }`}
            >
              {isInWatchlist ? (
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              ) : (
                <Bookmark className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Authorized Download Badge */}
          {movie.downloadAuthorized && (
            <div className="absolute top-12 left-3 z-20">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Legal DL
              </span>
            </div>
          )}

          {/* Hover Action Overlay */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 backdrop-blur-[2px]">
            {/* Play Trailer Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                audioService.playClick();
                onPlayTrailer?.(movie);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cine-red to-cine-purple text-white font-medium text-sm shadow-glow-red hover:scale-105 active:scale-95 transition-transform"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Trailer</span>
            </button>

            {/* Download Button (if authorized) or View Details */}
            {movie.downloadAuthorized ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  audioService.playClick();
                  onOpenDownload?.(movie);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full glass-button text-emerald-300 text-xs font-medium hover:border-emerald-400/50 hover:bg-emerald-500/10 hover:scale-105 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Authorized Download</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  audioService.playClick();
                  onViewDetails?.(movie.id);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full glass-button text-zinc-300 text-xs font-medium hover:text-white hover:scale-105 transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Details & Stream</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Info Container */}
        <div className="relative p-4 z-20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 mb-1.5 font-medium">
              <span>{movie.year}</span>
              <span>•</span>
              <span>{movie.duration}</span>
              <span>•</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 border border-white/5">
                {movie.ageRating || 'PG'}
              </span>
            </div>

            <h3 className="font-bold text-base text-zinc-100 group-hover:text-cine-red transition-colors line-clamp-1">
              {movie.title}
            </h3>

            <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
              {movie.tagline || movie.synopsis}
            </p>
          </div>

          {/* Genre tags */}
          <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-white/5">
            {(movie.genres || []).slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-zinc-300 group-hover:border-white/10 border border-transparent transition-colors"
              >
                {genre}
              </span>
            ))}
            {(movie.genres || []).length > 2 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md text-zinc-500">
                +{(movie.genres || []).length - 2}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
