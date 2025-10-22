import api from "../../utils/api";
import {
  PostGoal,
  GetGoals,
  GetGoalById,
  PatchGoal,
  DeleteGoal,
} from "../goals/goals.route";

// Parámetros para obtener objetivos
export interface GetGoalsParams {
  page?: number;
  itemsPerPage?: number;
  order?: "ASC" | "DESC";
  search?: string;
  goal_type?: GoalType;
  period_type?: PeriodType;
  min_target_amount?: number;
  max_target_amount?: number;
  min_target_quantity?: number;
  max_target_quantity?: number;
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
  status?: GoalStatus;
  companyId?: number;
  userId?: number;
  zoneId?: number;
}

// Tipos y constantes
export const GOAL_TYPES = {
  COMPANY: "company",
  SALES_PERSON: "sales_person",
  ZONE: "zone",
  SUPERVISOR: "supervisor",
} as const;

export const PERIOD_TYPES = {
  MONTHLY: "monthly",
  WEEKLY: "weekly",
} as const;

export const GOAL_STATUSES = {
  REACHED: "reached",
  NOT_REACHED: "not_reached",
} as const;

export type GoalType = (typeof GOAL_TYPES)[keyof typeof GOAL_TYPES];
export type PeriodType = (typeof PERIOD_TYPES)[keyof typeof PERIOD_TYPES];
export type GoalStatus = (typeof GOAL_STATUSES)[keyof typeof GOAL_STATUSES];

// Interfaz principal del objetivo
export interface Goal {
  // Campos principales
  id: number;
  goal_type: GoalType;
  period_type: PeriodType;
  target_amount: number;
  target_quantity: number;
  start_date: string;
  end_date: string;
  status: GoalStatus;

  // Campos de relación (opcionales en response)
  companyId?: number;
  userId?: number;
  zoneId?: number;

  // Campos de sistema
  external_code?: string;
  sync_with_erp: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateGoalData {
  goal_type: GoalType;
  period_type: PeriodType;
  target_amount: number;
  target_quantity: number;
  start_date: string;
  end_date: string;
  status: GoalStatus;
  companyId?: number;
  userId?: number | null;
  zoneId?: number | null;
  external_code?: string | null;
}

// Datos para actualizar un objetivo
export interface UpdateGoalData {
  goal_type?: GoalType;
  period_type?: PeriodType;
  target_amount?: number;
  target_quantity?: number;
  start_date?: string;
  end_date?: string;
  status?: GoalStatus;
  companyId?: number;
  userId?: number;
  zoneId?: number;
}

// Interfaces de respuesta
export interface GoalResponse {
  success: boolean;
  data: Goal;
}

export interface GoalsListResponse {
  success: boolean;
  data: Goal[];
}

export interface PaginatedGoalsResponse {
  success: boolean;
  data: {
    data: Goal[];
    totalPages: number;
    total: number;
  };
}

// Interfaz para progreso de objetivo
export interface GoalProgress {
  goal: Goal;
  current_amount: number;
  current_quantity: number;
  progress_percentage: number;
  days_remaining: number;
  is_on_track: boolean;
}

export const goalService = {
  // En validateCreateGoalData, agregar más validaciones:
  validateCreateGoalData: (
    goalData: CreateGoalData
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!goalData.goal_type) {
      errors.push("El tipo de objetivo es requerido");
    }

    if (!goalData.period_type) {
      errors.push("El tipo de período es requerido");
    }

    if (goalData.target_amount === undefined || goalData.target_amount < 0) {
      errors.push("El monto objetivo debe ser un número positivo");
    }

    if (
      goalData.target_quantity === undefined ||
      goalData.target_quantity < 0
    ) {
      errors.push("La cantidad objetivo debe ser un número positivo");
    }

    if (!goalData.start_date) {
      errors.push("La fecha de inicio es requerida");
    }

    if (!goalData.end_date) {
      errors.push("La fecha de fin es requerida");
    }

    if (goalData.start_date && goalData.end_date) {
      const start = new Date(goalData.start_date);
      const end = new Date(goalData.end_date);
      if (start >= end) {
        errors.push("La fecha de inicio debe ser anterior a la fecha de fin");
      }
    }

    // Validaciones específicas por tipo de objetivo
    if (goalData.goal_type === GOAL_TYPES.COMPANY && !goalData.companyId) {
      errors.push("companyId es requerido para objetivos de empresa");
    }

    if (goalData.goal_type === GOAL_TYPES.SALES_PERSON && !goalData.userId) {
      errors.push("userId es requerido para objetivos de vendedor");
    }

    if (goalData.goal_type === GOAL_TYPES.ZONE && !goalData.zoneId) {
      errors.push("zoneId es requerido para objetivos de zona");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
  // En la función createGoal, reemplaza esta parte:
  createGoal: async (goalData: CreateGoalData): Promise<Goal> => {
    try {
      // Validar datos antes de enviar
      const validation = goalService.validateCreateGoalData(goalData);
      if (!validation.isValid) {
        throw new Error(`Datos inválidos: ${validation.errors.join(", ")}`);
      }

      // CORREGIDO: Formatear datos según el Swagger
      const formattedData = {
        goal_type: goalData.goal_type,
        period_type: goalData.period_type,
        target_amount: goalData.target_amount,
        target_quantity: goalData.target_quantity,
        start_date: new Date(goalData.start_date).toISOString(),
        end_date: new Date(goalData.end_date).toISOString(),
        status: goalData.status,
        companyId: goalData.companyId,

        ...(goalData.userId && { userId: goalData.userId }),
        ...(goalData.zoneId && { zoneId: goalData.zoneId }),
        ...(goalData.external_code && {
          external_code: goalData.external_code,
        }),
      };

      const response = await api.post(PostGoal, formattedData);

      if (!response.data.success) {
        throw new Error(response.data.message || "Error al crear objetivo");
      }

      return response.data.data;
    } catch (error: any) {
      console.error("❌ Error en createGoal:", error);

      if (error.response) {
        console.error("Respuesta del servidor:", error.response.data);
        console.error("Status:", error.response.status);
        console.error("Headers:", error.response.headers);

        // Log más detallado del error
        if (error.response.data && error.response.data.message) {
          console.error("Mensaje de error:", error.response.data.message);
        }

        throw new Error(
          error.response.data.message ||
            `Error ${error.response.status} del servidor`
        );
      }

      throw error;
    }
  },

  // Obtener todos los objetivos con paginación
  getGoals: async (
    params?: GetGoalsParams
  ): Promise<{
    data: Goal[];
    totalPages: number;
    total: number;
  }> => {
    const queryParams = new URLSearchParams();

    // Parámetros requeridos
    queryParams.append("page", params?.page?.toString() || "1");
    queryParams.append(
      "itemsPerPage",
      params?.itemsPerPage?.toString() || "10"
    );

    // Parámetros opcionales
    if (params?.search) queryParams.append("search", params.search);
    if (params?.order) queryParams.append("order", params.order);
    if (params?.goal_type) queryParams.append("goal_type", params.goal_type);
    if (params?.period_type)
      queryParams.append("period_type", params.period_type);
    if (params?.min_target_amount !== undefined)
      queryParams.append(
        "min_target_amount",
        params.min_target_amount.toString()
      );
    if (params?.max_target_amount !== undefined)
      queryParams.append(
        "max_target_amount",
        params.max_target_amount.toString()
      );
    if (params?.min_target_quantity !== undefined)
      queryParams.append(
        "min_target_quantity",
        params.min_target_quantity.toString()
      );
    if (params?.max_target_quantity !== undefined)
      queryParams.append(
        "max_target_quantity",
        params.max_target_quantity.toString()
      );
    if (params?.start_date_from)
      queryParams.append("start_date_from", params.start_date_from);
    if (params?.start_date_to)
      queryParams.append("start_date_to", params.start_date_to);
    if (params?.end_date_from)
      queryParams.append("end_date_from", params.end_date_from);
    if (params?.end_date_to)
      queryParams.append("end_date_to", params.end_date_to);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.companyId)
      queryParams.append("companyId", params.companyId.toString());
    if (params?.userId) queryParams.append("userId", params.userId.toString());
    if (params?.zoneId) queryParams.append("zoneId", params.zoneId.toString());

    const response = await api.get(`${GetGoals}?${queryParams}`);
    return response.data.data; // Retorna la estructura paginada
  },

  // Obtener un objetivo por ID
  getGoalById: async (id: string): Promise<Goal> => {
    const response = await api.get(`${GetGoalById}/${id}`);
    return response.data.data;
  },

  // Actualizar un objetivo
  updateGoal: async (id: string, updates: UpdateGoalData): Promise<Goal> => {
    const response = await api.patch(`${PatchGoal}/${id}`, updates);
    return response.data.data;
  },

  // Eliminar un objetivo
  deleteGoal: async (id: string): Promise<void> => {
    await api.delete(`${DeleteGoal}/${id}`);
  },

  // Métodos adicionales útiles - CORREGIDOS
  getActiveGoals: async (): Promise<Goal[]> => {
    try {
      const now = new Date().toISOString();
      const response = await goalService.getGoals({
        end_date_from: now, // Objetivos que aún no han vencido
        status: GOAL_STATUSES.NOT_REACHED,
        itemsPerPage: 10,
      });
      return response?.data || []; // Extraer el array de goals con validación
    } catch (error) {
      console.error("Error getting active goals:", error);
      return [];
    }
  },

  getGoalsByType: async (goalType: GoalType): Promise<Goal[]> => {
    const response = await goalService.getGoals({
      goal_type: goalType,
      itemsPerPage: 10,
    });
    return response.data;
  },

  getGoalsByStatus: async (status: GoalStatus): Promise<Goal[]> => {
    const response = await goalService.getGoals({
      status: status,
      itemsPerPage: 10,
    });
    return response.data;
  },

  getGoalsByPeriod: async (periodType: PeriodType): Promise<Goal[]> => {
    const response = await goalService.getGoals({
      period_type: periodType,
      itemsPerPage: 10,
    });
    return response.data;
  },

  getGoalsByCompany: async (companyId: number): Promise<Goal[]> => {
    const response = await goalService.getGoals({
      companyId: companyId,
      itemsPerPage: 10,
    });
    return response.data;
  },

  getGoalsByUser: async (userId: number): Promise<Goal[]> => {
    const response = await goalService.getGoals({
      userId: userId,
      itemsPerPage: 10,
    });
    return response.data;
  },

  getGoalsByZone: async (zoneId: number): Promise<Goal[]> => {
    const response = await goalService.getGoals({
      zoneId: zoneId,
      itemsPerPage: 10,
    });
    return response.data;
  },

  getCurrentPeriodGoals: async (): Promise<Goal[]> => {
    const now = new Date();
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).toISOString();
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).toISOString();

    const response = await goalService.getGoals({
      start_date_from: startOfMonth,
      end_date_to: endOfMonth,
      itemsPerPage: 10,
    });
    return response.data;
  },

  // Cambiar estado de objetivo
  updateGoalStatus: async (id: string, status: GoalStatus): Promise<Goal> => {
    return goalService.updateGoal(id, { status });
  },

  // Marcar objetivo como alcanzado
  markGoalAsReached: async (id: string): Promise<Goal> => {
    return goalService.updateGoalStatus(id, GOAL_STATUSES.REACHED);
  },

  // Marcar objetivo como no alcanzado
  markGoalAsNotReached: async (id: string): Promise<Goal> => {
    return goalService.updateGoalStatus(id, GOAL_STATUSES.NOT_REACHED);
  },

  // Calcular progreso de objetivo (simulado - en una implementación real esto vendría del backend)
  calculateGoalProgress: (
    goal: Goal,
    currentAmount: number,
    currentQuantity: number
  ): GoalProgress => {
    const now = new Date();
    const endDate = new Date(goal.end_date);
    const startDate = new Date(goal.start_date);

    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysPassed = Math.ceil(
      (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysRemaining = Math.max(0, totalDays - daysPassed);

    const amountProgress =
      goal.target_amount > 0 ? (currentAmount / goal.target_amount) * 100 : 0;
    const quantityProgress =
      goal.target_quantity > 0
        ? (currentQuantity / goal.target_quantity) * 100
        : 0;

    // Usar el progreso más bajo como indicador general
    const progressPercentage = Math.min(amountProgress, quantityProgress);

    // Considerar que está en camino si el progreso es al menos el porcentaje esperado basado en el tiempo transcurrido
    const expectedProgress = (daysPassed / totalDays) * 100;
    const isOnTrack = progressPercentage >= expectedProgress * 0.8; // 80% del progreso esperado

    return {
      goal,
      current_amount: currentAmount,
      current_quantity: currentQuantity,
      progress_percentage: Math.min(100, Math.max(0, progressPercentage)),
      days_remaining: daysRemaining,
      is_on_track: isOnTrack,
    };
  },

  // Validar fechas de objetivo
  validateGoalDates: (startDate: string, endDate: string): boolean => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start < end;
  },

  // Obtener objetivos para select/dropdown - CORREGIDO
  getGoalsForSelect: async (): Promise<
    Array<{ value: number; label: string; type: GoalType }>
  > => {
    try {
      const response = await goalService.getGoals({
        itemsPerPage: 10, // Aumentar para obtener más opciones
        status: GOAL_STATUSES.NOT_REACHED, // Solo objetivos activos
      });

      // Asegurar que tenemos datos válidos
      const goals = response?.data || [];

      return goals.map((goal) => ({
        value: goal.id,
        label: `${goal.goal_type} - ${goal.period_type} (${goal.target_amount})`,
        type: goal.goal_type,
      }));
    } catch (error) {
      console.error("Error getting goals for select:", error);
      return [];
    }
  },

  // Obtener resumen de objetivos por tipo - ACTUALIZADO
  getGoalsSummaryByType: async (): Promise<Record<GoalType, number>> => {
    try {
      const goals = await goalService.getActiveGoals();
      return goals.reduce((summary, goal) => {
        summary[goal.goal_type] = (summary[goal.goal_type] || 0) + 1;
        return summary;
      }, {} as Record<GoalType, number>);
    } catch (error) {
      console.error("Error getting goals summary by type:", error);
      return {} as Record<GoalType, number>;
    }
  },

  // Obtener objetivos próximos a vencer (menos de 7 días) - ACTUALIZADO
  getUpcomingGoals: async (daysThreshold: number = 7): Promise<Goal[]> => {
    try {
      const now = new Date();
      const thresholdDate = new Date(
        now.getTime() + daysThreshold * 24 * 60 * 60 * 1000
      );

      const goals = await goalService.getActiveGoals();
      return goals.filter((goal) => {
        const endDate = new Date(goal.end_date);
        return endDate > now && endDate <= thresholdDate;
      });
    } catch (error) {
      console.error("Error getting upcoming goals:", error);
      return [];
    }
  },
};
