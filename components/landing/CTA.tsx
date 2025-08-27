import React from "react";
import { Button } from "../ui/button";

const CTA = () => {
  return (
    <section className="relative py-20 px-4 bg-gradient-to-r from-green_m to-green_b text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-green_m/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-green_b/30 to-transparent"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-white/10"></div>
        <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-white/10"></div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-3xl lg:text-4xl font-bold mb-6">
          ¿Listo para transformar tu fuerza de ventas?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Descubre cómo Negobi puede impulsar tu operación comercial.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            variant="default"
            className="bg-white text-green_b hover:bg-gray_xxl hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <a
              href={"https://wa.me/584242346947"}
              rel="noopener noreferrer"
              target="_blank"
            >
              Solicitar una demostración
            </a>
          </Button>
          <Button
            variant={"default"}
            className="bg-white hover:bg-white  text-green_b transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <a
              href={
                "https://negobi.nyc3.digitaloceanspaces.com/negobi-sync/latest/Nesync-1.6.4-setup.exe"
              }
              rel="noopener noreferrer"
            >
              Descargar Sincronizador
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
