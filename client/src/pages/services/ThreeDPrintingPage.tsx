import { SEO } from "../../components/seo/SEO";
import { LandingHeader } from "../../components/layout/LandingHeader";
import { Footer } from "../../components/layout/Footer";
import { WaveDivider } from "../../components/ui";
import { motion } from "framer-motion";
import { Printer, Layers, Sparkles, Clock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ThreeDPrintingPage() {
  const features = [
    {
      icon: Layers,
      title: "Multiple Materials",
      description: "PLA, ABS, PETG, TPU, and specialty filaments for diverse application needs."
    },
    {
      icon: Clock,
      title: "Fast Turnaround",
      description: "Quick production times from design to finished product, ensuring your deadlines are met."
    },
    {
      icon: CheckCircle2,
      title: "Design to Print",
      description: "Complete service from 3D modeling and design optimization to final printed parts."
    }
  ];

  const services = [
    {
      title: "Rapid Prototyping",
      description: "Transform your concepts into physical prototypes quickly for testing and validation.",
      icon: Sparkles
    },
    {
      title: "Custom Parts Production",
      description: "Manufacture custom replacement parts, tools, and components on demand.",
      icon: Layers
    },
    {
      title: "Educational Models",
      description: "Create detailed educational models for teaching, demonstrations, and exhibitions.",
      icon: CheckCircle2
    },
    {
      title: "Product Development",
      description: "Support your product development cycle with iterative design and testing.",
      icon: Printer
    }
  ];

  const materials = [
    { name: "PLA", use: "General purpose, eco-friendly" },
    { name: "ABS", use: "Durable, heat-resistant" },
    { name: "PETG", use: "Strong, flexible, weather-resistant" },
    { name: "TPU", use: "Flexible, rubber-like" }
  ];

  return (
    <div className="bg-background min-h-screen">
      <SEO
        title="3D Printing Services"
        description="Professional 3D printing and design services. From prototyping to production, we transform your digital designs into physical reality."
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
              <Printer className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-text-primary tracking-wider uppercase">Professional Printing</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-text-primary mb-6"
            >
              Transform Digital Designs <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Into Physical Reality</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto mb-12"
            >
              Professional 3D printing services for prototyping, production, and custom manufacturing. We handle everything from design optimization to final finishing.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
            >
              <div className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all">
                <div className="text-3xl font-black text-text-primary mb-1">4+</div>
                <div className="text-sm font-medium text-text-secondary">Material Types</div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all">
                <div className="text-3xl font-black text-text-primary mb-1">24-48h</div>
                <div className="text-sm font-medium text-text-secondary">Typical Turnaround</div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all col-span-2 md:col-span-1">
                <div className="text-3xl font-black text-text-primary mb-1">0.1mm</div>
                <div className="text-sm font-medium text-text-secondary">Layer Precision</div>
              </div>
            </motion.div>
          </div>

          {/* Background Decor */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </section>

        <WaveDivider variant="wave1" color="#ffffff" />

        {/* Features Section */}
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
                <span className="text-xs font-bold text-text-primary tracking-wider uppercase">Why Choose Us</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl font-black text-text-primary mb-6"
              >
                Our <span className="text-primary">Capabilities</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg text-text-secondary max-w-2xl mx-auto"
              >
                Advanced 3D printing technology combined with expert craftsmanship.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
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
                        {feature.title}
                      </h3>

                      {/* Description */}
                      <p className="text-text-secondary text-sm leading-relaxed">
                        {feature.description}
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

        {/* Services Grid Section */}
        <section className="relative py-12 md:py-24 bg-surface overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center mb-12 md:mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl sm:text-5xl font-black text-text-primary mb-6"
              >
                What We <span className="text-primary">Print</span>
              </motion.h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-12 md:mb-16">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-3xl p-8 border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
                  >
                    <Icon className="w-12 h-12 text-primary mb-4" />
                    <h3 className="text-xl font-bold text-text-primary mb-3">
                      {service.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Materials Grid */}
            <div className="text-center mb-8">
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl sm:text-3xl font-black text-text-primary mb-4"
              >
                Available <span className="text-primary">Materials</span>
              </motion.h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {materials.map((material, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-6 border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg text-center"
                >
                  <div className="text-2xl font-black text-primary mb-2">
                    {material.name}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {material.use}
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
              Ready to Bring Your Design to Life?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Contact us to discuss your 3D printing needs and get a quote for your project.
            </p>
            <a
              href="/#contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-2xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
