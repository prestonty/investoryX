import { useEffect, useRef, useState } from "react";
import { GoPlus, GoX } from "react-icons/go";

interface Simulation {
  id: number;
  name: string;
}

interface SimulationTabsProps {
  simulations: Simulation[];
  activeSimulationId: number | null;
  onSelectSimulation: (id: number) => void;
  onCloseSimulation?: (id: number) => void;
  onAddSimulation: () => void;
  onRenameSimulation?: (id: number, name: string) => void;
  isBusy?: boolean;
}

export function SimulationTabs({
  simulations,
  activeSimulationId,
  onSelectSimulation,
  onCloseSimulation,
  onAddSimulation,
  onRenameSimulation,
  isBusy = false,
}: SimulationTabsProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingId !== null) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editingId]);

  const startEditing = (id: number, name: string) => {
    if (isBusy) return;
    setEditingId(id);
    setDraftName(name);
  };

  const commitEditing = (id: number, name: string) => {
    const nextName = name.trim();
    setEditingId(null);
    if (!nextName) return;
    if (onRenameSimulation) {
      onRenameSimulation(id, nextName);
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  return (
    <div className="bg-light flex items-end border-b border-gray/20 relative z-0">
      {simulations.map((simulation) => (
        <div
          key={simulation.id}
          onClick={() => {
            if (isBusy) return;
            onSelectSimulation(simulation.id);
          }}
          onDoubleClick={() => startEditing(simulation.id, simulation.name)}
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
          {editingId === simulation.id ? (
            <input
              ref={inputRef}
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onBlur={() => commitEditing(simulation.id, draftName)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commitEditing(simulation.id, draftName);
                }
                if (event.key === "Escape") {
                  event.preventDefault();
                  cancelEditing();
                }
              }}
              className="flex-1 min-w-0 rounded-sm bg-white/90 px-1.5 py-0.5 text-[13px] text-dark outline-none ring-1 ring-blue/60"
              maxLength={40}
            />
          ) : (
            <span className="flex-1 truncate text-[13px]">
              {simulation.name}
            </span>
          )}
          <button
            disabled={isBusy}
            onClick={(e) => {
              e.stopPropagation();
              if (isBusy) return;
              onCloseSimulation?.(simulation.id);
            }}
            className="opacity-0 group-hover:opacity-100 hover:bg-light rounded-full p-0.5 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GoX className="size-3" />
          </button>
        </div>
      ))}
      <button
        disabled={isBusy}
        onClick={onAddSimulation}
        className="p-1.5 text-gray hover:bg-white/50 rounded-full ml-2 mb-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <GoPlus className="size-3.5" />
      </button>
    </div>
  );
}
