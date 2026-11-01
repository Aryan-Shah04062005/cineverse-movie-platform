import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { authService } from '../../services/authService';
import { audioService } from '../../services/audioService';
import { useToast } from './Toast';

export default function AuthModal({ isOpen, onClose }) {
  const { addToast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast({
        type: 'error',
        title: 'Missing Fields',
        message: 'Please provide both email and password.'
      });
      return;
    }

    const user = authService.login(email, password);
    if (!user) {
      audioService.playClick();
      addToast({
        type: 'error',
        title: 'Authentication Failed',
        message: 'Invalid email or password. Please check your credentials and try again.'
      });
      return;
    }

    if (name && isSignUp) {
      authService.updateProfile({ name });
    }

    audioService.playSuccess();
    addToast({
      type: 'success',
      title: isSignUp ? 'Account Created!' : 'Welcome Back!',
      message: `Logged in as ${user.name} (${user.role === 'admin' ? 'Administrator' : 'Premium Member'})`
    });
    onClose();
  };

  const handleQuickMember = () => {
    const guest = authService.loginAsGuest();
    audioService.playSuccess();
    addToast({
      type: 'success',
      title: 'Member Access Granted',
      message: `Signed in as ${guest.name}.`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-3xl glass-panel border border-white/20 p-6 sm:p-8 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            audioService.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cine-red to-cine-purple p-0.5 shadow-glow-red mx-auto mb-3">
            <div className="w-full h-full bg-background rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cine-red" />
            </div>
          </div>
          <h2 className="font-cinematic font-bold text-2xl text-white">
            {showForgot ? 'Reset Password' : isSignUp ? 'Join CINEVERSE' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {showForgot
              ? 'Enter your email to receive recovery instructions'
              : isSignUp
              ? 'Create an account to save watchlists and explore 4K films'
              : 'Sign in to access your custom watchlist and library'}
          </p>
        </div>

        {/* Forgot Password View */}
        {showForgot ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs glass-input"
                />
              </div>
            </div>

            <button
              onClick={() => {
                audioService.playSuccess();
                addToast({
                  type: 'info',
                  title: 'Reset Link Sent',
                  message: `Password reset link dispatched to ${email || 'your email'}.`
                });
                setShowForgot(false);
              }}
              className="w-full py-3 rounded-full bg-gradient-to-r from-cine-red to-cine-purple text-white font-semibold text-xs shadow-glow-red"
            >
              Send Reset Link
            </button>

            <button
              onClick={() => setShowForgot(false)}
              className="w-full text-center text-xs text-zinc-400 hover:text-white"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Vance"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs glass-input"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs glass-input"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-zinc-300">Password</label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-[11px] text-cine-red hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs glass-input"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-gradient-to-r from-cine-red to-cine-purple hover:scale-[1.02] active:scale-95 text-white font-semibold text-xs shadow-glow-red transition-all flex items-center justify-center gap-2"
            >
              <span>{isSignUp ? 'Create Free Account' : 'Sign In to CINEVERSE'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Toggle Sign in / Sign up */}
            <div className="text-center pt-2 text-xs text-zinc-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-cine-red font-semibold hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>

            {/* Quick Guest Access */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-center">
                Instant Guest Preview
              </span>
              <button
                type="button"
                onClick={handleQuickMember}
                className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <User className="w-4 h-4 text-cine-purple" />
                <span>Continue as Guest Explorer</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
