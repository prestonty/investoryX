import { GoPlus, GoX } from "react-icons/go";

interface Simulation {
  id: string;
  name: string;
}

interface SimulationTabsProps {
  simulations: Simulation[];
  activeSimulationId: string;
  onSelectSimulation: (id: string) => void;
  onCloseSimulation: (id: string) => void;
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
    <div className="bg-[#E8EBED] flex items-end px-2 pt-2 border-b border-[#7E8391]/20">
      {simulations.map((simulation) => (
        <div
          key={simulation.id}
          onClick={() => onSelectSimulation(simulation.id)}
          className={`
            group relative flex items-center gap-2 px-4 py-2.5 rounded-t-lg cursor-pointer
            min-w-[180px] max-w-[240px]
            ${
              activeSimulationId === simulation.id
                ? 'bg-white text-[#181D2A] shadow-sm'
                : 'bg-[#E8EBED] text-[#7E8391] hover:bg-white/50'
            }
          `}
        >
          <span className="flex-1 truncate text-sm">{simulation.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCloseSimulation(simulation.id);
            }}
            className="opacity-0 group-hover:opacity-100 hover:bg-[#E8EBED] rounded-full p-0.5 transition-opacity"
          >
            <GoX className="size-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={onAddSimulation}
        className="p-2 text-[#7E8391] hover:bg-white/50 rounded-full ml-2 mb-2"
      >
        <GoPlus className="size-4" />
      </button>
    </div>
  );
}
