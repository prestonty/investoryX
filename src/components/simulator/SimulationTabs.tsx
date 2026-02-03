import { GoPlus, GoX } from "react-icons/go";

interface Simulation {
  id: string;
  name: string;
}

interface SimulationTabsProps {
  simulations: Simulation[];
  activeSimulationId: string;
  onSelectSimulation: (id: string) => void;
  onCloseSimulation?: (id: string) => void;
  onAddSimulation: () => void;
}

export function SimulationTabs({
  simulations,
  activeSimulationId,
  onSelectSimulation,
  onCloseSimulation,
  onAddSimulation,
}: SimulationTabsProps) {
  return (
    <div className="bg-light flex items-end border-b border-gray/20 relative z-0">
      {simulations.map((simulation) => (
        <div
          key={simulation.id}
          onClick={() => onSelectSimulation(simulation.id)}
          className={`
            group relative flex items-center gap-1.5 px-3 py-2 rounded-t-lg cursor-pointer
            min-w-[140px] max-w-[200px]
            ${
              activeSimulationId === simulation.id
                ? 'bg-white text-dark shadow-sm'
                : 'bg-light text-gray hover:bg-white/50'
            }
          `}
        >
          <span className="flex-1 truncate text-[13px]">{simulation.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCloseSimulation(simulation.id);
            }}
            className="opacity-0 group-hover:opacity-100 hover:bg-light rounded-full p-0.5 transition-opacity"
          >
            <GoX className="size-3" />
          </button>
        </div>
      ))}
      <button
        onClick={onAddSimulation}
        className="p-1.5 text-gray hover:bg-white/50 rounded-full ml-2 mb-1"
      >
        <GoPlus className="size-3.5" />
      </button>
    </div>
  );
}
