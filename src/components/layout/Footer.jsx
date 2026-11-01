import React, { useState } from 'react';
import { Film, Send, ShieldCheck, Heart, Sparkles, HelpCircle, FileText, Lock } from 'lucide-react';
import { audioService } from '../../services/audioService';
import { useToast } from '../common/Toast';

export default function Footer({ onNavigate }) {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      addToast({
        type: 'error',
        title: 'Invalid Email',
        message: 'Please enter a valid email address to join the Cineverse newsletter.'
      });
      return;
    }
    audioService.playSuccess();
    addToast({
      type: 'success',
      title: 'Subscribed to CINEVERSE Weekly!',
      message: 'You will receive curated public-domain premieres and 4K restoration alerts.'
    });
    setEmail('');
  };

  return (
    <footer className="relative mt-24 border-t border-white/10 bg-gradient-to-b from-background via-black/80 to-black text-zinc-400 select-none">
      {/* Newsletter Pre-Footer Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-white/5">
        <div className="relative rounded-3xl p-8 sm:p-12 glass-panel border border-white/10 overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-gradient-to-tr from-cine-red/20 to-cine-purple/20 blur-3xl pointer-events-none" />
          
          <div className="max-w-xl text-center lg:text-left z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cine-red/20 text-cine-red border border-cine-red/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Stay Ahead of Every Premiere
            </span>
            <h3 className="font-cinematic font-bold text-2xl sm:text-3xl text-white">
              Join the CINEVERSE VIP Dispatch
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
              Get notified when newly restored 4K public-domain masterpieces, Blender Open Project premieres, and authorized downloads go live.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full max-w-md flex flex-col sm:flex-row gap-2 z-10">
            <input
              type="email"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-full text-xs glass-input placeholder:text-zinc-500"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-cine-red to-cine-purple hover:scale-105 active:scale-95 text-white font-semibold text-xs transition-all shadow-glow-red flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Subscribe</span>
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <div
            onClick={() => {
              audioService.playClick();
              onNavigate('home');
            }}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cine-red to-cine-purple p-0.5 shadow-glow-red">
              <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
                <Film className="w-4 h-4 text-cine-red" />
              </div>
            </div>
            <span className="font-cinematic font-bold text-2xl tracking-wider text-white">
              CINE<span className="text-cine-red">VERSE</span>
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed pr-6">
            The next-generation 3D discovery platform for cinema aficionados. Experience interactive 3D posters, ultra-high-definition streaming trailers, and 100% legally authorized public-domain and Creative Commons film downloads.
          </p>

          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl w-fit">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Authorized & DRM-Compliant</span>
          </div>
        </div>

        {/* Explore Links */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Discovery</h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <button
                onClick={() => { audioService.playClick(); onNavigate('home'); }}
                className="hover:text-white transition-colors"
              >
                Featured Premieres
              </button>
            </li>
            <li>
              <button
                onClick={() => { audioService.playClick(); onNavigate('explore'); }}
                className="hover:text-white transition-colors"
              >
                Advanced Search & Filters
              </button>
            </li>
            <li>
              <button
                onClick={() => { audioService.playClick(); onNavigate('public-domain'); }}
                className="hover:text-white transition-colors"
              >
                Public Domain Classics
              </button>
            </li>
            <li>
              <button
                onClick={() => { audioService.playClick(); onNavigate('watchlist'); }}
                className="hover:text-white transition-colors"
              >
                Personal Watchlist
              </button>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Categories</h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <button
                onClick={() => { audioService.playClick(); onNavigate('explore', { genre: 'Science Fiction' }); }}
                className="hover:text-white transition-colors"
              >
                Science Fiction
              </button>
            </li>
            <li>
              <button
                onClick={() => { audioService.playClick(); onNavigate('explore', { genre: 'Animation' }); }}
                className="hover:text-white transition-colors"
              >
                Animation & CGI
              </button>
            </li>
            <li>
              <button
                onClick={() => { audioService.playClick(); onNavigate('explore', { genre: 'Horror' }); }}
                className="hover:text-white transition-colors"
              >
                Horror & Suspense
              </button>
            </li>
            <li>
              <button
                onClick={() => { audioService.playClick(); onNavigate('explore', { genre: 'Comedy' }); }}
                className="hover:text-white transition-colors"
              >
                Comedy & Screwball
              </button>
            </li>
          </ul>
        </div>

        {/* Legal & Management */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Platform</h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <button
                onClick={() => { audioService.playClick(); onNavigate('admin'); }}
                className="text-cine-purple hover:underline font-semibold"
              >
                Admin CMS Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => { audioService.playClick(); onNavigate('about'); }}
                className="hover:text-white transition-colors"
              >
                About CINEVERSE
              </button>
            </li>
            <li>
              <button
                onClick={() => { audioService.playClick(); onNavigate('faq'); }}
                className="hover:text-white transition-colors"
              >
                FAQ & Resolution Guide
              </button>
            </li>
            <li>
              <button
                onClick={() => { audioService.playClick(); onNavigate('dmca'); }}
                className="hover:text-white transition-colors text-amber-400"
              >
                DMCA & Content Removal
              </button>
            </li>
            <li>
              <button
                onClick={() => { audioService.playClick(); onNavigate('privacy'); }}
                className="hover:text-white transition-colors"
              >
                Privacy Policy & Terms
              </button>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} CINEVERSE Entertainment Platform. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with cinematic precision for modern browsers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
