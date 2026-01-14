import { SEO } from "../components/seo/SEO";
import { LandingHeader } from "../components/layout/LandingHeader";
import { Footer } from "../components/layout/Footer";
import { motion } from "framer-motion";
import { useState } from "react";
import { Sparkles } from "lucide-react";

type Category = "All" | "Training" | "Projects" | "3D Printing" | "Competitions";

interface GalleryItem {
  id: number;
  image: string;
  title: string;
  category: Category;
}

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const categories: Category[] = ["All", "Training", "Projects", "3D Printing", "Competitions"];

  const galleryItems: GalleryItem[] = [
    { id: 1, image: "/images/image-1.jpg", title: "Student Workshop Session", category: "Training" },
    { id: 2, image: "/images/image-2.jpg", title: "Robotrick Team Photo", category: "Training" },
    { id: 3, image: "/images/image-3.jpg", title: "Lab Session - Learning Robotics", category: "Training" },
    { id: 4, image: "/images/image-4.jpg", title: "Robotics Competition", category: "Competitions" },
    { id: 5, image: "/images/image-5.jpg", title: "Awards and Achievements", category: "Competitions" },
    { id: 6, image: "/images/image-6.jpg", title: "Competition Day", category: "Competitions" },
    { id: 7, image: "/images/image-7.jpg", title: "Students Building Robots", category: "Training" },
    { id: 8, image: "/images/image-8.jpg", title: "Robotics Workshop", category: "Training" },
    // Add more items as needed
  ];

  const filteredItems = activeCategory === "All"
    ? galleryItems
    : galleryItems.filter(item => item.category === activeCategory);

  return (
    <div className="bg-background min-h-screen">
      <SEO
        title="Gallery"
        description="Explore our work at Robotrick - from training sessions and competitions to custom projects and 3D printing creations."
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
              <Sparkles className="w-4 h-4 text-primary fill-primary" />
              <span className="text-xs font-bold text-text-primary tracking-wider uppercase">Our Work</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-text-primary mb-6"
            >
              Explore Our <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Gallery</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto"
            >
              A visual journey through our training sessions, competitions, technical projects, and innovations.
            </motion.p>
          </div>

          {/* Background Decor */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </section>

        {/* Gallery Section */}
        <section className="relative py-12 md:py-24 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                    activeCategory === category
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "bg-white border border-border text-text-primary hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Gallery Grid */}
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="group relative aspect-[4/3] rounded-3xl overflow-hidden bg-gray-200 cursor-pointer"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-white font-bold text-lg mb-1">{item.title}</p>
                      <p className="text-white/80 text-sm">{item.category}</p>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-bold text-primary">
                    {item.category}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Empty State */}
            {filteredItems.length === 0 && (
              <div className="text-center py-20">
                <p className="text-text-secondary text-lg">No items found in this category.</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-24 bg-gradient-to-r from-primary to-accent text-white">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Want to Be Featured?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join our training programs or work with us on your next project.
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
