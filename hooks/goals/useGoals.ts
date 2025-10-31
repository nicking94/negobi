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
import { toast } from "sonner";

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
  const [pagination, setPagination] = useState({
    page: 1,
    itemsPerPage: 10,
    totalPages: 1,
    total: 0,
  });

  const loadGoals = async (
    customFilters?: Partial<UseGoalsFilters>,
    newPage?: number
  ) => {
    try {
      setLoading(true);
      setError(null);

      const combinedFilters: GetGoalsParams = {
        ...filters,
        ...customFilters,
        page: newPage || pagination.page,
        itemsPerPage: pagination.itemsPerPage,
      };

      const response = await goalService.getGoals(combinedFilters);

      if (response && Array.isArray(response.data)) {
        setGoals(response.data);
        setPagination((prev) => ({
          ...prev,
          totalPages: response.totalPages,
          total: response.total,
          page: newPage || prev.page,
        }));
      } else {
        console.warn("⚠️ Estructura inesperada:", response);
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

  const setPage = (page: number) => {
    loadGoals(undefined, page);
  };

  const setItemsPerPage = (itemsPerPage: number) => {
    setPagination((prev) => ({ ...prev, itemsPerPage, page: 1 }));
  };

  const createGoal = async (goalData: CreateGoalData): Promise<Goal | null> => {
    try {
      setLoading(true);
      setError(null);

      const validation = goalService.validateCreateGoalData(goalData);
      if (!validation.isValid) {
        const errorMsg = `Datos inválidos: ${validation.errors.join(", ")}`;
        setError(errorMsg);
        toast.error(errorMsg);
        return null;
      }

      const newGoal = await goalService.createGoal(goalData);

      if (newGoal) {
        await loadGoals();
        toast.success("Meta creada exitosamente");
        return newGoal;
      } else {
        throw new Error("No se pudo crear la meta");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Error al crear objetivo";
      console.error("❌ Error detallado:", err);
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = async (
    id: string,
    updates: UpdateGoalData
  ): Promise<Goal | null> => {
    try {
      setLoading(true);
      setError(null);

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

  const markGoalAsReached = async (id: string): Promise<Goal | null> => {
    return await updateGoalStatus(id, GOAL_STATUSES.REACHED);
  };

  const markGoalAsNotReached = async (id: string): Promise<Goal | null> => {
    return await updateGoalStatus(id, GOAL_STATUSES.NOT_REACHED);
  };

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

  const validateGoalDates = (startDate: string, endDate: string): boolean => {
    return goalService.validateGoalDates(startDate, endDate);
  };

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
    pagination,
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
    setPage,
    setItemsPerPage,
  };
};

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

export const useGoalsAnalysis = () => {
  const { goals, loading, error } = useActiveGoals();

  const analysis = {
    totalGoals: goals.length,
    reachedGoals: goals.filter((goal) => goal.status === GOAL_STATUSES.REACHED)
      .length,
    notReachedGoals: goals.filter(
      (goal) => goal.status === GOAL_STATUSES.NOT_REACHED
    ).length,

    goalsByType: goals.reduce((summary, goal) => {
      summary[goal.goal_type] = (summary[goal.goal_type] || 0) + 1;
      return summary;
    }, {} as Record<GoalType, number>),

    goalsByPeriod: goals.reduce((summary, goal) => {
      summary[goal.period_type] = (summary[goal.period_type] || 0) + 1;
      return summary;
    }, {} as Record<PeriodType, number>),

    totalTargetAmount: goals.reduce(
      (total, goal) => total + goal.target_amount,
      0
    ),
    totalTargetQuantity: goals.reduce(
      (total, goal) => total + goal.target_quantity,
      0
    ),

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

    upcomingGoals: goals.filter((goal) => {
      const endDate = new Date(goal.end_date);
      const now = new Date();
      const daysRemaining = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysRemaining <= 7 && daysRemaining > 0;
    }).length,

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
