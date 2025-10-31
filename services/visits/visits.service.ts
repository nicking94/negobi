import api from "../../utils/api";
import {
  PostVisit,
  GetVisits,
  GetVisitById,
  PatchVisit,
  DeleteVisit,
} from "../visits/visits.route";

export interface GetVisitsParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  date_from?: string;
  date_to?: string;
  status?: VisitStatus;
  description?: string;
  clientId?: number;
}

export const VISIT_STATUSES = {
  PENDING: "pending",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type VisitStatus = (typeof VISIT_STATUSES)[keyof typeof VISIT_STATUSES];

export interface VisitLocation {
  type: "Point";
  coordinates: [number, number];
}

export interface Visit {
  id: number;
  date: string;
  location: VisitLocation;
  status: VisitStatus;
  description: string;
  clientId?: number;
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateVisitData {
  date: string;
  location: VisitLocation;
  status: VisitStatus;
  description: string;
  clientId?: number;
}

export interface UpdateVisitData {
  date?: string;
  location?: VisitLocation;
  status?: VisitStatus;
  description?: string;
  clientId?: number;
}

export interface VisitResponse {
  success: boolean;
  data: Visit;
}

export interface VisitsListResponse {
  success: boolean;
  data: Visit[];
}

export interface PaginatedVisitsResponse {
  success: boolean;
  data: {
    data: Visit[];
    totalPages: number;
    total: number;
  };
}

export interface VisitStatistics {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export interface VisitWithDetails extends Visit {
  clientName?: string;
  clientAddress?: string;
  duration?: number;
  distance?: number;
}

export const visitService = {
  VISIT_STATUSES,

  createVisit: async (visitData: CreateVisitData): Promise<Visit> => {
    const response = await api.post(PostVisit, visitData);
    return response.data.data;
  },

  getVisits: async (params?: GetVisitsParams): Promise<Visit[]> => {
    const queryParams = new URLSearchParams();

    queryParams.append("page", params?.page?.toString() || "1");
    queryParams.append(
      "itemsPerPage",
      params?.itemsPerPage?.toString() || "10"
    );

    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.order) {
      queryParams.append("order", params.order);
    }
    if (params?.date_from) {
      queryParams.append("date_from", params.date_from);
    }
    if (params?.date_to) {
      queryParams.append("date_to", params.date_to);
    }
    if (params?.status) {
      queryParams.append("status", params.status);
    }
    if (params?.description) {
      queryParams.append("description", params.description);
    }
    if (params?.clientId) {
      queryParams.append("clientId", params.clientId.toString());
    }

    const response = await api.get(`${GetVisits}?${queryParams}`);
    return response.data.data;
  },

  getVisitById: async (id: string): Promise<Visit> => {
    const response = await api.get(`${GetVisitById}/${id}`);
    return response.data.data;
  },

  updateVisit: async (id: string, updates: UpdateVisitData): Promise<Visit> => {
    const response = await api.patch(`${PatchVisit}/${id}`, updates);
    return response.data.data;
  },

  deleteVisit: async (id: string): Promise<void> => {
    await api.delete(`${DeleteVisit}/${id}`);
  },

  getVisitsByStatus: async (status: VisitStatus): Promise<Visit[]> => {
    return visitService.getVisits({
      status,
      itemsPerPage: 10,
    });
  },

  getVisitsByClient: async (clientId: number): Promise<Visit[]> => {
    return visitService.getVisits({
      clientId,
      itemsPerPage: 10,
    });
  },

  getVisitsByDateRange: async (
    startDate: string,
    endDate: string
  ): Promise<Visit[]> => {
    return visitService.getVisits({
      date_from: startDate,
      date_to: endDate,
      itemsPerPage: 10,
    });
  },

  getTodayVisits: async (): Promise<Visit[]> => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    return visitService.getVisits({
      date_from: startOfDay,
      date_to: endOfDay,
      itemsPerPage: 10,
    });
  },

  getUpcomingVisits: async (days: number = 7): Promise<Visit[]> => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return visitService.getVisits({
      date_from: now.toISOString(),
      date_to: futureDate.toISOString(),
      itemsPerPage: 10,
    });
  },

  updateVisitStatus: async (
    id: string,
    status: VisitStatus
  ): Promise<Visit> => {
    return visitService.updateVisit(id, { status });
  },

  markVisitAsCompleted: async (id: string): Promise<Visit> => {
    return visitService.updateVisitStatus(id, VISIT_STATUSES.COMPLETED);
  },

  markVisitAsCancelled: async (id: string): Promise<Visit> => {
    return visitService.updateVisitStatus(id, VISIT_STATUSES.CANCELLED);
  },

  rescheduleVisit: async (id: string, newDate: string): Promise<Visit> => {
    return visitService.updateVisit(id, { date: newDate });
  },

  getVisitStatistics: async (): Promise<VisitStatistics> => {
    try {
      const [
        allVisits,
        pendingVisits,
        completedVisits,
        cancelledVisits,
        todayVisits,
      ] = await Promise.all([
        visitService.getVisits({ itemsPerPage: 10 }),
        visitService.getVisitsByStatus(VISIT_STATUSES.PENDING),
        visitService.getVisitsByStatus(VISIT_STATUSES.COMPLETED),
        visitService.getVisitsByStatus(VISIT_STATUSES.CANCELLED),
        visitService.getTodayVisits(),
      ]);

      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
      const thisWeekVisits = allVisits.filter((visit) => {
        const visitDate = new Date(visit.date);
        return visitDate >= startOfWeek && visitDate <= endOfWeek;
      });

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const thisMonthVisits = allVisits.filter((visit) => {
        const visitDate = new Date(visit.date);
        return visitDate >= startOfMonth && visitDate <= endOfMonth;
      });

      return {
        total: allVisits.length,
        pending: pendingVisits.length,
        completed: completedVisits.length,
        cancelled: cancelledVisits.length,
        today: todayVisits.length,
        thisWeek: thisWeekVisits.length,
        thisMonth: thisMonthVisits.length,
      };
    } catch (error) {
      console.error("Error getting visit statistics:", error);
      return {
        total: 0,
        pending: 0,
        completed: 0,
        cancelled: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
      };
    }
  },

  validateVisitData: (
    visitData: CreateVisitData
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!visitData.date) {
      errors.push("La fecha de la visita es requerida");
    } else {
      const visitDate = new Date(visitData.date);
      if (visitDate < new Date()) {
        errors.push("La fecha de la visita no puede ser en el pasado");
      }
    }

    if (!visitData.location || !visitData.location.coordinates) {
      errors.push("La ubicación es requerida");
    } else {
      const [longitude, latitude] = visitData.location.coordinates;
      if (longitude < -180 || longitude > 180) {
        errors.push("La longitud debe estar entre -180 y 180");
      }
      if (latitude < -90 || latitude > 90) {
        errors.push("La latitud debe estar entre -90 y 90");
      }
    }

    if (!visitData.status) {
      errors.push("El estado de la visita es requerido");
    }

    if (!visitData.description || visitData.description.trim().length === 0) {
      errors.push("La descripción de la visita es requerida");
    } else if (visitData.description.length > 500) {
      errors.push("La descripción no puede exceder los 500 caracteres");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  calculateDistance: (
    coord1: [number, number],
    coord2: [number, number]
  ): number => {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return parseFloat(distance.toFixed(2));
  },

  optimizeVisitRoute: (visits: Visit[]): Visit[] => {
    if (visits.length <= 1) return visits;

    const sortedVisits = [...visits].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const optimized: Visit[] = [sortedVisits[0]];
    const remaining = sortedVisits.slice(1);

    while (remaining.length > 0) {
      const lastVisit = optimized[optimized.length - 1];
      let closestIndex = 0;
      let closestDistance = Infinity;

      remaining.forEach((visit, index) => {
        const distance = visitService.calculateDistance(
          lastVisit.location.coordinates,
          visit.location.coordinates
        );
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      optimized.push(remaining[closestIndex]);
      remaining.splice(closestIndex, 1);
    }

    return optimized;
  },

  getVisitsForCalendar: async (
    startDate: string,
    endDate: string
  ): Promise<Visit[]> => {
    return visitService.getVisitsByDateRange(startDate, endDate);
  },

  checkScheduleConflict: async (
    date: string,
    duration: number = 60,
    excludeVisitId?: string
  ): Promise<boolean> => {
    try {
      const visitDate = new Date(date);
      const visitEnd = new Date(visitDate.getTime() + duration * 60 * 1000);

      const visits = await visitService.getVisitsByDateRange(
        new Date(visitDate.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        new Date(visitEnd.getTime() + 2 * 60 * 60 * 1000).toISOString()
      );

      return visits.some((visit) => {
        if (excludeVisitId && visit.id.toString() === excludeVisitId) {
          return false;
        }

        const existingVisitDate = new Date(visit.date);
        const existingVisitEnd = new Date(
          existingVisitDate.getTime() + 60 * 60 * 1000
        );

        return (
          (visitDate >= existingVisitDate && visitDate < existingVisitEnd) ||
          (visitEnd > existingVisitDate && visitEnd <= existingVisitEnd) ||
          (visitDate <= existingVisitDate && visitEnd >= existingVisitEnd)
        );
      });
    } catch (error) {
      console.error("Error checking schedule conflict:", error);
      return false;
    }
  },

  createMultipleVisits: async (
    visitsData: CreateVisitData[]
  ): Promise<Visit[]> => {
    const createdVisits: Visit[] = [];

    for (const visitData of visitsData) {
      try {
        const createdVisit = await visitService.createVisit(visitData);
        createdVisits.push(createdVisit);
      } catch (error) {
        console.error(`Error creating visit:`, error);
        throw error;
      }
    }

    return createdVisits;
  },
};
