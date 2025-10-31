import React from "react";

const Features = () => {
  const features = [
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      title: "Crecimiento estratégico",
      description:
        "Con el módulo de metas y KPIs, establece objetivos semanales y mensuales para toda tu organización. Monitorea el progreso con gráficos claros y toma decisiones basadas en datos.",
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      title: "Eficiencia en ventas",
      description:
        "Equipa a tu equipo con una herramienta robusta para tomar pedidos, gestionar cobranzas, adjuntar archivos y planificar rutas de visita de manera más efectiva.",
    },
    {
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
      title: "Operación completa",
      description:
        "Gestiona el despacho y la entrega de pedidos una vez facturados, garantizando un flujo de trabajo sin interrupciones desde el inicio hasta el fin.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Nuestra <span className="text-green_m">Propuesta de Valor</span>
          </h2>
          <p className="text-xl text-gray_m max-w-3xl mx-auto">
            Soluciones diseñadas para optimizar cada aspecto de tu fuerza de
            ventas
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-green_b p-8 rounded-xl hover:bg-white hover:text-gray_m transition-all duration-300 border border-gray_xxl hover:border-green_m/30 hover:shadow-lg"
            >
              <div className="bg-green_m text-white group-hover:bg-green_l w-14 h-14 rounded-full flex items-center justify-center mb-6 transition-all duration-300">
                <div className="text-white transition-all duration-300">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white group-hover:text-green_m transition-all duration-300">
                {feature.title}
              </h3>
              <p className="text-gray_xl ">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
