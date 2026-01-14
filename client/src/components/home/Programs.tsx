import { useState } from "react";
import { ArrowRight, Users, Clock, Zap, Star, CheckCircle2, ChevronRight, Sparkles, Bot, Brain, Glasses, Printer, Plane, Code } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Programs = () => {
  const [activeCategory, setActiveCategory] = useState("Robotics");

  const categories = [
    { name: "Robotics", icon: Bot, color: "blue" },
    { name: "AI", icon: Brain, color: "purple" },
    { name: "VR", icon: Glasses, color: "pink" },
    { name: "3D Printing", icon: Printer, color: "orange" },
    { name: "Drones", icon: Plane, color: "cyan" },
    { name: "Web Dev", icon: Code, color: "green" },
  ];

  const programsByCategory: Record<string, any[]> = {
    "Robotics": [
      {
        title: "ALPHA ROBOTICS",
        age: "6-8 years",
        desc: "Play turns into invention! Kids learn robotics through building and block-based programming across 3 progressive levels.",
        duration: "A: 12h, B: 18h, C: 18h",
        level: "Beginner",
        features: ["Robot Building", "Block Programming", "Engineering Concepts"],
        popular: false
      },
      {
        title: "BLOCKS KIDS",
        age: "6-8 years",
        desc: "100-hour comprehensive journey combining mechanical projects and visual programming tailored for young minds.",
        duration: "100 hours",
        level: "Beginner",
        features: ["Mechanical Building", "Age-Appropriate Coding", "Full-Year Program"],
        popular: true
      },
      {
        title: "BLOCKS TEENS",
        age: "9-15 years",
        desc: "Winter program applying STEM concepts from school curriculum, prepares students for National Robotics Olympiad.",
        duration: "5 months",
        level: "Intermediate",
        features: ["STEM Integration", "Competition Prep", "School-Aligned Schedule"],
        popular: true
      },
      {
        title: "ROBOTICS PYTHON (Teens)",
        age: "9-12 years",
        desc: "Two-level program teaching Python for robot programming plus mechanical construction.",
        duration: "L1: 20h, L2: 24h",
        level: "Intermediate",
        features: ["Python Programming", "Robot Building", "Integrated Projects"],
        popular: false
      },
      {
        title: "Comprehensive Youth Robotics",
        age: "12-16 years",
        desc: "130-hour intensive program from hobby to professional level. Covers mechanical design, Arduino programming, and ESP32 IoT integration.",
        duration: "130 hours / 5 months",
        level: "Advanced",
        features: ["Mechanical Design", "Arduino & ESP32", "IoT Integration"],
        popular: true
      },
      {
        title: "Engineering Robotics Camp",
        age: "Adults & University",
        desc: "125-hour practical intensive in mechatronics and embedded systems. Master Arduino IDE, IoT with ESP32, and complete system integration.",
        duration: "125 hours",
        level: "Professional",
        features: ["Mechatronics", "IoT with ESP32", "Industrial Projects"],
        popular: false
      }
    ],
    "AI": [
      {
        title: "AI for Young Learners",
        age: "10-14 years",
        desc: "Interactive introduction to AI! Students teach robots to recognize faces, colors, and respond to voice commands using smart modules.",
        duration: "16-20 hours",
        level: "Beginner",
        features: ["Face Recognition", "Color Detection", "Voice Commands"],
        popular: true
      },
      {
        title: "AI Engineering Projects",
        age: "15-18 years",
        desc: "Advanced AI applications using smart sensors and cameras. Build autonomous systems with image/audio processing and intelligent decision-making.",
        duration: "24-32 hours",
        level: "Advanced",
        features: ["Image Processing", "Audio Recognition", "Autonomous Systems"],
        popular: false
      }
    ],
    "VR": [
      {
        title: "Virtual & Augmented Reality",
        age: "10-15 years",
        desc: "Explore VR (complete immersion) and AR (digital overlays) technologies. Conduct safe chemistry experiments, visualize physics forces, and explore 3D geometry.",
        duration: "20-24 hours",
        level: "Intermediate",
        features: ["VR Experience", "AR Applications", "Science Visualization"],
        popular: true
      }
    ],
    "3D Printing": [
      {
        title: "Innovators Program",
        age: "10-14 years",
        desc: "Master 3D design from Tinkercad to professional Fusion 360, then bring creations to life with hands-on 3D printing technology.",
        duration: "20 hours",
        level: "Beginner",
        features: ["Tinkercad to Fusion 360", "Print Settings", "Design to Reality"],
        popular: true
      },
      {
        title: "Professional 3D Printing",
        age: "Adults & University",
        desc: "Specialized deep-dive into 3D printing technology: material science, advanced slicing, printer calibration, troubleshooting, and maintenance.",
        duration: "16 hours",
        level: "Professional",
        features: ["Material Science", "Advanced Slicing", "Maintenance & Repair"],
        popular: false
      }
    ],
    "Drones": [
      {
        title: "DRONE BLOCKS",
        age: "6-9 years",
        desc: "Safe introduction to drones and flight principles using visual block programming to control educational drones indoors.",
        duration: "12-16 hours",
        level: "Beginner",
        features: ["Flight Basics", "Block Coding", "Safe Indoor Flight"],
        popular: true
      },
      {
        title: "DRONE PYTHON",
        age: "10-15 years",
        desc: "Advanced drone programming with Python. Code autonomous missions, aerial maneuvers, and data processing for algorithmic thinking.",
        duration: "20-24 hours",
        level: "Intermediate",
        features: ["Python Coding", "Autonomous Flight", "Data Processing"],
        popular: false
      }
    ],
    "Web Dev": [
      {
        title: "WordPress Mastery (3 Levels)",
        age: "12-16 years",
        desc: "Complete WordPress journey from infrastructure setup to professional site launch. Build personal, commercial, or news websites ready for market.",
        duration: "L1: 24h, L2: 32h, L3: 32h",
        level: "Beginner to Advanced",
        features: ["WordPress Fundamentals", "Page Building", "Security & Launch"],
        popular: true
      }
    ]
  };

  return (
    <section id="programs" className="relative py-12 md:py-24 bg-white overflow-hidden">
      {/* Unique Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-green-50/30 pointer-events-none" />
      <svg className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0 0 L100 100 M100 0 L0 100" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
      </svg>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border shadow-sm mb-6"
          >
            <Zap className="w-4 h-4 text-accent fill-accent" />
            <span className="text-xs font-bold text-text-primary tracking-wider uppercase">6 Specialized Tracks</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black text-text-primary mb-6"
          >
            Our Training <span className="text-primary">Programs</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-text-secondary max-w-2xl mx-auto"
          >
            From Robotics to AI, VR to Web Development - hands-on courses designed to turn passion into expertise.
          </motion.p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.name;
            return (
              <motion.button
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setActiveCategory(category.name)}
                className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 border-2 ${
                  isActive
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30 scale-105'
                    : 'bg-white text-text-secondary border-border hover:border-primary/50 hover:text-primary'
                }`}
              >
                <Icon className="w-5 h-5" />
                {category.name}
              </motion.button>
            );
          })}
        </div>

        {/* Programs Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {programsByCategory[activeCategory]?.map((program, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  const message = `Hello, I'm interested in the "${program.title}" program (${program.age}). Could you please provide more details?`;
                  window.open(`https://wa.me/+963942060440?text=${encodeURIComponent(message)}`, '_blank');
                }}
                className={`relative bg-white rounded-3xl overflow-hidden border transition-all duration-300 group hover:-translate-y-2 flex flex-col cursor-pointer ${
                  program.popular
                    ? 'border-primary shadow-2xl shadow-primary/10 ring-4 ring-primary/5'
                    : 'border-border hover:border-primary/30 hover:shadow-xl'
                }`}
              >
                {program.popular && (
                  <div className="absolute top-4 right-4 z-20 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                    <Star className="w-3 h-3 fill-current" />
                    Popular
                  </div>
                )}

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">
                      {program.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
                      {program.desc}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-6 flex-grow">
                    {program.features.map((feature: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-sm font-medium text-text-primary">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Metadata */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary font-medium">Age:</span>
                      <span className="font-bold text-text-primary">{program.age}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary font-medium">Duration:</span>
                      <span className="font-bold text-text-primary text-xs">{program.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary font-medium">Level:</span>
                      <span className="text-xs font-bold text-primary">{program.level}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-text-secondary mb-6">Can't find what you're looking for?</p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary-dark shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            Contact Us for Custom Programs
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};
