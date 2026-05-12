import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Cpu, 
  Home, 
  HeartPulse, 
  ArrowLeft, 
  ExternalLink, 
  ChevronRight,
  Globe,
  Zap,
  ShieldCheck
} from 'lucide-react';

const AboutMerlin = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const branches = [
    {
      id: 'digital',
      name: 'Merlin Digital',
      icon: <Cpu className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-400',
      headline: 'Building a Smarter World Through Technology',
      content: 'Established in 1998, Dubai-based Merlin Digital has spent over 27 years delivering innovative consumer electronics, smart mobility solutions, wearable technologies, multimedia systems, surveillance platforms, and digital experiences across global markets.',
      visual: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
      angle: -120, // Degrees for radial layout
    },
    {
      id: 'realestate',
      name: 'Merlin Real Estate',
      icon: <Home className="w-6 h-6" />,
      color: 'from-amber-500 to-orange-400',
      headline: 'Luxury Real Estate Backed by a Legacy of Trust',
      content: 'Merlin Real Estate specializes in luxury villas, apartments, and premium investment opportunities in Dubai. Backed by the Merlin Group legacy and partnerships with Emaar, Nakheel, Sobha, Damac, and Nshama, Merlin delivers exclusive access to high-value real estate opportunities.',
      visual: 'https://images.unsplash.com/photo-1512453979798-5ea4e7ed58e3?auto=format&fit=crop&q=80&w=800',
      angle: 0,
    },
    {
      id: 'lifesciences',
      name: 'Merlin Life Sciences',
      icon: <HeartPulse className="w-6 h-6" />,
      color: 'from-emerald-500 to-teal-400',
      headline: 'Advancing Wellness Through Non-Invasive Innovation',
      content: 'Merlin Life Sciences is focused on advanced wellness and recovery technologies, including External Counterpulsation (ECP) therapy designed to improve vitality, recovery, and cardiovascular wellness through non-invasive medical innovation.',
      visual: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
      angle: 120,
    }
  ];

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 1 } }
  };

  const logoVariants = {
    initial: { scale: 1, filter: 'drop-shadow(0 0 0px rgba(255,255,255,0))' },
    hover: { 
      scale: 1.05, 
      filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))',
      transition: { duration: 0.4, ease: "easeOut" }
    },
    expanded: { scale: 0.8, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  const branchVariants = {
    hidden: { opacity: 0, scale: 0, x: 0, y: 0 },
    visible: (angle) => {
      const radius = 220; // Distance from center
      const x = Math.cos((angle * Math.PI) / 180) * radius;
      const y = Math.sin((angle * Math.PI) / 180) * radius;
      return {
        opacity: 1,
        scale: 1,
        x,
        y,
        transition: { 
          type: "spring",
          stiffness: 100,
          damping: 15,
          delay: 0.1
        }
      };
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-[#05070a] text-white selection:bg-health-primary/30 overflow-hidden relative font-body"
    >
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-health-primary/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
      </div>

      {/* NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-8 flex justify-between items-center">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to HexaGene
        </button>
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-health-primary/60">
          Merlin Ecosystem v2026
        </div>
      </nav>

      {/* MAIN ECOSYSTEM INTERACTION */}
      <div className="relative z-10 h-screen flex items-center justify-center">
        
        {/* CENTRAL LOGO SYSTEM */}
        <div className="relative flex items-center justify-center w-full max-w-4xl">
          
          {/* Main Logo Container */}
          <motion.div
            variants={logoVariants}
            initial="initial"
            whileHover={!isExpanded ? "hover" : ""}
            animate={isExpanded ? "expanded" : "initial"}
            onClick={() => setIsExpanded(!isExpanded)}
            className="cursor-pointer z-20 relative group"
          >
            <div className="relative p-12 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-full shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all group-hover:border-white/20">
              {/* MERLIN TEXT LOGO PLACEHOLDER - Users should replace with src/assets/merlin-master.png */}
              <div className="w-48 h-16 flex items-center justify-center">
                <span className="text-4xl font-heading font-black tracking-[0.2em] italic">
                  MERL<span className="text-health-primary">I</span>N
                </span>
              </div>
              
              {/* Animated Ring */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-10px] border border-dashed border-white/10 rounded-full"
              />
            </div>

            {/* Tap/Hover Hint */}
            {!isExpanded && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.3em] text-health-primary animate-bounce"
              >
                Explore Ecosystem
              </motion.div>
            )}
          </motion.div>

          {/* BRANCHES (Animated outward) */}
          <AnimatePresence>
            {isExpanded && branches.map((branch) => (
              <motion.div
                key={branch.id}
                custom={branch.angle}
                variants={branchVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                whileHover={{ scale: 1.1, zIndex: 30 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBranch(branch);
                }}
                className="absolute cursor-pointer group"
              >
                <div className="relative">
                  <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${branch.color} p-[1px] shadow-2xl transition-all group-hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]`}>
                    <div className="w-full h-full rounded-full bg-[#0a0c10] flex flex-col items-center justify-center gap-2 p-4 text-center">
                      <div className="text-white/80 group-hover:text-white transition-colors">
                        {branch.icon}
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest leading-tight">
                        {branch.name.split(' ')[1]}
                      </span>
                    </div>
                  </div>
                  
                  {/* Connection Line */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-px bg-gradient-to-r from-white/20 to-transparent -z-10 blur-[1px]" 
                       style={{ transform: `rotate(${branch.angle + 180}deg) translateX(80px)` }} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* BRANCH DETAIL OVERLAY */}
      <AnimatePresence>
        {selectedBranch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 backdrop-blur-md bg-black/40"
            onClick={() => setSelectedBranch(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0f1218] border border-white/10 rounded-[2rem] overflow-hidden max-w-5xl w-full flex flex-col md:flex-row shadow-2xl relative"
            >
              {/* Image Section */}
              <div className="md:w-1/2 h-64 md:h-auto relative">
                <img 
                  src={selectedBranch.visual} 
                  alt={selectedBranch.name} 
                  className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1218] via-transparent to-transparent md:hidden" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0f1218] hidden md:block" />
              </div>

              {/* Content Section */}
              <div className="md:w-1/2 p-10 md:p-16 space-y-8 flex flex-col justify-center">
                <button 
                  onClick={() => setSelectedBranch(null)}
                  className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
                >
                  <ChevronRight size={32} className="rotate-180" />
                </button>

                <div className="space-y-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${selectedBranch.color} text-[10px] font-black uppercase tracking-widest text-white`}>
                    {selectedBranch.icon}
                    {selectedBranch.name}
                  </div>
                  <h2 className="text-3xl md:text-5xl font-heading font-black leading-tight tracking-tight">
                    {selectedBranch.headline}
                  </h2>
                </div>

                <p className="text-gray-400 text-lg leading-relaxed font-medium">
                  {selectedBranch.content}
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <button className="px-8 py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2">
                    Visit Website <ExternalLink size={14} />
                  </button>
                  <button className="px-8 py-3 bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all">
                    Partner with us
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CUSTOM CURSOR EFFECT (Optional but premium) */}
      <div className="fixed inset-0 pointer-events-none z-[200] hidden lg:block">
        <motion.div 
          animate={{ scale: isExpanded ? 1.5 : 1 }}
          className="w-4 h-4 rounded-full border border-white/20 mix-blend-difference"
        />
      </div>
    </motion.div>
  );
};

export default AboutMerlin;
