import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Cpu, 
  Home, 
  HeartPulse, 
  ChevronDown, 
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';

const AboutMerlinModal = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState(null);

  const categories = [
    {
      id: 'digital',
      title: 'Merlin Digital',
      icon: <Cpu className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-400',
      content: 'Dubai-based Merlin Digital has delivered smart technologies, consumer electronics, wearable innovation, multimedia systems, and connected digital experiences for over 27 years.'
    },
    {
      id: 'realestate',
      title: 'Merlin Real Estate',
      icon: <Home className="w-5 h-5" />,
      color: 'from-amber-500 to-orange-400',
      content: 'Merlin Real Estate delivers premium Dubai property experiences through trusted partnerships with leading developers including Emaar, Sobha, Damac, Nakheel, and Nshama.'
    },
    {
      id: 'lifesciences',
      title: 'Merlin Life Sciences',
      icon: <HeartPulse className="w-5 h-5" />,
      color: 'from-emerald-500 to-teal-400',
      content: 'Merlin Life Sciences focuses on wellness innovation and advanced recovery technologies including non-invasive therapeutic systems and modern healthcare solutions.'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-6xl max-h-[90vh] bg-[#0a0c10] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-50 p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all border border-white/10"
            >
              <X size={24} />
            </button>

            {/* Scrollable Content Container */}
            <div className="overflow-y-auto custom-scrollbar flex-1">
              
              {/* HERO IMAGE SECTION */}
              <div className="relative p-4 md:p-8">
                <div className="relative rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 group">
                  {/* HERO IMAGE - Primary ecosystem visual */}
                  <img 
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-mOn2v0u4N0u4N0u4N0u4N0u4N0u4N.png" // Placeholder, will use actual asset if possible
                    alt="Merlin Ecosystem"
                    className="w-full aspect-[16/10] object-cover grayscale-[0.1] group-hover:grayscale-0 transition-all duration-1000 scale-100 group-hover:scale-105"
                    style={{ 
                      // In a real scenario, this would be src/assets/merlin/ecosystem-hero.jpg
                      // For now, I'll use a placeholder that looks high-end
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-transparent to-transparent opacity-60" />
                  
                  {/* Logo Overlay */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                    <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-[0.4em] text-white">
                      Ecosystem Overview
                    </div>
                  </div>
                </div>
              </div>

              {/* INTRO CONTENT */}
              <div className="px-8 md:px-16 pb-16 space-y-12">
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                  <h2 className="text-3xl md:text-5xl font-heading font-black leading-tight tracking-tight text-white">
                    One Legacy. <span className="text-health-primary">Infinite Innovation.</span>
                  </h2>
                  <p className="text-gray-400 text-lg md:text-xl font-medium leading-relaxed">
                    Merlin unites technology, real estate, and life sciences into one connected ecosystem 
                    focused on innovation, wellness, and the future of intelligent experiences.
                  </p>
                </div>

                {/* CATEGORY SELECTOR */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {categories.map((cat) => (
                    <motion.button
                      key={cat.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                      className={`relative p-8 rounded-3xl border transition-all duration-500 flex flex-col items-center text-center gap-4 ${
                        activeCategory === cat.id 
                        ? `bg-gradient-to-br ${cat.color} border-white/20 shadow-lg shadow-white/5` 
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
                      }`}
                    >
                      <div className={`p-4 rounded-2xl ${activeCategory === cat.id ? 'bg-white/20' : 'bg-white/5 text-gray-400'}`}>
                        {cat.icon}
                      </div>
                      <div className="space-y-1">
                        <h4 className={`font-black uppercase tracking-widest text-xs ${activeCategory === cat.id ? 'text-white' : 'text-gray-300'}`}>
                          {cat.title}
                        </h4>
                        <ChevronDown 
                          size={16} 
                          className={`mx-auto transition-transform duration-500 ${activeCategory === cat.id ? 'rotate-180 text-white' : 'text-gray-500'}`} 
                        />
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* EXPANDABLE CONTENT PANEL */}
                <AnimatePresence mode="wait">
                  {activeCategory && (
                    <motion.div
                      key={activeCategory}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="p-10 md:p-16 rounded-[2.5rem] bg-white/[0.03] border border-white/10 flex flex-col md:flex-row gap-12 items-center">
                        <div className="md:w-2/3 space-y-6">
                          <h3 className="text-2xl md:text-4xl font-black text-white">
                            {categories.find(c => c.id === activeCategory).title}
                          </h3>
                          <p className="text-gray-400 text-lg leading-relaxed font-medium">
                            {categories.find(c => c.id === activeCategory).content}
                          </p>
                          <div className="flex gap-4 pt-4">
                            <button className="px-8 py-3 bg-health-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-health-primary/80 transition-all flex items-center gap-2">
                              Explore Division <ExternalLink size={12} />
                            </button>
                            <button className="px-8 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all">
                              Case Studies
                            </button>
                          </div>
                        </div>
                        <div className="md:w-1/3 flex justify-center">
                          <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br ${categories.find(c => c.id === activeCategory).color} opacity-20 blur-3xl animate-pulse`} />
                          <div className={`absolute w-24 h-24 md:w-32 md:h-32 rounded-full border border-white/10 flex items-center justify-center text-white/50`}>
                            {categories.find(c => c.id === activeCategory).icon}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* FOOTER INFO */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="flex items-center gap-4">
                    <Zap className="text-health-primary" size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                      Innovating since 1998
                    </span>
                  </div>
                  <div className="flex gap-8">
                    <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Press Inquiries</a>
                    <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Investor Portal</a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AboutMerlinModal;
