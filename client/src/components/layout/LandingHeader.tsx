import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../providers/AuthProvider";
import { ROUTES } from "../../shared/constants/routes.constants";
import { ArrowRight, Menu, X, Instagram, ChevronDown, GraduationCap, Wrench, Printer } from "lucide-react";

interface LandingHeaderProps {
  className?: string;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  className = "",
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);

  // Handle scroll effect for header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Active Section Detection using IntersectionObserver
  // This is the most robust solution for handling animations, variable heights, and complex layouts.
  // It avoids the performance cost of scroll listeners and the complexity of manual offset calculations.
  useEffect(() => {
    const sections = ["home", "about", "services", "why-choose-us", "gallery", "faq", "contact"];

    const observerOptions = {
      root: null, // viewport
      // -30% from the top: This pushes the "start" of the detection zone down, so header/top content doesn't trigger it too early.
      // -60% from the bottom: This pushes the "end" of the detection zone up, creating a focused strip in the upper-middle of the screen.
      // This effectively means a section is "active" when it occupies that specific middle-upper strip of the viewport.
      rootMargin: "-30% 0px -60% 0px", 
      threshold: 0 // Trigger as soon as even 1 pixel enters this zone
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  // Handle hash navigation when page loads or location changes
  useEffect(() => {
    const hash = window.location.hash.substring(1); // Remove the '#'
    if (hash && location.pathname === ROUTES.HOME) {
      // Small delay to ensure the page has loaded
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, [location]);

  // Close mobile menu when clicking outside or on navigation links
  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    // Check if we're on the home page
    const isHomePage = location.pathname === ROUTES.HOME || location.pathname === '/';

    if (!isHomePage) {
      // Navigate to home page with hash
      navigate(`/#${sectionId}`);
      setIsMobileMenuOpen(false);
      return;
    }

    // We're on home page, scroll to section
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    setIsMobileMenuOpen(false);
  };

  const servicesDropdownItems = [
    {
      path: "/services/training",
      label: "Training Programs",
      icon: GraduationCap,
      description: "Learn robotics, AI, and cutting-edge tech",
      color: "from-blue-500 to-cyan-500"
    },
    {
      path: "/services/technical-projects",
      label: "Technical Projects",
      icon: Wrench,
      description: "Custom robotics and automation solutions",
      color: "from-primary to-accent"
    },
    {
      path: "/services/3d-printing",
      label: "3D Printing",
      icon: Printer,
      description: "Professional printing from design to production",
      color: "from-purple-500 to-pink-500"
    },
  ];

  const navigationItems = [
    { href: "about", label: "About" },
    { href: "services", label: "Services", hasDropdown: true },
    { href: "why-choose-us", label: "Why Us" },
    { href: "gallery", label: "Gallery" },
    { href: "faq", label: "FAQ" },
    { href: "contact", label: "Contact" },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <motion.button
            onClick={() => {
              const isHomePage = location.pathname === ROUTES.HOME || location.pathname === '/';
              if (isHomePage) {
                scrollToSection("home");
              } else {
                navigate(ROUTES.HOME);
              }
            }}
            className="group relative flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img
              src="/logo.png"
              alt="Robotrick Logo"
              className="h-16 sm:h-20 w-auto object-contain transition-all duration-300"
            />
          </motion.button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:block">
            <ul className="flex items-center gap-1">
                {navigationItems.map((item) => (
                  <li
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => item.hasDropdown && setIsServicesDropdownOpen(true)}
                    onMouseLeave={() => item.hasDropdown && setIsServicesDropdownOpen(false)}
                  >
                    <button
                      onClick={() => scrollToSection(item.href)}
                      className={`relative px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-lg group ${
                        activeSection === item.href
                          ? "text-primary bg-primary/5"
                          : "text-text-secondary hover:text-primary hover:bg-primary/5"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {item.label}
                        {item.hasDropdown && (
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isServicesDropdownOpen ? 'rotate-180' : ''}`} />
                        )}
                      </span>

                      {/* Active indicator */}
                      {activeSection === item.href && (
                        <motion.div
                          layoutId="activeSection"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </button>

                    {/* Services Dropdown - Minimal & Transparent */}
                    {item.hasDropdown && (
                      <AnimatePresence>
                        {isServicesDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute top-full left-0 mt-2 w-56 bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-border/30 overflow-hidden z-50"
                          >
                            {/* Dropdown Items - Compact */}
                            <div className="py-1">
                              {servicesDropdownItems.map((service, index) => {
                                const Icon = service.icon;
                                return (
                                  <motion.button
                                    key={service.path}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.03 }}
                                    onClick={() => {
                                      navigate(service.path);
                                      setIsServicesDropdownOpen(false);
                                    }}
                                    className="w-full px-3 py-2.5 text-left hover:bg-primary/10 transition-all duration-200 flex items-center gap-3 group"
                                  >
                                    {/* Icon Container - Small */}
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-200">
                                      <Icon className="w-4 h-4 text-primary" />
                                    </div>

                                    {/* Text Content - Compact */}
                                    <span className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                                      {service.label}
                                    </span>
                                  </motion.button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Desktop CTA Button */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Instagram Follow Button */}
              <motion.a
                href="https://www.instagram.com/robo_trick01/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 flex items-center gap-2 cursor-pointer"
              >
                <Instagram className="w-4 h-4" />
                Follow Us
              </motion.a>

              {isAuthenticated && (
                <Link to={ROUTES.DASHBOARD}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-2.5 bg-white text-primary border-2 border-primary rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-all duration-300 flex items-center gap-2"
                  >
                    Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-text-primary hover:bg-secondary/50 rounded-lg transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden overflow-hidden bg-white border-t border-border"
              >
                <div className="py-4 space-y-2 px-2">
                  {navigationItems.map((item) => (
                    <div key={item.href}>
                      <button
                        onClick={() => {
                          if (item.hasDropdown) {
                            setIsServicesDropdownOpen(!isServicesDropdownOpen);
                          } else {
                            scrollToSection(item.href);
                          }
                        }}
                        className={`flex items-center justify-between w-full text-left font-semibold px-4 py-3 rounded-lg transition-all ${
                          activeSection === item.href
                            ? "text-primary bg-primary/5 border-l-4 border-primary"
                            : "text-text-secondary hover:text-primary hover:bg-primary/5"
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.hasDropdown && (
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isServicesDropdownOpen ? 'rotate-180' : ''}`} />
                        )}
                      </button>

                      {/* Mobile Services Dropdown */}
                      {item.hasDropdown && isServicesDropdownOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-2 ml-4 space-y-1 overflow-hidden"
                        >
                          {servicesDropdownItems.map((service) => {
                            const Icon = service.icon;
                            return (
                              <button
                                key={service.path}
                                onClick={() => {
                                  navigate(service.path);
                                  setIsMobileMenuOpen(false);
                                  setIsServicesDropdownOpen(false);
                                }}
                                className="flex items-center gap-3 w-full px-4 py-3 text-left rounded-lg hover:bg-primary/5 transition-colors group"
                              >
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${service.color} bg-opacity-10 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                                  <Icon className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                                    {service.label}
                                  </div>
                                  <div className="text-xs text-text-secondary">
                                    {service.description}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </div>
                  ))}

                <div className="pt-4 px-2 pb-2 space-y-3">
                  {/* Instagram Follow Button */}
                  <a
                    href="https://www.instagram.com/robo_trick01/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleMobileNavClick}
                  >
                    <button className="w-full px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-md hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                      <Instagram className="w-5 h-5" />
                      Follow Us on Instagram
                    </button>
                  </a>

                  {isAuthenticated && (
                    <Link to={ROUTES.DASHBOARD} onClick={handleMobileNavClick}>
                      <button className="w-full px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-md flex items-center justify-center gap-2">
                        Dashboard
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};
