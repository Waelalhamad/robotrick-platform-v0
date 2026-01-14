import { SEO } from "../../components/seo/SEO";
import { LandingHeader } from "../../components/layout/LandingHeader";
import { Footer } from "../../components/layout/Footer";
import { WaveDivider } from "../../components/ui";
import { motion } from "framer-motion";
import { Wrench, Cpu, Zap, Shield, ArrowRight, Sparkles } from "lucide-react";

export default function TechnicalProjectsPage() {
  const capabilities = [
    {
      icon: Cpu,
      title: "Custom Robotics",
      description: "Tailored robotic solutions designed to meet your specific automation needs and business requirements."
    },
    {
      icon: Zap,
      title: "Automation Systems",
      description: "Intelligent automation systems that streamline operations and increase productivity across industries."
    },
    {
      icon: Shield,
      title: "IoT Solutions",
      description: "Connected devices and smart systems that bring the power of Internet of Things to your projects."
    }
  ];

  const projects = [
    {
      title: "Industrial Automation",
      description: "Advanced manufacturing automation systems with real-time monitoring and control.",
      image: "/images/projects/automation.jpg"
    },
    {
      title: "Smart Agriculture",
      description: "IoT-powered agricultural solutions for precision farming and resource optimization.",
      image: "/images/projects/agriculture.jpg"
    },
    {
      title: "Educational Robotics",
      description: "Interactive robotic systems designed for hands-on STEM education and research.",
      image: "/images/projects/education.jpg"
    }
  ];

  return (
    <div className="bg-background min-h-screen">
      <SEO
        title="Technical Projects"
        description="Custom robotics and automation solutions for businesses. Transform your ideas into reality with cutting-edge technology from Robotrick."
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
              <Wrench className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-text-primary tracking-wider uppercase">Custom Solutions</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-text-primary mb-6"
            >
              Bring Your Technical <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Ideas to Life</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto mb-12"
            >
              We design and build custom robotics, automation systems, and IoT solutions tailored to your unique challenges. From concept to deployment, we turn innovative ideas into working reality.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a
                href="/#contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105"
              >
                Start Your Project
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="/#gallery"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-border text-text-primary rounded-2xl font-bold text-lg hover:border-primary transition-all hover:scale-105"
              >
                View Our Work
              </a>
            </motion.div>
          </div>

          {/* Background Decor */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </section>

        <WaveDivider variant="wave1" color="#ffffff" />

        {/* Capabilities Section */}
        <section className="relative py-12 md:py-24 bg-white overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center mb-12 md:mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border shadow-sm mb-6"
              >
                <Sparkles className="w-4 h-4 text-primary fill-primary" />
                <span className="text-xs font-bold text-text-primary tracking-wider uppercase">Our Expertise</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl font-black text-text-primary mb-6"
              >
                What We <span className="text-primary">Deliver</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg text-text-secondary max-w-2xl mx-auto"
              >
                Professional technical solutions powered by robotics, automation, and IoT technologies.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {capabilities.map((capability, index) => {
                const Icon = capability.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative bg-white rounded-3xl p-8 border-2 border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden"
                  >
                    {/* Background Gradient on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon */}
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-text-primary mb-3 group-hover:text-primary transition-colors">
                        {capability.title}
                      </h3>

                      {/* Description */}
                      <p className="text-text-secondary text-sm leading-relaxed">
                        {capability.description}
                      </p>
                    </div>

                    {/* Corner Decoration */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary to-accent opacity-5 rounded-bl-full" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <WaveDivider variant="wave2" flip={true} color="#f9fafb" />

        {/* Example Projects Section */}
        <section className="relative py-12 md:py-24 bg-surface overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center mb-12 md:mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl sm:text-5xl font-black text-text-primary mb-6"
              >
                Project <span className="text-primary">Examples</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-text-secondary max-w-2xl mx-auto"
              >
                See how we've helped businesses transform their operations with custom technical solutions.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {projects.map((project, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-white rounded-3xl overflow-hidden border-2 border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                >
                  {/* Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <Wrench className="w-16 h-16 text-primary/40" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-24 bg-gradient-to-r from-primary to-accent text-white">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Ready to Start Your Project?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Let's discuss your technical challenges and build a custom solution together.
            </p>
            <a
              href="/#contact"
              className="inline-block px-8 py-4 bg-white text-primary rounded-2xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105"
            >
              Get In Touch
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
