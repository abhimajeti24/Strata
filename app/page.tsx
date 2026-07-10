import { Preloader } from "@/components/layout/Preloader";
import { Nav } from "@/components/layout/Nav";
import { MonolithScene } from "@/components/canvas/MonolithScene";
import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { Works } from "@/components/sections/Works";
import { FeaturedProject } from "@/components/sections/FeaturedProject";
import { Numbers } from "@/components/sections/Numbers";
import { Marquee } from "@/components/sections/Marquee";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Preloader />
      <Nav />
      <MonolithScene />
      <main>
        <Hero />
        <Manifesto />
        <Works />
        <FeaturedProject />
        <Numbers />
        <Marquee />
        <Contact />
      </main>
    </>
  );
}
