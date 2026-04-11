import { cookies } from "next/headers";
import SimulatorClient from "./SimulatorClient";

export default async function SimulatorPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    const isGuest = !token && cookieStore.get("guest_mode")?.value === "true";

    return (
        <SimulatorClient
            initialSimulations={[]}
            initialActiveSimulationId={null}
            isGuest={isGuest}
        />
    );
}
