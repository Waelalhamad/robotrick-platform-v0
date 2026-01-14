import { motion } from "framer-motion";
import { GraduationCap, Wrench, Printer, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HexagonGrid, CircuitPattern } from "../ui";

export const Services = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: GraduationCap,
      title: "Training Programs",
      description: "Comprehensive robotics and AI training for all ages. From beginner to professional level courses in Robotics, AI, VR, Drones, and Web Development.",
      path: "/services/training",
      features: ["6+ Program Tracks", "2200+ Students Trained", "Certified Courses"]
    },
    {
      icon: Wrench,
      title: "Technical Projects",
      description: "Custom robotics and automation solutions for businesses and individuals. We bring your technical ideas to life with cutting-edge technology.",
      path: "/services/technical-projects",
      features: ["Custom Robotics", "Automation Systems", "IoT Solutions"]
    },
    {
      icon: Printer,
      title: "3D Printing Services",
      description: "Professional 3D printing and design services. From prototyping to production, we transform your digital designs into physical reality.",
      path: "/services/3d-printing",
      features: ["Design to Print", "Multiple Materials", "Fast Turnaround"]
    }
  ];

  return (
    <section id="services" className="relative py-12 md:py-24 bg-white overflow-hidden">
      {/* Background Decor - Tech themed */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Hexagon grid pattern - robotics industry standard */}
        <HexagonGrid opacity={0.15} color="#2563eb" size={70} />

        {/* Circuit pattern in corners */}
        <div className="absolute top-0 left-0 w-1/3 h-1/3">
          <CircuitPattern opacity={0.15} color="#0369a1" />
        </div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3">
          <CircuitPattern opacity={0.15} color="#0369a1" />
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border shadow-sm mb-6"
          >
            <Sparkles className="w-4 h-4 text-accent fill-accent" />
            <span className="text-xs font-bold text-text-primary tracking-wider uppercase">What We Offer</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black text-text-primary mb-6"
          >
            Our <span className="text-primary">Services</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-text-secondary max-w-2xl mx-auto"
          >
            From education to innovation - discover how we can help you achieve your goals in robotics and technology.
          </motion.p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(service.path)}
                className="group relative bg-white rounded-3xl p-8 border-2 border-border hover:border-primary/50 transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-2xl overflow-hidden"
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
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-text-secondary text-sm leading-relaxed mb-6">
                    {service.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm font-medium text-text-primary">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <div className="flex items-center gap-2 text-primary font-bold group-hover:gap-3 transition-all">
                    <span>Learn More</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Corner Decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary to-accent opacity-5 rounded-bl-full" />
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 md:mt-16 text-center"
        >
          <p className="text-text-secondary mb-4">Have a unique project in mind?</p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105"
          >
            Get in Touch
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};
