import { motion } from "framer-motion";
import { Sparkles, Trophy } from "lucide-react";
import { TechGrid, CircuitPattern } from "../ui";

export const About = () => {
  return (
    <section id="about" className="relative py-12 md:py-24 bg-surface overflow-hidden">
      {/* Background Decor - Tech themed */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        {/* Tech grid pattern */}
        <TechGrid opacity={0.15} color="#0369a1" />

        {/* Circuit pattern in corner */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2">
          <CircuitPattern opacity={0.15} color="#0369a1" />
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary rounded-full blur-3xl opacity-[0.15]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent rounded-full blur-3xl opacity-[0.10]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Left Column: Text Content */}
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border shadow-sm mb-6"
            >
              <Sparkles className="w-4 h-4 text-accent fill-accent" />
              <span className="text-xs font-bold text-text-primary tracking-wider uppercase">Our Story</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-black text-text-primary mb-6 leading-tight"
            >
              Syria's Complete <br/><span className="text-primary">Robotics & Tech Solution</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-text-secondary mb-8 leading-relaxed"
            >
              For 3 years, Robotrick has been Syria's premier robotics and technology hub. We offer comprehensive <span className="text-primary font-semibold">training programs</span> that have empowered 2,200+ students, <span className="text-primary font-semibold">custom technical projects</span> that bring innovative ideas to life, and professional <span className="text-primary font-semibold">3D printing services</span> from prototyping to production. Whether you're learning, building, or creating — we're your technology partner.
            </motion.p>
          </div>

          {/* Right Column: Image Collage */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="relative z-10 grid grid-cols-2 gap-4">
              <div className="space-y-4 mt-8">
                <div className="h-48 bg-gray-200 rounded-3xl overflow-hidden relative group">
                  <img 
                    src="/images/image-2.jpg" 
                    alt="Robotrick Team Photo"
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
                  />
                </div>
                <div className="h-64 bg-gray-200 rounded-3xl overflow-hidden relative group">
                  <img 
                    src="/images/image-3.jpg" 
                    alt="Lab Session - Students Learning Robotics"
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded-3xl overflow-hidden relative group">
                  <img 
                    src="/images/image-4.jpg" 
                    alt="Robotics Competition"
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
                  />
                </div>
                <div className="h-48 bg-gray-200 rounded-3xl overflow-hidden relative group">
                  <img 
                    src="/images/image-5.jpg" 
                    alt="Awards and Achievements"
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Floating Stats Card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white p-6 rounded-3xl shadow-xl border border-border text-center w-48">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-black text-text-primary mb-1">3 Years</div>
              <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">Leading Innovation</div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
