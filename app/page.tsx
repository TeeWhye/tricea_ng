import Hero from "@/components/Hero";
import BrandStory from "@/components/BrandStory";
import Collections from "@/components/Collections";
import TriceaEdit from "@/components/TriceaEdit";
import CampaignBanner from "@/components/CampaignBanner";
import Testimonials from "@/components/Testimonials";
import FinalCTA from "@/components/FinalCTA";

export default function Home() {
  return (
    <main>
      <Hero />
      <BrandStory />
      <Collections />
      <TriceaEdit />
      <CampaignBanner />
      <Testimonials />
      <FinalCTA />
    </main>
  );
}