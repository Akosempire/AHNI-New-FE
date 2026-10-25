import type { Metadata } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "./public.css";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import CookieBanner from "@/components/public/CookieBanner";
import { RevealRoot } from "@/components/public/ui";

export const metadata: Metadata = {
  title: {
    default: "AHNi – Achieving Health Nigeria Initiative",
    template: "%s · AHNi",
  },
  description:
    "Achieving Health Nigeria Initiative (AHNi) provides health technical assistance to Nigeria's public health sector through inclusive, community-led programming. Explore jobs, consultancies and procurement opportunities.",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ahni-public min-h-screen">
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <CookieBanner />
      <RevealRoot />
    </div>
  );
}
