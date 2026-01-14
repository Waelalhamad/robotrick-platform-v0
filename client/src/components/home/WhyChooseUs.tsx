import { motion } from "framer-motion";
import { Award, Users, Zap, Target, Sparkles } from "lucide-react";
import { TechGrid, CircuitPattern } from "../ui";

export const WhyChooseUs = () => {
  const values = [
    {
      icon: Award,
      title: "Proven Excellence",
      description: "3 years of delivering quality results with national championship wins, 2,200+ trained students, and dozens of successful projects.",
      gradient: "from-primary to-accent"
    },
    {
      icon: Users,
      title: "Expert Team",
      description: "Our experienced trainers, engineers, and designers bring deep expertise across robotics, AI, programming, and 3D manufacturing.",
      gradient: "from-primary to-accent"
    },
    {
      icon: Zap,
      title: "Cutting-Edge Technology",
      description: "Access to the latest tools, platforms, and equipment — from advanced robotics kits to professional-grade 3D printers.",
      gradient: "from-primary to-accent"
    },
    {
      icon: Target,
      title: "Results-Driven Approach",
      description: "Whether you're learning, building a custom solution, or creating prototypes — we focus on delivering tangible outcomes.",
      gradient: "from-primary to-accent"
    }
  ];

  return (
    <section id="why-choose-us" className="relative py-12 md:py-24 bg-surface overflow-hidden">
      {/* Background Decor - Tech themed */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        {/* Tech grid background */}
        <TechGrid opacity={0.15} color="#0369a1" />

        {/* Circuit patterns in strategic positions */}
        <div className="absolute top-0 left-1/4 w-1/3 h-1/2">
          <CircuitPattern opacity={0.15} color="#0369a1" />
        </div>
        <div className="absolute bottom-0 right-1/4 w-1/3 h-1/2">
          <CircuitPattern opacity={0.15} color="#0369a1" />
        </div>

        {/* Gradient orbs with adjusted opacity */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary rounded-full blur-3xl opacity-[0.12]" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent rounded-full blur-3xl opacity-[0.10]" />
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
            <Sparkles className="w-4 h-4 text-primary fill-primary" />
            <span className="text-xs font-bold text-text-primary tracking-wider uppercase">Our Strengths</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black text-text-primary mb-6"
          >
            Why Choose <span className="text-primary">Robotrick</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-text-secondary max-w-2xl mx-auto"
          >
            We combine expertise, technology, and passion to deliver exceptional results across training, projects, and manufacturing.
          </motion.p>
        </div>

        {/* Value Propositions Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
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
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-text-primary mb-3 group-hover:text-primary transition-colors">
                    {value.title}
                  </h3>

                  {/* Description */}
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>

                {/* Corner Decoration */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${value.gradient} opacity-5 rounded-bl-full`} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
