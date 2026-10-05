"use client";

import { useEffect, useMemo, useState } from "react";
import type {
    StrategyOption,
    StrategyParamSpec,
    StrategyParams,
} from "@/lib/api";

interface StrategySettingsPanelProps {
    strategy: StrategyOption | undefined;
    // Current settings; keys that are missing fall back to the spec defaults.
    params: StrategyParams;
    disabled: boolean;
    readOnly: boolean;
    // Resolves true when saved; the panel then shows the parent's new params.
    onSave: (params: StrategyParams) => Promise<boolean>;
}

type Draft = Record<string, string>;

function toInput(value: StrategyParams[string] | undefined): string {
    return value === null || value === undefined ? "" : String(value);
}

function draftFrom(specs: StrategyParamSpec[], params: StrategyParams): Draft {
    return Object.fromEntries(
        specs.map((spec) => [spec.name, toInput(params[spec.name] ?? spec.default)]),
    );
}

function validateField(spec: StrategyParamSpec, raw: string): string | null {
    const value = raw.trim();
    if (spec.type === "ticker") {
        return /^[A-Za-z0-9.\-]{0,10}$/.test(value) ? null : "Enter a ticker symbol";
    }
    if (value === "") return "Required";
    const n = Number(value);
    if (!Number.isFinite(n)) return "Enter a number";
    if (spec.type === "integer" && !Number.isInteger(n)) return "Enter a whole number";
    if (spec.min !== undefined && (spec.min_exclusive ? n <= spec.min : n < spec.min)) {
        return spec.min_exclusive ? `Must be above ${spec.min}` : `Must be at least ${spec.min}`;
    }
    if (spec.max !== undefined && (spec.max_exclusive ? n >= spec.max : n > spec.max)) {
        return spec.max_exclusive ? `Must be below ${spec.max}` : `Must be at most ${spec.max}`;
    }
    return null;
}

function parseField(spec: StrategyParamSpec, raw: string): StrategyParams[string] {
    const value = raw.trim();
    if (spec.type === "ticker") return value ? value.toUpperCase() : null;
    return Number(value);
}

function rangeHint(spec: StrategyParamSpec): string {
    const defaultText =
        spec.default === null ? "auto" : String(spec.default);
    if (spec.min === undefined && spec.max === undefined) {
        return `Default ${defaultText}`;
    }
    const low = spec.min === undefined ? "" : `${spec.min_exclusive ? ">" : "≥"} ${spec.min}`;
    const high = spec.max === undefined ? "" : `${spec.max_exclusive ? "<" : "≤"} ${spec.max}`;
    return `Default ${defaultText} · ${[low, high].filter(Boolean).join(", ")}`;
}

export function StrategySettingsPanel({
    strategy,
    params,
    disabled,
    readOnly,
    onSave,
}: StrategySettingsPanelProps) {
    const specs = useMemo(() => strategy?.params ?? [], [strategy]);
    const savedDraft = useMemo(() => draftFrom(specs, params), [specs, params]);
    const [draft, setDraft] = useState<Draft>(savedDraft);
    const [saving, setSaving] = useState(false);

    // Show the saved values whenever the strategy or its stored settings change.
    useEffect(() => setDraft(savedDraft), [savedDraft]);

    if (!strategy || specs.length === 0) return null;

    const errors = Object.fromEntries(
        specs.map((spec) => [spec.name, validateField(spec, draft[spec.name] ?? "")]),
    );
    const isDirty = specs.some((spec) => draft[spec.name] !== savedDraft[spec.name]);
    const isValid = Object.values(errors).every((error) => error === null);
    const locked = disabled || readOnly || saving;

    const save = async (next: StrategyParams) => {
        setSaving(true);
        try {
            await onSave(next);
        } finally {
            setSaving(false);
        }
    };

    const handleSave = () => {
        // Send only values that differ from the defaults, so defaults stay live.
        const changed: StrategyParams = {};
        for (const spec of specs) {
            const value = parseField(spec, draft[spec.name] ?? "");
            if (value !== spec.default) changed[spec.name] = value;
        }
        void save(changed);
    };

    return (
        <div className='bg-white rounded-lg border border-light p-4 shadow-sm'>
            <div className='flex flex-wrap items-baseline justify-between gap-2 mb-3'>
                <h2 className='text-dark'>Strategy Settings</h2>
                <p className='text-xs text-gray'>
                    {strategy.label} · used by live runs and backtests
                </p>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                {specs.map((spec) => {
                    const error = errors[spec.name];
                    const showError = error !== null && draft[spec.name] !== savedDraft[spec.name];
                    return (
                        <label
                            key={spec.name}
                            className='rounded-md bg-light/40 px-3 py-2 text-sm'
                        >
                            <span className='text-gray text-xs'>{spec.label}</span>
                            <input
                                type={spec.type === "ticker" ? "text" : "number"}
                                step={spec.type === "integer" ? 1 : "any"}
                                min={spec.min}
                                max={spec.max}
                                value={draft[spec.name] ?? ""}
                                placeholder={
                                    spec.type === "ticker" ? "Auto (from tracked stocks)" : undefined
                                }
                                disabled={locked}
                                onChange={(e) =>
                                    setDraft((prev) => ({ ...prev, [spec.name]: e.target.value }))
                                }
                                className={`mt-1 w-full rounded border px-2 py-1 text-sm disabled:opacity-60 ${
                                    showError ? "border-red-400" : "border-light"
                                }`}
                            />
                            <span
                                className={`block text-[11px] mt-0.5 ${
                                    showError ? "text-red-500" : "text-gray"
                                }`}
                            >
                                {showError ? error : rangeHint(spec)}
                            </span>
                        </label>
                    );
                })}
            </div>

            <div className='mt-3 flex flex-wrap items-center justify-between gap-2'>
                <p className='text-xs text-gray'>
                    Orders are decided at a trading day&apos;s close and fill at the next
                    day&apos;s open.
                </p>
                {!readOnly && (
                    <div className='flex gap-2'>
                        <button
                            type='button'
                            disabled={locked}
                            onClick={() => void save({})}
                            className='rounded-md border border-light px-3 py-1.5 text-sm text-dark hover:bg-light/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
                        >
                            Reset to defaults
                        </button>
                        <button
                            type='button'
                            disabled={locked || !isDirty || !isValid}
                            onClick={handleSave}
                            className='rounded-md bg-blue px-4 py-1.5 text-sm text-white font-medium hover:bg-blue/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
                        >
                            {saving ? "Saving…" : "Save settings"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
