import { HeroSection } from "@/components/home/hero-section";
import { FeatureSection } from "@/components/home/feature-section";
import { QuickUploadSection } from "@/components/home/quick-upload-section";
import { StatisticsSection } from "@/components/home/statistics-section";
import { CallToActionSection } from "@/components/home/call-to-action-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeatureSection />
      <QuickUploadSection />
      <StatisticsSection />
      <CallToActionSection />
    </>
  );
}
