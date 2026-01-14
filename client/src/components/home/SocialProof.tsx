import { useEffect, useState, useRef } from "react";
import { Users, Award, Wrench, Printer } from "lucide-react";
import { motion, useInView, useSpring, useMotionValue } from "framer-motion";

const AnimatedCounter = ({ value, suffix = "" }: { value: number, suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 50, stiffness: 100 });
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.floor(latest).toLocaleString() + suffix;
      }
    });
  }, [springValue, suffix]);

  return <span ref={ref} />;
};

export const SocialProof = () => {
  const stats = [
    { icon: Users, value: 2200, suffix: "+", label: "Students Trained", color: "primary" },
    { icon: Wrench, value: 50, suffix: "+", label: "Projects Delivered", color: "primary" },
    { icon: Printer, value: 500, suffix: "+", label: "3D Prints Completed", color: "primary" },
    { icon: Award, value: 3, suffix: "", label: "Years of Experience", textValue: "3", color: "primary" },
  ];

  return (
    <section className="py-12 md:py-24 bg-surface border-y border-border relative overflow-hidden">
       {/* Background Glow */}
       <div className="absolute inset-0 bg-primary/5 opacity-50 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-primary/20">
                <stat.icon className="w-8 h-8 text-primary" />
              </div>
              
              <div className="text-4xl sm:text-5xl font-black text-text-primary mb-2 tracking-tight">
                {stat.textValue ? (
                  <span>{stat.textValue}</span>
                ) : (
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                )}
              </div>
              
              <div className="text-sm font-bold text-text-secondary uppercase tracking-wider group-hover:text-primary transition-colors">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
