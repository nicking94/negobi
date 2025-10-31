"use client";

import { useState } from "react";
import { useSidebar } from "@/context/SidebarContext";
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

const SettingsPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [settings, setSettings] = useState({
    showAvailableStock: true,
    defaultPrice: "price3",
    syncServices: false,
    ordersWithPositiveBalance: true,
    workWeek: [1, 2, 3, 4, 5],
    enableEcommerceSync: false,
    enableDataReplication: true,
  });

  const handleSwitchChange = (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleWorkdayToggle = (dayIndex: number) => {
    setSettings((prev) => {
      const newWorkWeek = prev.workWeek.includes(dayIndex)
        ? prev.workWeek.filter((day) => day !== dayIndex)
        : [...prev.workWeek, dayIndex].sort();

      return { ...prev, workWeek: newWorkWeek };
    });
  };

  const handleSaveSettings = () => {
    toast.success("Configuraciones guardadas exitosamente");
  };

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
            <Button onClick={handleSaveSettings}>Guardar cambios</Button>
          </div>

          <div className="grid gap-8">
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
                      <SelectItem value="price1">Precio 1</SelectItem>
                      <SelectItem value="price2">Precio 2</SelectItem>
                      <SelectItem value="price3">Precio 3</SelectItem>
                      <SelectItem value="price4">Precio 4</SelectItem>
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
                    checked={settings.syncServices}
                    onCheckedChange={(value) =>
                      handleSwitchChange("syncServices", value)
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
                    checked={settings.ordersWithPositiveBalance}
                    onCheckedChange={(value) =>
                      handleSwitchChange("ordersWithPositiveBalance", value)
                    }
                  />
                </div>
              </div>
            </div>

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
                    {[
                      { id: 0, label: "Domingo" },
                      { id: 1, label: "Lunes" },
                      { id: 2, label: "Martes" },
                      { id: 3, label: "Miércoles" },
                      { id: 4, label: "Jueves" },
                      { id: 5, label: "Viernes" },
                      { id: 6, label: "Sábado" },
                    ].map((day) => (
                      <div key={day.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day.id}`}
                          checked={settings.workWeek.includes(day.id)}
                          onCheckedChange={() => handleWorkdayToggle(day.id)}
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
                    checked={settings.enableEcommerceSync}
                    onCheckedChange={(value) =>
                      handleSwitchChange("enableEcommerceSync", value)
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
