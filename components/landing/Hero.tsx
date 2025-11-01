import Image from "next/image";
import { Button } from "../ui/button";
import playIcon from "@/public/images/google-play-store.png";
import Metrics from "./Metrics";

import mockupLogo from "@/public/images/mockup.png";
const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-green_m to-green_b text-white py-28 px-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-green_m/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white/10 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 mb-12 lg:mb-0">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Transforma tu fuerza de ventas con{" "}
              <span className="text-green_l">tecnología inteligente</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 opacity-90">
              Negobi digitaliza, controla y potencia todo tu proceso comercial,
              desde la toma de pedidos hasta la entrega final.
            </p>
            <div className="flex flex-col-reverse lg:flex-row gap-4">
              <Button variant="outline" asChild>
                <a
                  href="https://negobi.nyc3.digitaloceanspaces.com/negobi-sync/latest/Nesync-1.6.4-setup.exe"
                  rel="noopener noreferrer"
                  className="text-black backdrop-blur-md border-green_m"
                >
                  Descargar Sync
                </a>
              </Button>

              <a
                href="https://negobi.nyc3.digitaloceanspaces.com/negobi-app/production/negobi-1.0.47.apk"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer inline-block transition-all duration-300 hover:scale-105 relative"
              >
                <Image
                  src={playIcon}
                  alt="Descargar App Negobi"
                  width={120}
                  height={120}
                  className="mr-2 pointer-events-none"
                  priority
                />
              </a>
            </div>
          </div>
          <div className="hidden lg:block w-1/2">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 border border-white/10 shadow-2xl">
              <Image
                src={mockupLogo}
                alt="Negobi"
                width={600}
                height={500}
                className="rounded"
              />
            </div>
          </div>
        </div>
      </div>
      <Metrics />
    </section>
  );
};
export default Hero;
