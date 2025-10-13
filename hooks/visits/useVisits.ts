import { useState, useEffect } from "react";
import {
  visitService,
  Visit,
  CreateVisitData,
  UpdateVisitData,
  GetVisitsParams,
  VisitStatus,
  VisitLocation,
  VisitStatistics,
} from "../../services/visits/visits.service";

// Definir el tipo para los filtros del hook
export interface UseVisitsFilters {
  date_from?: string;
  date_to?: string;
  status?: VisitStatus;
  description?: string;
  clientId?: number;
  search?: string;
}

export const useVisits = (filters: UseVisitsFilters = {}) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todas las visitas con filtros
  const loadVisits = async (customFilters?: Partial<UseVisitsFilters>) => {
    try {
      setLoading(true);
      setError(null);

      // Combinar filtros
      const combinedFilters: GetVisitsParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 10,
      };

      console.log("🔵 Enviando parámetros para visitas:", combinedFilters);

      const visitsData = await visitService.getVisits(combinedFilters);
      console.log("🟢 Datos de visitas recibidos:", visitsData);

      if (Array.isArray(visitsData)) {
        setVisits(visitsData);
      } else {
        console.warn("⚠️ Estructura inesperada:", visitsData);
        setVisits([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar visitas");
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  // Crear visita
  const createVisit = async (
    visitData: CreateVisitData
  ): Promise<Visit | null> => {
    try {
      setLoading(true);
      setError(null);

      // Validar datos
      const validation = visitService.validateVisitData(visitData);
      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        return null;
      }

      // Verificar conflicto de horario
      const hasConflict = await visitService.checkScheduleConflict(
        visitData.date
      );
      if (hasConflict) {
        setError("Ya existe una visita programada en este horario");
        return null;
      }

      const newVisit = await visitService.createVisit(visitData);
      setVisits((prev) => [...prev, newVisit]);
      return newVisit;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear visita");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar visita
  const updateVisit = async (
    id: string,
    updates: UpdateVisitData
  ): Promise<Visit | null> => {
    try {
      setLoading(true);
      setError(null);

      // Si se actualiza la fecha, verificar conflicto
      if (updates.date) {
        const hasConflict = await visitService.checkScheduleConflict(
          updates.date,
          60,
          id
        );
        if (hasConflict) {
          setError("Ya existe una visita programada en este horario");
          return null;
        }
      }

      const updatedVisit = await visitService.updateVisit(id, updates);
      setVisits((prev) =>
        prev.map((visit) => (visit.id.toString() === id ? updatedVisit : visit))
      );
      return updatedVisit;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar visita"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar visita
  const deleteVisit = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await visitService.deleteVisit(id);
      setVisits((prev) => prev.filter((visit) => visit.id.toString() !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar visita");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtener visita por ID
  const getVisitById = async (id: string): Promise<Visit | null> => {
    try {
      setLoading(true);
      setError(null);
      const visit = await visitService.getVisitById(id);
      return visit;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener visita");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado de visita
  const updateVisitStatus = async (
    id: string,
    status: VisitStatus
  ): Promise<Visit | null> => {
    try {
      return await updateVisit(id, { status });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cambiar estado de la visita"
      );
      return null;
    }
  };

  // Marcar visita como completada
  const markVisitAsCompleted = async (id: string): Promise<Visit | null> => {
    return await updateVisitStatus(id, visitService.VISIT_STATUSES.COMPLETED);
  };

  // Marcar visita como cancelada
  const markVisitAsCancelled = async (id: string): Promise<Visit | null> => {
    return await updateVisitStatus(id, visitService.VISIT_STATUSES.CANCELLED);
  };

  // Reagendar visita
  const rescheduleVisit = async (
    id: string,
    newDate: string
  ): Promise<Visit | null> => {
    try {
      return await updateVisit(id, { date: newDate });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al reagendar visita"
      );
      return null;
    }
  };

  // Validar datos de visita
  const validateVisitData = (
    visitData: CreateVisitData
  ): { isValid: boolean; errors: string[] } => {
    return visitService.validateVisitData(visitData);
  };

  // Verificar conflicto de horario
  const checkScheduleConflict = async (
    date: string,
    duration: number = 60,
    excludeVisitId?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      return await visitService.checkScheduleConflict(
        date,
        duration,
        excludeVisitId
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al verificar conflicto de horario"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Calcular distancia entre puntos
  const calculateDistance = (
    coord1: [number, number],
    coord2: [number, number]
  ): number => {
    return visitService.calculateDistance(coord1, coord2);
  };

  // Optimizar ruta de visitas
  const optimizeVisitRoute = (visitsToOptimize: Visit[]): Visit[] => {
    return visitService.optimizeVisitRoute(visitsToOptimize);
  };

  // Crear múltiples visitas
  const createMultipleVisits = async (
    visitsData: CreateVisitData[]
  ): Promise<Visit[] | null> => {
    try {
      setLoading(true);
      setError(null);

      // Validar todas las visitas primero
      for (const visitData of visitsData) {
        const validation = visitService.validateVisitData(visitData);
        if (!validation.isValid) {
          setError(`Error en visita: ${validation.errors.join(", ")}`);
          return null;
        }
      }

      const createdVisits = await visitService.createMultipleVisits(visitsData);
      setVisits((prev) => [...prev, ...createdVisits]);
      return createdVisits;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear múltiples visitas"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cargar visitas al montar el hook o cuando cambien los filtros
  useEffect(() => {
    loadVisits();
  }, [
    filters.date_from,
    filters.date_to,
    filters.status,
    filters.description,
    filters.clientId,
    filters.search,
  ]);

  return {
    visits,
    loading,
    error,
    createVisit,
    updateVisit,
    deleteVisit,
    getVisitById,
    updateVisitStatus,
    markVisitAsCompleted,
    markVisitAsCancelled,
    rescheduleVisit,
    validateVisitData,
    checkScheduleConflict,
    calculateDistance,
    optimizeVisitRoute,
    createMultipleVisits,
    refetch: loadVisits,
  };
};

// Hook especializado para visitas por estado
export const useVisitsByStatus = (status?: VisitStatus) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVisitsByStatus = async (targetStatus?: VisitStatus) => {
    const targetStatusToUse = targetStatus || status;
    if (!targetStatusToUse) {
      setError("Estado de visita es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const statusVisits = await visitService.getVisitsByStatus(
        targetStatusToUse
      );
      setVisits(statusVisits);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar visitas por estado"
      );
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status) {
      loadVisitsByStatus();
    }
  }, [status]);

  return {
    visits,
    loading,
    error,
    refetch: loadVisitsByStatus,
  };
};

// Hook especializado para visitas por cliente
export const useVisitsByClient = (clientId?: number) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVisitsByClient = async (id?: number) => {
    const targetClientId = id || clientId;
    if (!targetClientId) {
      setError("clientId es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const clientVisits = await visitService.getVisitsByClient(targetClientId);
      setVisits(clientVisits);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar visitas del cliente"
      );
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      loadVisitsByClient();
    }
  }, [clientId]);

  return {
    visits,
    loading,
    error,
    refetch: loadVisitsByClient,
  };
};

// Hook para visitas de hoy
export const useTodayVisits = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTodayVisits = async () => {
    try {
      setLoading(true);
      setError(null);
      const todayVisits = await visitService.getTodayVisits();
      setVisits(todayVisits);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar visitas de hoy"
      );
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodayVisits();
  }, []);

  return {
    visits,
    loading,
    error,
    refetch: loadTodayVisits,
  };
};

// Hook para visitas próximas
export const useUpcomingVisits = (days: number = 7) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUpcomingVisits = async (newDays?: number) => {
    try {
      setLoading(true);
      setError(null);
      const upcomingVisits = await visitService.getUpcomingVisits(
        newDays || days
      );
      setVisits(upcomingVisits);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar visitas próximas"
      );
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUpcomingVisits();
  }, [days]);

  return {
    visits,
    loading,
    error,
    refetch: loadUpcomingVisits,
  };
};

// Hook para estadísticas de visitas
export const useVisitStatistics = () => {
  const [statistics, setStatistics] = useState<VisitStatistics>({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await visitService.getVisitStatistics();
      setStatistics(stats);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar estadísticas de visitas"
      );
      setStatistics({
        total: 0,
        pending: 0,
        completed: 0,
        cancelled: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  return {
    statistics,
    loading,
    error,
    refetch: loadStatistics,
  };
};

// Hook para calendario de visitas
export const useVisitCalendar = (startDate: string, endDate: string) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCalendarVisits = async (
    newStartDate?: string,
    newEndDate?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const calendarVisits = await visitService.getVisitsForCalendar(
        newStartDate || startDate,
        newEndDate || endDate
      );
      setVisits(calendarVisits);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar visitas del calendario"
      );
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarVisits();
  }, [startDate, endDate]);

  return {
    visits,
    loading,
    error,
    refetch: loadCalendarVisits,
  };
};

// Hook para optimización de rutas
export const useVisitRouteOptimization = (visitsToOptimize: Visit[]) => {
  const [optimizedRoute, setOptimizedRoute] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(false);

  const optimizeRoute = async (visits?: Visit[]) => {
    try {
      setLoading(true);
      const visitsToUse = visits || visitsToOptimize;
      const optimized = visitService.optimizeVisitRoute(visitsToUse);
      setOptimizedRoute(optimized);
    } catch (error) {
      console.error("Error optimizing visit route:", error);
      setOptimizedRoute(visitsToOptimize);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visitsToOptimize.length > 0) {
      optimizeRoute();
    }
  }, [visitsToOptimize]);

  return {
    optimizedRoute,
    loading,
    optimizeRoute,
  };
};

// Hook para gestión de estado de visitas
export const useVisitStatusManagement = () => {
  const {
    visits,
    loading,
    error,
    refetch,
    markVisitAsCompleted,
    markVisitAsCancelled,
  } = useVisits();

  // Completar múltiples visitas
  const completeMultipleVisits = async (
    visitIds: string[]
  ): Promise<boolean> => {
    try {
      const results = await Promise.all(
        visitIds.map((id) => markVisitAsCompleted(id))
      );
      return results.every((result) => result !== null);
    } catch (err) {
      console.error("Error completing multiple visits:", err);
      return false;
    }
  };

  // Cancelar múltiples visitas
  const cancelMultipleVisits = async (visitIds: string[]): Promise<boolean> => {
    try {
      const results = await Promise.all(
        visitIds.map((id) => markVisitAsCancelled(id))
      );
      return results.every((result) => result !== null);
    } catch (err) {
      console.error("Error cancelling multiple visits:", err);
      return false;
    }
  };

  return {
    visits,
    loading,
    error,
    markVisitAsCompleted,
    markVisitAsCancelled,
    completeMultipleVisits,
    cancelMultipleVisits,
    refetch,
  };
};
