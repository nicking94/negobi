import React from "react";

const About = () => {
  return (
    <section className="py-20 px-4 bg-green_xxl">
      <div className="max-w-6xl mx-auto">
        <div className="lg:flex items-center gap-16">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <h2 className="text-3xl font-bold mb-6 text-black">
              Quiénes Somos
            </h2>
            <p className="text-gray_b font-medium mb-6">
              Negobi nació para resolver los desafíos de la fuerza de ventas en
              campo y ha evolucionado para ofrecer una solución completa y
              robusta. Nuestro compromiso es brindarte una plataforma que no
              solo mejore la productividad, sino que también te dé el control
              total de tu operación.
            </p>
            <p className="text-gray_b font-medium">
              Integramos desde la planificación de rutas y la toma de pedidos
              hasta la gestión estratégica de metas y el seguimiento del
              despacho y la entrega, para que tengas una visión 360 de tu
              negocio.
            </p>
          </div>
          <div className="lg:w-1/2 bg-white p-8 rounded-lg shadow-sm">
            <h3 className="text-2xl font-bold mb-6 text-black">
              Para quién va dirigido
            </h3>

            <div className="space-y-6">
              <div className="flex items-center">
                <div className="bg-green_b p-3 rounded-full mr-4">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 12h14M12 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-black mb-1">
                    Líderes de negocio
                  </h4>
                  <p className="text-gray_b">
                    Que necesitan definir y monitorear metas de ventas, obtener
                    visibilidad de su equipo y controlar la operación logística.
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="bg-green_b p-3 rounded-full mr-4">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 12h14M12 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-black mb-1">
                    Supervisores y gerentes
                  </h4>
                  <p className="text-gray_b">
                    Que quieren optimizar rutas, asignar objetivos a sus equipos
                    y hacer un seguimiento detallado del rendimiento.
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="bg-green_b p-3 rounded-full mr-4">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 12h14M12 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-black mb-1">
                    Vendedores y logística
                  </h4>
                  <p className="text-gray_b">
                    Que necesitan una aplicación confiable y fácil de usar para
                    agilizar su trabajo diario, desde la toma de pedidos hasta
                    la coordinación de la entrega.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
