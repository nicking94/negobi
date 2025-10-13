import { useState, useEffect } from "react";
import {
  goalService,
  Goal,
  CreateGoalData,
  UpdateGoalData,
  GetGoalsParams,
  GoalType,
  PeriodType,
  GoalStatus,
  GoalProgress,
  GOAL_STATUSES,
} from "../../services/goals/goals.service";

// Definir el tipo para los filtros del hook
export interface UseGoalsFilters {
  goal_type?: GoalType;
  period_type?: PeriodType;
  status?: GoalStatus;
  companyId?: number;
  userId?: number;
  zoneId?: number;
  search?: string;
  min_target_amount?: number;
  max_target_amount?: number;
  min_target_quantity?: number;
  max_target_quantity?: number;
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
}

export const useGoals = (filters: UseGoalsFilters = {}) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los objetivos con filtros
  const loadGoals = async (customFilters?: Partial<UseGoalsFilters>) => {
    try {
      setLoading(true);
      setError(null);

      // Combinar filtros
      const combinedFilters: GetGoalsParams = {
        ...filters,
        ...customFilters,
        page: 1,
        itemsPerPage: 1000,
      };

      console.log("🔵 Enviando parámetros para objetivos:", combinedFilters);

      const goalsData = await goalService.getGoals(combinedFilters);
      console.log("🟢 Datos de objetivos recibidos:", goalsData);

      if (Array.isArray(goalsData)) {
        setGoals(goalsData);
      } else {
        console.warn("⚠️ Estructura inesperada:", goalsData);
        setGoals([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar objetivos"
      );
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  // Crear objetivo
  const createGoal = async (goalData: CreateGoalData): Promise<Goal | null> => {
    try {
      setLoading(true);
      setError(null);

      // Validar fechas
      if (
        !goalService.validateGoalDates(goalData.start_date, goalData.end_date)
      ) {
        setError("La fecha de inicio debe ser anterior a la fecha de fin");
        return null;
      }

      const newGoal = await goalService.createGoal(goalData);
      setGoals((prev) => [...prev, newGoal]);
      return newGoal;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear objetivo");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar objetivo
  const updateGoal = async (
    id: string,
    updates: UpdateGoalData
  ): Promise<Goal | null> => {
    try {
      setLoading(true);
      setError(null);

      // Validar fechas si se están actualizando
      if (
        updates.start_date &&
        updates.end_date &&
        !goalService.validateGoalDates(updates.start_date, updates.end_date)
      ) {
        setError("La fecha de inicio debe ser anterior a la fecha de fin");
        return null;
      }

      const updatedGoal = await goalService.updateGoal(id, updates);
      setGoals((prev) =>
        prev.map((goal) => (goal.id.toString() === id ? updatedGoal : goal))
      );
      return updatedGoal;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar objetivo"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar objetivo
  const deleteGoal = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await goalService.deleteGoal(id);
      setGoals((prev) => prev.filter((goal) => goal.id.toString() !== id));
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar objetivo"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Obtener objetivo por ID
  const getGoalById = async (id: string): Promise<Goal | null> => {
    try {
      setLoading(true);
      setError(null);
      const goal = await goalService.getGoalById(id);
      return goal;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al obtener objetivo"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado de objetivo
  const updateGoalStatus = async (
    id: string,
    status: GoalStatus
  ): Promise<Goal | null> => {
    try {
      return await updateGoal(id, { status });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cambiar estado del objetivo"
      );
      return null;
    }
  };

  // Marcar objetivo como alcanzado
  const markGoalAsReached = async (id: string): Promise<Goal | null> => {
    return await updateGoalStatus(id, GOAL_STATUSES.REACHED);
  };

  const markGoalAsNotReached = async (id: string): Promise<Goal | null> => {
    return await updateGoalStatus(id, GOAL_STATUSES.NOT_REACHED);
  };

  // Calcular progreso de objetivo
  const calculateGoalProgress = (
    goal: Goal,
    currentAmount: number,
    currentQuantity: number
  ): GoalProgress => {
    return goalService.calculateGoalProgress(
      goal,
      currentAmount,
      currentQuantity
    );
  };

  // Validar fechas
  const validateGoalDates = (startDate: string, endDate: string): boolean => {
    return goalService.validateGoalDates(startDate, endDate);
  };

  // Cargar objetivos al montar el hook o cuando cambien los filtros
  useEffect(() => {
    loadGoals();
  }, [
    filters.goal_type,
    filters.period_type,
    filters.status,
    filters.companyId,
    filters.userId,
    filters.zoneId,
    filters.search,
    filters.min_target_amount,
    filters.max_target_amount,
    filters.min_target_quantity,
    filters.max_target_quantity,
    filters.start_date_from,
    filters.start_date_to,
    filters.end_date_from,
    filters.end_date_to,
  ]);

  return {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    getGoalById,
    updateGoalStatus,
    markGoalAsReached,
    markGoalAsNotReached,
    calculateGoalProgress,
    validateGoalDates,
    refetch: loadGoals,
  };
};

// Hook especializado para objetivos activos
export const useActiveGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActiveGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const activeGoals = await goalService.getActiveGoals();
      setGoals(activeGoals);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar objetivos activos"
      );
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveGoals();
  }, []);

  return {
    goals,
    loading,
    error,
    refetch: loadActiveGoals,
  };
};

// Hook especializado para objetivos por tipo
export const useGoalsByType = (goalType?: GoalType) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGoalsByType = async (targetType?: GoalType) => {
    const targetTypeToUse = targetType || goalType;
    if (!targetTypeToUse) {
      setError("Tipo de objetivo es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const goalsByType = await goalService.getGoalsByType(targetTypeToUse);
      setGoals(goalsByType);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar objetivos por tipo"
      );
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (goalType) {
      loadGoalsByType();
    }
  }, [goalType]);

  return {
    goals,
    loading,
    error,
    refetch: loadGoalsByType,
  };
};

// Hook especializado para objetivos por estado
export const useGoalsByStatus = (status?: GoalStatus) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGoalsByStatus = async (targetStatus?: GoalStatus) => {
    const targetStatusToUse = targetStatus || status;
    if (!targetStatusToUse) {
      setError("Estado de objetivo es requerido");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const goalsByStatus = await goalService.getGoalsByStatus(
        targetStatusToUse
      );
      setGoals(goalsByStatus);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar objetivos por estado"
      );
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status) {
      loadGoalsByStatus();
    }
  }, [status]);

  return {
    goals,
    loading,
    error,
    refetch: loadGoalsByStatus,
  };
};

// Hook para objetivos del período actual
export const useCurrentPeriodGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCurrentPeriodGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const currentGoals = await goalService.getCurrentPeriodGoals();
      setGoals(currentGoals);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar objetivos del período actual"
      );
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentPeriodGoals();
  }, []);

  return {
    goals,
    loading,
    error,
    refetch: loadCurrentPeriodGoals,
  };
};

// Hook para select/dropdown de objetivos
export const useGoalsForSelect = () => {
  const [options, setOptions] = useState<
    Array<{ value: number; label: string; type: GoalType }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const selectOptions = await goalService.getGoalsForSelect();
      setOptions(selectOptions);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar opciones de objetivos"
      );
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  return {
    options,
    loading,
    error,
    refetch: loadOptions,
  };
};

// Hook para análisis de objetivos
export const useGoalsAnalysis = () => {
  const { goals, loading, error } = useActiveGoals();

  const analysis = {
    // Totales
    totalGoals: goals.length,
    reachedGoals: goals.filter((goal) => goal.status === GOAL_STATUSES.REACHED)
      .length,
    notReachedGoals: goals.filter(
      (goal) => goal.status === GOAL_STATUSES.NOT_REACHED
    ).length,

    // Por tipo
    goalsByType: goals.reduce((summary, goal) => {
      summary[goal.goal_type] = (summary[goal.goal_type] || 0) + 1;
      return summary;
    }, {} as Record<GoalType, number>),

    // Por período
    goalsByPeriod: goals.reduce((summary, goal) => {
      summary[goal.period_type] = (summary[goal.period_type] || 0) + 1;
      return summary;
    }, {} as Record<PeriodType, number>),

    // Montos totales
    totalTargetAmount: goals.reduce(
      (total, goal) => total + goal.target_amount,
      0
    ),
    totalTargetQuantity: goals.reduce(
      (total, goal) => total + goal.target_quantity,
      0
    ),

    // Promedios
    averageTargetAmount:
      goals.length > 0
        ? goals.reduce((total, goal) => total + goal.target_amount, 0) /
          goals.length
        : 0,
    averageTargetQuantity:
      goals.length > 0
        ? goals.reduce((total, goal) => total + goal.target_quantity, 0) /
          goals.length
        : 0,

    // Objetivos próximos a vencer
    upcomingGoals: goals.filter((goal) => {
      const endDate = new Date(goal.end_date);
      const now = new Date();
      const daysRemaining = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysRemaining <= 7 && daysRemaining > 0;
    }).length,

    // Objetivos vencidos
    expiredGoals: goals.filter((goal) => {
      const endDate = new Date(goal.end_date);
      const now = new Date();
      return endDate < now && goal.status === GOAL_STATUSES.NOT_REACHED;
    }).length,
  };

  return {
    analysis,
    goals,
    loading,
    error,
  };
};

// Hook para objetivos próximos a vencer
export const useUpcomingGoals = (daysThreshold: number = 7) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUpcomingGoals = async (threshold?: number) => {
    try {
      setLoading(true);
      setError(null);
      const upcoming = await goalService.getUpcomingGoals(
        threshold || daysThreshold
      );
      setGoals(upcoming);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar objetivos próximos"
      );
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUpcomingGoals();
  }, [daysThreshold]);

  return {
    goals,
    loading,
    error,
    refetch: loadUpcomingGoals,
  };
};
