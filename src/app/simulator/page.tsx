import SimulatorClient from "./SimulatorClient";

export default async function SimulatorPage() {
    return (
        <SimulatorClient
            initialSimulations={[]}
            initialActiveSimulationId={null}
        />
    );
}
