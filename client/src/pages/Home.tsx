import { Footer } from "../components/layout/Footer";
import { LandingHeader } from "../components/layout/LandingHeader";
import { SEO } from "../components/seo/SEO";
import { Hero } from "../components/home/Hero";
import { SocialProof } from "../components/home/SocialProof";
import { About } from "../components/home/About";
import { Services } from "../components/home/Services";
import { WhyChooseUs } from "../components/home/WhyChooseUs";
import { Gallery } from "../components/home/Gallery";
import { FAQ } from "../components/home/FAQ";
import { Contact } from "../components/home/Contact";
import { WaveDivider } from "../components/ui";
import { MessageCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-background min-h-screen relative overflow-x-hidden">
      <SEO
        title="Home"
        description="Robotrick is Syria's premier robotics and technology hub. We offer professional training programs, custom technical projects, and 3D printing services in Aleppo."
      />

      <LandingHeader />

      <main>
        <Hero />
        <WaveDivider variant="wave1" color="#f9fafb" />

        <SocialProof />
        <WaveDivider variant="wave2" flip={true} color="#ffffff" />

        <About />
        <WaveDivider variant="wave3" color="#f9fafb" />

        {/* <Achievements /> */}

        <Services />
        <WaveDivider variant="wave2" flip={true} color="#ffffff" />

        <WhyChooseUs />
        <WaveDivider variant="wave1" flip={true} color="#ffffff" />

        <Gallery />
        <WaveDivider variant="wave3" flip={true} color="#ffffff" />

        <FAQ />
        <WaveDivider variant="wave1" color="#f9fafb" />

        <Contact />
      </main>

      <Footer />

      {/* WhatsApp Floating Button - Sticky & Always Visible */}
      <a
        href="https://wa.me/+963942060440"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-2xl flex items-center justify-center z-50 transition-all hover:scale-110 group"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
      </a>
    </div>
  );
}
