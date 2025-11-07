"use client";

import { useState, useEffect } from "react";
import { useSidebar } from "@/context/SidebarContext";
import { useUserCompany } from "@/hooks/auth/useUserCompany";
import { useCompanyConfig } from "@/hooks/companyConfig/useCompanyConfig";
import DashboardHeader from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/SideBar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast, Toaster } from "sonner";

const DAYS_LABELS = [
  { id: 0, label: "Domingo", key: "sunday" },
  { id: 1, label: "Lunes", key: "monday" },
  { id: 2, label: "Martes", key: "tuesday" },
  { id: 3, label: "Miércoles", key: "wednesday" },
  { id: 4, label: "Jueves", key: "thursday" },
  { id: 5, label: "Viernes", key: "friday" },
  { id: 6, label: "Sábado", key: "saturday" },
];

const SettingsPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { companyId } = useUserCompany();
  const { config, loading, error, updateConfig, createConfig } =
    useCompanyConfig(companyId);

  const [settings, setSettings] = useState({
    showAvailableStock: true,
    defaultPrice: "regular",
    syncWithApp: false,
    unableToDebtClient: true,
    workDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
    connectWithVirtualStore: false,
    enableDataReplication: true,
  });

  useEffect(() => {
    if (config) {
      setSettings({
        showAvailableStock: config.show_available_stock,
        defaultPrice: config.price_by_default,
        syncWithApp: config.sync_with_app,
        unableToDebtClient: config.unable_to_debt_client,
        workDays: config.work_days,
        connectWithVirtualStore: config.connect_with_virtual_store,
        enableDataReplication: config.enable_data_replication,
      });
    }
  }, [config]);

  const handleSwitchChange = (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleWorkdayToggle = (dayKey: string) => {
    setSettings((prev) => ({
      ...prev,
      workDays: {
        ...prev.workDays,
        [dayKey]: !prev.workDays[dayKey as keyof typeof prev.workDays],
      },
    }));
  };

  const handleSaveSettings = async () => {
    if (!companyId) {
      toast.error("No se pudo identificar la empresa");
      return;
    }

    try {
      const updateData = {
        companyId,
        show_available_stock: settings.showAvailableStock,
        price_by_default: settings.defaultPrice,
        sync_with_app: settings.syncWithApp,
        work_days: settings.workDays,
        unable_to_debt_client: settings.unableToDebtClient,
        connect_with_virtual_store: settings.connectWithVirtualStore,
        enable_data_replication: settings.enableDataReplication,
      };

      let result;
      if (config) {
        result = await updateConfig(updateData);
      } else {
        result = await createConfig(updateData);
      }

      if (result) {
        toast.success("Configuraciones guardadas exitosamente");
      } else {
        toast.error("Error al guardar las configuraciones");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Error al guardar las configuraciones");
    }
  };

  if (loading && !config) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray_xxl/20 to-green_xxl/20 overflow-hidden relative">
        <Sidebar />
        <div className="flex flex-col flex-1 w-full">
          <DashboardHeader
            onToggleSidebar={toggleSidebar}
            isSidebarOpen={sidebarOpen}
          />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">Cargando configuración...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray_xxl/20 to-green_xxl/20 overflow-hidden relative">
      <Toaster richColors position="top-right" />
      <Sidebar />

      <div className="flex flex-col flex-1 w-full transition-all duration-300">
        <DashboardHeader
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={sidebarOpen}
        />

        <main className="bg-gradient-to-br from-gray_xxl to-gray_l/20 flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 max-w-full overflow-hidden">
            <h1 className="text-xl md:text-2xl font-semibold text-gray_b">
              Configuraciones generales
            </h1>
            <Button onClick={handleSaveSettings} disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="grid gap-8">
            {/* Sección App */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray_b mb-4">App</h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-stock" className="text-base">
                      Mostrar existencia disponible:
                    </Label>
                    <p className="text-sm text-gray_m">
                      Si activa esta opción los vendedores verán en la app la
                      existencia disponible de productos (existencia actual -
                      existencia comprometida).
                    </p>
                  </div>
                  <Switch
                    id="show-stock"
                    checked={settings.showAvailableStock}
                    onCheckedChange={(value) =>
                      handleSwitchChange("showAvailableStock", value)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="default-price" className="text-base">
                      Precio por defecto:
                    </Label>
                    <p className="text-sm text-gray_m">
                      Seleccione el precio por defecto que se mostrará en la app
                    </p>
                  </div>
                  <Select
                    value={settings.defaultPrice}
                    onValueChange={(value) =>
                      handleSelectChange("defaultPrice", value)
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Seleccionar precio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sync-services" className="text-base">
                      ¿Sincronizar servicios en el app?
                    </Label>
                    <p className="text-sm text-gray_m">
                      Si activa esta opción los servicios se sincronizarán en la
                      app.
                    </p>
                  </div>
                  <Switch
                    id="sync-services"
                    checked={settings.syncWithApp}
                    onCheckedChange={(value) =>
                      handleSwitchChange("syncWithApp", value)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="positive-balance" className="text-base">
                      ¿Tomar pedidos con saldo positivo?
                    </Label>
                    <p className="text-sm text-gray_m">
                      Si activa esta opción, los pedidos solo se podrán realizar
                      si el cliente no tiene deuda.
                    </p>
                  </div>
                  <Switch
                    id="positive-balance"
                    checked={settings.unableToDebtClient}
                    onCheckedChange={(value) =>
                      handleSwitchChange("unableToDebtClient", value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Sección Web */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray_b mb-4">Web</h2>

              <div className="space-y-6">
                <div>
                  <Label className="text-base">Semana laboral:</Label>
                  <p className="text-sm text-gray_m mb-3">
                    Defina la semana laboral para su empresa. Se usa para el
                    calendario de planificación de rutas.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
                    {DAYS_LABELS.map((day) => (
                      <div key={day.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day.id}`}
                          checked={
                            settings.workDays[
                              day.key as keyof typeof settings.workDays
                            ]
                          }
                          onCheckedChange={() => handleWorkdayToggle(day.key)}
                        />
                        <Label htmlFor={`day-${day.id}`} className="text-sm">
                          {day.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ecommerce-sync" className="text-base">
                      ¿Habilitar envio de productos a tienda virtual?
                    </Label>
                    <p className="text-sm text-gray_m">
                      Si activa esta opción los productos que se sincronicen
                      desde el ERP se enviarán a la tienda virtual.
                    </p>
                  </div>
                  <Switch
                    id="ecommerce-sync"
                    checked={settings.connectWithVirtualStore}
                    onCheckedChange={(value) =>
                      handleSwitchChange("connectWithVirtualStore", value)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="data-replication" className="text-base">
                      ¿Habilitar replicación de datos?
                    </Label>
                    <p className="text-sm text-gray_m">
                      Si activa esta opción los datos se replicaran en otras
                      sucursales desde la sucursal que seleccione como principal
                    </p>
                  </div>
                  <Switch
                    id="data-replication"
                    checked={settings.enableDataReplication}
                    onCheckedChange={(value) =>
                      handleSwitchChange("enableDataReplication", value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
