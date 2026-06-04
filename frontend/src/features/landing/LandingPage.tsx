// src/features/landing/LandingPage.tsx
import React from 'react';
import { Link } from 'react-router-dom'; // 🎯 Yönlendirme için eklendi
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ThreeDViewport } from './components/ThreeDViewport';
import { Footer } from './components/Footer';
import { Network, ShieldAlert, Cpu, Layers, CheckCircle2 } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDFBFA] dark:bg-zinc-950 text-neutral-900 dark:text-zinc-100 selection:bg-red-500/10 transition-colors duration-300">
      <Navbar />
      <HeroSection />

      {/* Core Platform Capabilities Section */}
      <section className="max-w-7xl mx-auto px-6 py-24" id="platform">
        <div className="text-center mb-20">
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-4">
            Core Platform Capabilities
          </h2>
          <p className="text-neutral-500 dark:text-zinc-400 text-sm">
            Interact with our next-generation architecture
          </p>
          <div className="w-12 h-1 bg-red-700 dark:bg-red-600 mx-auto mt-4 rounded-full" />
        </div>

        {/* Modular Feature Alternating Grid */}
        <div className="space-y-28">
          
          {/* Feature 1: Intelligent Task System */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex p-3 rounded-lg bg-red-100/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 text-red-700 dark:text-red-400">
                <Network className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Intelligent Task System</h3>
              <p className="text-neutral-600 dark:text-zinc-400 leading-relaxed text-sm">
                Visualize workflow management with unprecedented clarity. Distribute complex annotation jobs across global teams using our dynamic node-based routing engine.
              </p>
              <ul className="space-y-3 pt-2 text-sm text-neutral-600 dark:text-zinc-400 font-medium">
                {['Automated quality assurance routing', 'Real-time bottleneck detection', 'Dynamic workload balancing'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-red-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-first lg:order-last">
              <ThreeDViewport type="nodes" />
            </div>
          </div>

          {/* Feature 2: Role-Based Access */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <ThreeDViewport type="security" />
            </div>
            <div className="space-y-6">
              <div className="inline-flex p-3 rounded-lg bg-red-100/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 text-red-700 dark:text-red-400">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Role-Based Access</h3>
              <p className="text-neutral-600 dark:text-zinc-400 leading-relaxed text-sm">
                Enterprise-grade security woven into the fabric of the platform. Manage granular permissions with geometric precision, ensuring data integrity at every layer.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {['SSO Ready', 'Audit Logs', 'SOC2 Compliant'].map((badge) => (
                  <span 
                    key={badge} 
                    className="px-3 py-1 text-[11px] font-mono font-semibold rounded-full bg-red-50 dark:bg-red-950/10 text-red-800 dark:text-red-400 border border-red-100 dark:border-red-950"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Feature 3: Client-Side MobileSAM */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex p-3 rounded-lg bg-red-100/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 text-red-700 dark:text-red-400">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Client-Side MobileSAM</h3>
              <p className="text-neutral-600 dark:text-zinc-400 leading-relaxed text-sm">
                Zero-latency AI assistance. Our optimized MobileSAM implementation runs entirely in the browser, providing instant, highly accurate segmentation masks without server roundtrips.
              </p>
              
              {/* Interactive Status Card */}
              <div className="bg-red-50/50 dark:bg-zinc-900/40 border border-red-100 dark:border-zinc-800 rounded-xl p-5 space-y-3 font-mono text-xs text-neutral-700 dark:text-zinc-400 max-w-md">
                <div className="flex justify-between items-center text-red-700 dark:text-red-400 font-bold border-b border-red-100 dark:border-zinc-800 pb-2 mb-2">
                  <span>Segmentation_Engine</span>
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                </div>
                <div>Processing: <span className="text-neutral-900 dark:text-white">Local WASM Runtime</span></div>
                <div>Latency: <span className="text-neutral-900 dark:text-white">&lt; 50ms</span></div>
                <div>Accuracy: <span className="text-neutral-900 dark:text-white">Sub-pixel mask boundary</span></div>
              </div>
            </div>
            <div className="order-first lg:order-last">
              <ThreeDViewport type="segmentation" />
            </div>
          </div>

          {/* Feature 4: Modern Viewing Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <ThreeDViewport type="interface" />
            </div>
            <div className="space-y-6">
              <div className="inline-flex p-3 rounded-lg bg-red-100/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 text-red-700 dark:text-red-400">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Modern Viewing Interface</h3>
              <p className="text-neutral-600 dark:text-zinc-400 leading-relaxed text-sm">
                A beautifully engineered labeling canvas designed for prolonged focus. Support for massive point clouds, 4K video interpolation, and multi-layered geospatial imagery.
              </p>
              <ul className="space-y-3 pt-2 text-sm text-neutral-600 dark:text-zinc-400 font-medium">
                {['Hardware-accelerated rendering', 'Custom shortcut mapping', 'Multi-modal annotation support'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-red-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="relative rounded-3xl bg-red-50/40 dark:bg-zinc-900/30 border border-red-100 dark:border-zinc-800/80 p-8 md:p-16 text-center overflow-hidden">
          <div className="absolute top-0 right-0 h-48 w-48 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-4">
            Ready to scale your vision model?
          </h3>
          <p className="text-neutral-500 dark:text-zinc-400 max-w-xl mx-auto text-sm leading-relaxed mb-8">
            Join over 500+ engineering teams building the next generation of autonomous vehicles, drones, and medical AI.
          </p>
          {/* 🎯 ÇÖZÜM: Create Free Workspace butonu /register sayfasına yönlendirildi */}
          <Link 
            to="/register" 
            className="inline-block bg-red-700 hover:bg-red-800 text-white font-semibold text-sm px-8 py-4 rounded-xl shadow-lg shadow-red-700/10 transition-colors"
          >
            Create Free Workspace
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};