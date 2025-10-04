import React from "react";

const Integration = () => {
  return (
    <section className="py-20 bg-green_xxl">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray_b mb-4">
            Integraciones sin esfuerzo
          </h2>
          <p className="text-xl text-gray_m max-w-3xl mx-auto">
            Negobi se conecta con las herramientas que ya usas para un flujo de
            trabajo perfecto
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray_xxl">
            <div className="bg-green_b w-16 h-16 rounded-lg flex items-center justify-center mb-6 mx-auto">
              <svg
                className="w-8 h-8 text-green_m"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-center mb-3">
              ERP y Contabilidad
            </h3>
            <p className="text-gray_m text-center">
              Conexión con SAP, Oracle, Microsoft Dynamics y otros sistemas ERP
              principales
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray_xxl">
            <div className="bg-green_b w-16 h-16 rounded-lg flex items-center justify-center mb-6 mx-auto">
              <svg
                className="w-8 h-8 text-green_m"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-center mb-3">
              Facturación Electrónica
            </h3>
            <p className="text-gray_m text-center">
              Integración con sistemas de facturación electrónica según
              normativas locales
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray_xxl">
            <div className="bg-green_b w-16 h-16 rounded-lg flex items-center justify-center mb-6 mx-auto">
              <svg
                className="w-8 h-8 text-green_m"
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
            </div>
            <h3 className="text-xl font-semibold text-center mb-3">CRM</h3>
            <p className="text-gray_m text-center">
              Sincronización con Salesforce, HubSpot y otras plataformas CRM
              populares
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Integration;
