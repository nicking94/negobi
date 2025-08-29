import React from "react";

const Testimonials = () => {
  const testimonials = [
    {
      quote:
        "Negobi ha transformado nuestra operación de ventas. Ahora tenemos visibilidad completa y nuestros vendedores son 40% más productivos.",
      name: "Carlos Rodríguez",
      title: "Director Comercial, Distribuidora Andina",
      avatar: "/avatar1.jpg",
    },
    {
      quote:
        "La implementación fue sencilla y el ROI fue evidente desde el primer mes. Lo mejor es el soporte 24/7 que brinda el equipo de Negobi.",
      name: "María Fernández",
      title: "Gerente de Ventas, Alimentos Premium",
      avatar: "/avatar2.jpg",
    },
    {
      quote:
        "Como supervisor, ahora puedo optimizar rutas y asignar objetivos con datos reales. La aplicación móvil es muy intuitiva para mi equipo.",
      name: "Jorge Martínez",
      title: "Supervisor Regional, Bebidas Nacionales",
      avatar: "/avatar3.jpg",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray_b mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-xl text-gray_m max-w-3xl mx-auto">
            Empresas líderes confían en Negobi para potenciar su fuerza de
            ventas
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray_xxl p-8 rounded-xl border border-gray_xxl"
            >
              <div className="flex items-center mb-6">
                <div>
                  <h4 className="font-semibold text-gray_b">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray_m">{testimonial.title}</p>
                </div>
              </div>
              <p className="text-gray_b italic">{testimonial.quote}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
