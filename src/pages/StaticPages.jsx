import React, { useState } from 'react';
import {
  ShieldCheck,
  Film,
  HelpCircle,
  FileText,
  Mail,
  Send,
  Sparkles,
  Lock,
  Award,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { audioService } from '../services/audioService';
import { useToast } from '../components/common/Toast';

export default function StaticPages({ pageId = 'about', onNavigate }) {
  const { addToast } = useToast();
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [dmcaForm, setDmcaForm] = useState({ title: '', rightsHolder: '', link: '', statement: '' });

  const handleSendContact = (e) => {
    e.preventDefault();
    audioService.playSuccess();
    addToast({
      type: 'success',
      title: 'Message Transmitted',
      message: 'Thank you for reaching out to CINEVERSE Support. We will review your inquiry shortly.'
    });
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  const handleSendDmca = (e) => {
    e.preventDefault();
    audioService.playSuccess();
    addToast({
      type: 'success',
      title: 'Copyright Notice Received',
      message: 'Your content removal notice has been logged with our legal compliance office.'
    });
    setDmcaForm({ title: '', rightsHolder: '', link: '', statement: '' });
  };

  return (
    <div className="min-h-screen text-zinc-100 pt-28 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Navigation tabs between static pages */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-white/10 pb-3">
          {[
            { id: 'about', label: 'About CINEVERSE' },
            { id: 'faq', label: 'FAQ & Tech Specs' },
            { id: 'dmca', label: 'DMCA & Legal Notice' },
            { id: 'privacy', label: 'Privacy & Terms' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                audioService.playClick();
                onNavigate(tab.id);
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                pageId === tab.id
                  ? 'bg-gradient-to-r from-cine-red to-cine-purple text-white shadow-glow-red'
                  : 'glass-panel text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 1. ABOUT US PAGE */}
        {pageId === 'about' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-cine-red">
                About the Platform
              </span>
              <h1 className="font-cinematic font-black text-4xl sm:text-5xl text-white">
                CINEVERSE: The Future of 3D Cinema Discovery
              </h1>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                CINEVERSE is a next-generation cinematic discovery and preservation platform built to combine the visual grandeur of futuristic 3D user interfaces with the ethics of authentic, open-access media.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-3">
                <div className="p-3 rounded-2xl bg-cine-red/20 text-cine-red w-fit">
                  <Film className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-white">4K Restored Classics</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  We showcase legendary films from cinema history restored in pristine high definition, preserving cultural heritage for future generations.
                </p>
              </div>

              <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-3">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 w-fit">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-white">100% Authorized</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  We strictly respect intellectual property. All downloadable media are certified public domain or distributed under Creative Commons attribution.
                </p>
              </div>

              <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-3">
                <div className="p-3 rounded-2xl bg-cine-purple/20 text-cine-purple w-fit">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-white">Next-Gen 3D UI</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Engineered with WebGL particles, realistic 3D perspective tilting, and synthesized spatial audio for an unmatched immersive experience.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
              <h3 className="font-cinematic font-bold text-2xl text-white">Contact the CINEVERSE Team</h3>
              <form onSubmit={handleSendContact} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-2.5 rounded-xl text-xs glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="jane@example.com"
                      className="w-full px-4 py-2.5 rounded-xl text-xs glass-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="General inquiry, film restoration, or partnership"
                    className="w-full px-4 py-2.5 rounded-xl text-xs glass-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Type your message here..."
                    className="w-full px-4 py-2.5 rounded-xl text-xs glass-input"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-cine-red to-cine-purple text-white text-xs font-bold shadow-glow-red hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 2. FAQ PAGE */}
        {pageId === 'faq' && (
          <div className="space-y-8 animate-in fade-in">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cine-cyan">
                Frequently Asked Questions
              </span>
              <h1 className="font-cinematic font-black text-4xl text-white mt-1">
                Help & Technical Specifications
              </h1>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "What makes CINEVERSE downloads 100% legal?",
                  a: "Every downloadable movie in our catalog is either verified to be in the public domain under United States and international copyright law, or explicitly licensed for free distribution under Creative Commons licenses (such as open-content films produced by the Blender Foundation). We never offer pirated or unlicensed commercial media."
                },
                {
                  q: "Which file formats and audio codecs are provided for download?",
                  a: "Depending on the title, we offer standard MP4 (H.264) for maximum device compatibility, as well as high-efficiency MKV (HEVC / H.265) containers with 5.1 Surround sound and uncompressed audio channels for home theatre systems."
                },
                {
                  q: "Can I download movies in 4K Ultra HD?",
                  a: "Yes! Titles with 4K master sources (such as Tears of Steel, Sintel, and restored scans of Metropolis) feature full 2160p resolution files with high bitrates up to 24 Mbps."
                },
                {
                  q: "Why do some movies say 'Download Unauthorized'?",
                  a: "Commercial studio releases that are featured for trailer viewing and exploration do not have distributor authorization for open file downloading. For these titles, only high-definition streaming trailers are enabled."
                },
                {
                  q: "How does the 3D card tilt and lighting effect work?",
                  a: "Our card components use high-performance CSS 3D perspective transforms calculated dynamically from the cursor's coordinate matrix, coupled with a specular light gradient sheen overlay to simulate realistic depth."
                }
              ].map((item, idx) => (
                <div key={idx} className="p-6 rounded-2xl glass-panel border border-white/10 space-y-2">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-cine-red flex-shrink-0" />
                    <span>{item.q}</span>
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed pl-6">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. DMCA & COPYRIGHT REMOVAL PAGE */}
        {pageId === 'dmca' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Copyright Compliance
              </span>
              <h1 className="font-cinematic font-black text-4xl text-white">
                DMCA & Content Removal Requests
              </h1>
              <p className="text-zinc-300 text-sm leading-relaxed">
                CINEVERSE adheres strictly to the Digital Millennium Copyright Act (17 U.S.C. § 512). If you believe your copyrighted work has been improperly cataloged or linked on our platform without authorization, submit a notification below for prompt removal.
              </p>
            </div>

            <div className="p-8 rounded-3xl glass-panel border border-amber-500/30 space-y-6">
              <h3 className="font-bold text-lg text-white">Submit Content Takedown Notice</h3>

              <form onSubmit={handleSendDmca} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Movie / Work Title</label>
                    <input
                      type="text"
                      required
                      value={dmcaForm.title}
                      onChange={(e) => setDmcaForm({ ...dmcaForm, title: e.target.value })}
                      placeholder="Title of copyrighted material"
                      className="w-full px-4 py-2.5 rounded-xl text-xs glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Copyright Holder / Agency</label>
                    <input
                      type="text"
                      required
                      value={dmcaForm.rightsHolder}
                      onChange={(e) => setDmcaForm({ ...dmcaForm, rightsHolder: e.target.value })}
                      placeholder="e.g. Studio Name, Author, or Authorized Agent"
                      className="w-full px-4 py-2.5 rounded-xl text-xs glass-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Specific CINEVERSE URL / Link</label>
                  <input
                    type="url"
                    required
                    value={dmcaForm.link}
                    onChange={(e) => setDmcaForm({ ...dmcaForm, link: e.target.value })}
                    placeholder="https://cineverse.io/movie/..."
                    className="w-full px-4 py-2.5 rounded-xl text-xs glass-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Good-Faith Statement & Evidence</label>
                  <textarea
                    rows={4}
                    required
                    value={dmcaForm.statement}
                    onChange={(e) => setDmcaForm({ ...dmcaForm, statement: e.target.value })}
                    placeholder="State under penalty of perjury that you are the copyright holder or authorized to act on behalf of the owner..."
                    className="w-full px-4 py-2.5 rounded-xl text-xs glass-input"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  Submit Official DMCA Takedown Request
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 4. PRIVACY & TERMS */}
        {pageId === 'privacy' && (
          <div className="space-y-8 animate-in fade-in text-xs leading-relaxed text-zinc-300">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cine-purple">
                Legal Terms
              </span>
              <h1 className="font-cinematic font-black text-4xl text-white mt-1">
                Privacy Policy & Terms of Service
              </h1>
            </div>

            <div className="p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white">1. Data Privacy & Local Storage</h3>
                <p>
                  CINEVERSE does not sell, track, or share your personal viewing preferences with third-party advertising networks. Your watchlist, favorites, and watch history are stored directly within your local browser storage engine (LocalDB) and remain under your complete control.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white">2. Acceptable Use Policy</h3>
                <p>
                  Users may stream trailers and download legally authorized open-content movies for personal, educational, or creative fair-use purposes. Automated scraping, malicious intrusion, or attempts to bypass access protections are strictly prohibited.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white">3. Public Domain Disclaimer</h3>
                <p>
                  While CINEVERSE verifies the public domain status of historic works in the United States, copyright terms may vary across international jurisdictions. Users outside the United States are encouraged to verify local public domain terms prior to commercial redistribution.
                </p>
              </section>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
