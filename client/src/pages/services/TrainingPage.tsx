import { SEO } from "../../components/seo/SEO";
import { LandingHeader } from "../../components/layout/LandingHeader";
import { Footer } from "../../components/layout/Footer";
import { Programs } from "../../components/home/Programs";
import { WaveDivider } from "../../components/ui";
import { motion } from "framer-motion";
import { GraduationCap, Users, Award, TrendingUp } from "lucide-react";

export default function TrainingPage() {
  const stats = [
    { icon: Users, value: "2200+", label: "Students Trained" },
    { icon: Award, value: "6", label: "Program Tracks" },
    { icon: TrendingUp, value: "3", label: "Years Experience" },
    { icon: GraduationCap, value: "100%", label: "Hands-On Learning" }
  ];

  return (
    <div className="bg-background min-h-screen">
      <SEO
        title="Training Programs"
        description="Comprehensive robotics and AI training programs for all ages at Robotrick. From beginner to professional level courses."
      />

      <LandingHeader />

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 md:pb-24 px-6 sm:px-8 lg:px-12 bg-gradient-to-br from-primary/5 via-white to-accent/5 overflow-hidden">
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border shadow-sm mb-6"
            >
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-text-primary tracking-wider uppercase">Professional Training</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-text-primary mb-6"
            >
              Transform Your Future with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Expert Training</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto mb-12"
            >
              Discover our comprehensive training programs in Robotics, AI, VR, 3D Printing, Drones, and Web Development. Designed for all skill levels, from beginners to professionals.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all">
                    <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                    <div className="text-3xl font-black text-text-primary mb-1">{stat.value}</div>
                    <div className="text-sm font-medium text-text-secondary">{stat.label}</div>
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* Background Decor */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </section>

        <WaveDivider variant="wave1" color="#ffffff" />

        {/* Programs Section */}
        <Programs />

        {/* CTA Section */}
        <section className="py-12 md:py-24 bg-gradient-to-r from-primary to-accent text-white">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join 2,200+ students who have transformed their future with Robotrick training programs.
            </p>
            <a
              href="/#contact"
              className="inline-block px-8 py-4 bg-white text-primary rounded-2xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105"
            >
              Enroll Now
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
