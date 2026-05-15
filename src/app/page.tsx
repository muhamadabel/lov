import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { PlaylistSection } from "@/components/PlaylistSection";
import { LoginSection } from "@/components/LoginSection";

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      {/* Content wrapper with gradient background that covers the footer */}
      <div 
        className="relative z-10 w-full pb-24 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
        style={{
          background: "linear-gradient(to bottom, #9b1307 0%, #2a0301 45%, #170100 100%)",
          marginBottom: "100vh" // Leaves a hole at the bottom exactly the size of the viewport
        }}
      >
        <HeroSection />
        <AboutSection />
        <PlaylistSection />
      </div>

      <LoginSection />
    </main>
  );
}
