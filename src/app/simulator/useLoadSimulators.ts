import { useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getSimulatorStore } from "@/lib/data/simulators";
import type { Simulation } from "./SimulatorClient";

interface UseLoadSimulatorsParams {
    hasInitialSimulations: boolean;
    setSimulations: (simulations: Simulation[]) => void;
    setActiveSimulation: (simulation: Simulation | null) => void;
    setLoading: (loading: boolean) => void;
}

export function useLoadSimulators({
    hasInitialSimulations,
    setSimulations,
    setActiveSimulation,
    setLoading,
}: UseLoadSimulatorsParams) {
    const { status, isAuthenticated } = useAuth();
    useEffect(() => {
        if (status === "loading") return;
        if (hasInitialSimulations) return;
        let isMounted = true;

        getSimulatorStore(isAuthenticated)
            .list()
            .then((simulations) => {
                if (!isMounted) return;
                setSimulations(simulations);
                setActiveSimulation(simulations[0] ?? null);
            })
            .catch((error) => {
                toast.error(
                    error instanceof Error ? error.message : "Failed to load simulators",
                );
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, hasInitialSimulations]);
}
