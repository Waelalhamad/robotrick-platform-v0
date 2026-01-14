import { useState, useEffect } from "react";
import { ArrowRight, Play, GraduationCap, Wrench, Printer, Globe } from "lucide-react";
import { motion } from "framer-motion";
import Modal from "../ui/Modal";
import { CircuitPattern, HexagonGrid } from "../ui";
import Spline from '@splinetool/react-spline';

export const Hero = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [typedText, setTypedText] = useState("");
  const fullText = "nto Innovation";

  useEffect(() => {
    let currentIndex = 0;
    let isDeleting = false;
    let timeout: NodeJS.Timeout;

    const type = () => {
      if (!isDeleting && currentIndex <= fullText.length) {
        // Typing forward
        setTypedText(fullText.slice(0, currentIndex));
        currentIndex++;
        timeout = setTimeout(type, 80); // 80ms per character (faster)
      } else if (!isDeleting && currentIndex > fullText.length) {
        // Pause at end before deleting
        timeout = setTimeout(() => {
          isDeleting = true;
          type();
        }, 2000); // Wait 2 seconds before erasing
      } else if (isDeleting && currentIndex > 0) {
        // Deleting backward
        currentIndex--;
        setTypedText(fullText.slice(0, currentIndex));
        timeout = setTimeout(type, 50); // Faster deletion
      } else if (isDeleting && currentIndex === 0) {
        // Pause at start before typing again
        isDeleting = false;
        timeout = setTimeout(type, 500); // Short pause before retyping
      }
    };

    // Start typing after initial delay
    timeout = setTimeout(type, 800);

    return () => clearTimeout(timeout);
  }, []);
  return (
    <section id="home" className="relative min-h-[90vh] flex items-center justify-center px-6 sm:px-8 lg:px-12 pt-24 md:pt-32 pb-12 md:pb-24 overflow-hidden bg-surface">
      {/* Modern Background - Tech Patterns & Gradients */}
      <div className="absolute inset-0 z-0">
        {/* Circuit board pattern */}
        <CircuitPattern opacity={0.2} color="#0369a1" animate={true} />

        {/* Hexagon grid overlay */}
        <HexagonGrid opacity={0.2} color="#2563eb" animate={true} size={80} />

        {/* Gradient orbs */}
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
        <div className="absolute right-0 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-accent/10 opacity-20 blur-[120px]"></div>
      </div>
      
      <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-24 items-center relative z-10">
        
        {/* Left Column: Copy */}
        <div className="space-y-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-primary/10 shadow-sm mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <span className="text-xs font-bold text-primary tracking-wider uppercase">Syria's Leading Robotics & Tech Hub</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-text-primary leading-[1.1] mb-6">
              Turn Curiosity
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-green-600 to-accent whitespace-nowrap">
                <span className="relative inline-block min-w-[15ch]">
                I{typedText}
                  <span className="absolute top-1/2 -translate-y-1/2 animate-pulse text-primary">|</span>
                </span>
                <svg className="absolute w-full h-3 -bottom-2 left-0 text-accent/30 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg sm:text-xl text-text-secondary max-w-lg leading-relaxed font-medium"
          >
            From <span className="text-primary font-bold">hands-on training</span> to <span className="text-primary font-bold">custom robotics solutions</span> and <span className="text-primary font-bold">3D printing services</span> — we bring your ideas to life with cutting-edge technology.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a
              href="#services"
              className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/25 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Explore Services
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </a>
            <button 
              onClick={() => setIsVideoOpen(true)}
              className="px-8 py-4 bg-white text-text-primary border border-border rounded-2xl font-bold text-lg hover:border-primary/30 hover:bg-secondary/30 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current text-primary" />
              Watch Video
            </button>
          </motion.div>

          <Modal
            isOpen={isVideoOpen}
            onClose={() => setIsVideoOpen(false)}
            size="xl"
            title="Introduction Video"
          >
            <div className="aspect-video w-full">
              <video 
                src="/images/video.mp4" 
                controls 
                autoPlay 
                loop
                className="w-full h-full rounded-lg" 
              />
            </div>
          </Modal>

          <div className="pt-8 flex items-center gap-6 text-sm font-medium text-text-secondary border-t border-border/50 mt-8">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><GraduationCap className="w-5 h-5" /></div>
              <span>Training</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><Wrench className="w-5 h-5" /></div>
              <span>Projects</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><Printer className="w-5 h-5" /></div>
              <span>3D Printing</span>
            </div>
          </div>
        </div>

        {/* Right Column: Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative lg:h-[600px] flex items-center justify-center"
        >
          {/* Main Card with 3D Spline Test */}
          <div className="relative w-full max-w-md aspect-[4/5] bg-transparent rounded-[2.5rem] overflow-hidden z-20">
            {/* 3D Spline Component - Direct Implementation */}
    <Spline scene="https://prod.spline.design/pNr6PeuFEerHyKrB/scene.splinecode" />
          </div>

          {/* Floating Quote Overlay */}
          <div className="absolute bottom-10 left-10 right-10 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-primary/20 z-30">
            <p className="font-bold text-base mb-0.5 text-primary">
              Future Innovator
            </p>
            <p className="text-xs text-text-secondary font-medium italic">
              "Robotrick gave me the tools to turn my ideas into reality."
            </p>
          </div>

          {/* Floating Elements - "More Details" */}
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 -left-10 z-30 bg-white p-4 rounded-2xl shadow-xl border border-border/50 hidden lg:block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">98%</div>
              <div className="text-sm font-bold text-text-primary">Success<br/>Rate</div>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-40 -right-5 z-30 bg-white p-4 rounded-2xl shadow-xl border border-border/50 hidden lg:block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><Globe className="w-5 h-5" /></div>
              <div className="text-sm font-bold text-text-primary">Global<br/>Competitions</div>
            </div>
          </motion.div>

          {/* Decorative Background Blobs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-primary/5 via-accent/5 to-transparent rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
        </motion.div>

      </div>
    </section>
  );
};
