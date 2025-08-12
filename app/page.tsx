"use client";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Features from "@/components/landing/Features";
import About from "@/components/landing/About";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import Integration from "@/components/landing/Integration";
import Testimonials from "@/components/landing/Testimonials";
import { MessageCircle } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Home() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-in-out",
      offset: 100,
    });

    return () => {
      AOS.refresh();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-center px-8 py-4">
          <h1 className="text-2xl font-bold text-green_b">Negobi</h1>
          <div className="flex gap-4">
            <Button asChild>
              <a href="/login">Iniciar sesión</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/register">Registrarse</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Hero />

        <div data-aos="fade-up">
          <Features />
        </div>

        <div data-aos="fade-up" data-aos-delay="100">
          <Integration />
        </div>

        <div data-aos="fade-up" data-aos-delay="200">
          <Testimonials />
        </div>

        <div data-aos="fade-up" data-aos-delay="300">
          <About />
        </div>

        <div data-aos="zoom-in">
          <CTA />
        </div>
      </main>

      <Footer />

      <a
        href="https://wa.me/584242346947"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green_m rounded-full flex items-center justify-center shadow-md shadow-green_l hover:shadow-lg transition-all duration-300 hover:scale-110 group"
        aria-label="Contactar por WhatsApp"
        data-aos="fade-left"
        data-aos-delay="500"
        data-aos-anchor-placement="center-bottom"
      >
        <MessageCircle className="w-7 h-7 text-white group-hover:animate-pulse" />
      </a>
    </div>
  );
}
