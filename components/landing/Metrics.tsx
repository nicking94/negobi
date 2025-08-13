"use client";
import React, { useState, useEffect } from "react";

const Metrics = () => {
  const metricsData = [
    {
      target: 85,
      prefix: "+",
      suffix: "%",
      label: "Aumento en productividad",
      color: "green_m",
    },
    {
      target: 60,
      prefix: "+",
      suffix: "%",
      label: "Reducción de errores",
      color: "green_m",
    },
    {
      target: 3.5,
      prefix: "",
      suffix: "x",
      label: "Retorno de inversión",
      color: "green_m",
    },
    {
      target: 24,
      prefix: "",
      suffix: "/7",
      label: "Soporte especializado",
      color: "green_m",
    },
  ];

  const [counters, setCounters] = useState(metricsData.map(() => 0));

  useEffect(() => {
    const duration = 2000;
    const steps = 50;
    const incrementTimes = duration / steps;

    metricsData.forEach((metric, index) => {
      const increment = metric.target / steps;
      let currentCount = 0;
      let step = 0;

      const counterInterval = setInterval(() => {
        currentCount += increment;
        step++;

        setCounters((prev) => {
          const newCounters = [...prev];
          newCounters[index] = step >= steps ? metric.target : currentCount;
          return newCounters;
        });

        if (step >= steps) {
          clearInterval(counterInterval);
        }
      }, incrementTimes);
    });
  }, []);

  return (
    <section className="py-18">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-4 gap-6">
          {metricsData.map((metric, index) => (
            <div
              key={index}
              className="p-8 rounded-xl bg-gradient-to-b from-white to-gray_xxl border border-gray_xxl shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div
                className="text-5xl font-bold mb-4"
                style={{ color: `var(--color-${metric.color})` }}
              >
                {metric.prefix}
                {metric.suffix === "x" || metric.suffix === "/7"
                  ? counters[index].toFixed(metric.suffix === "x" ? 1 : 0)
                  : Math.round(counters[index])}
                {metric.suffix}
              </div>
              <p className="text-gray_b text-center lg:text-start text-lg">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Metrics;
