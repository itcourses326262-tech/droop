import Navbar from "@/components/droob/Navbar";
import ScrollProgress from "@/components/droob/ScrollProgress";
import Hero from "@/components/droob/Hero";
import Categories from "@/components/droob/Categories";
import HowItWorks from "@/components/droob/HowItWorks";
import FeaturedPros from "@/components/droob/FeaturedPros";
import Testimonials from "@/components/droob/Testimonials";
import RequestsFeed from "@/components/droob/RequestsFeed";
import CTA from "@/components/droob/CTA";
import Footer from "@/components/droob/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero heroImage="https://media.base44.com/images/public/6ab3fe7bd798cd1d9d8eca7c/8038fb2cb_generated_e094d350.jpg" />
        <Categories />
        <HowItWorks />
        <FeaturedPros />
        <RequestsFeed />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}