import Navbar from "@/components/Navbar";

export default function SimulatorPage() {
    return (
        <div className="bg-light font-[family-name:var(--font-geist-sans)] min-h-screen">
            <Navbar search={false} />
            <div className="mx-auto max-w-4xl px-6 py-10 text-dark">
                <h1 className="text-3xl font-semibold mb-4">Simulator</h1>
                <p className="text-lg">
                    This is a placeholder for the simulator experience.
                </p>
            </div>
        </div>
    );
}
