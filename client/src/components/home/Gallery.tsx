import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { TechGrid } from "../ui";

export const Gallery = () => {
  const navigate = useNavigate();

  return (
    <section id="gallery" className="relative py-12 md:py-24 bg-surface overflow-hidden">
      {/* Background Decor - Tech themed */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Tech grid pattern */}
        <TechGrid opacity={0.1} color="#0369a1" />

        {/* Subtle gradient orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-text-primary mb-2">
              Our <span className="text-primary">Work</span>
            </h2>
            <p className="text-text-secondary">From training sessions to custom projects and 3D prints — see what we create.</p>
          </div>
            <button
              onClick={() => navigate("/gallery")}
              className="px-6 py-3 rounded-xl border border-border bg-white font-bold text-text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
            >
              View All Gallery
            </button>
        </div>

        {/* Masonry-style Grid (Simplified with CSS Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px] md:h-[500px]">
          
          {/* Large Item */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden group"
          >
            <img 
              src="/images/image-6.jpg" 
              alt="Competition Day - Robotrick Students"
              className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white font-bold bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">Competition Day</p>
            </div>
          </motion.div>

          {/* Small Item 1 */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative rounded-3xl overflow-hidden group bg-white"
          >
            <img 
              src="/images/image-7.jpg" 
              alt="Students Building Robots"
              className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
            />
          </motion.div>

          {/* Small Item 2 */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative rounded-3xl overflow-hidden group bg-white"
          >
            <img 
              src="/images/image-8.jpg" 
              alt="Robotics Workshop"
              className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
};
