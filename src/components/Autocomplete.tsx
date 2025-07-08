"use client";
import React from "react";
import Select from "react-select";

interface AutocompleteProps {
    options: { value: string; label: string }[];
    onChange: (selectedOption: { value: string; label: string } | null) => void;
}

export default function Autocomplete(props: AutocompleteProps) {
    return (
        <div className="min-w-52 flex justify-center items-center w-fit">
            <Select
                options={props.options}
                onChange={props.onChange}
                className="w-full"
                styles={{
                    control: (provided: any, state: any) => ({
                        ...provided,
                        borderRadius: "100px",
                        borderWidth: "2px",
                        borderColor: state.isFocused ? "#748EFE" : "white", // tailwind: border-gray-300
                        backgroundColor: state.isFocused ? "white" : "white",
                        paddingLeft: "1rem",
                        boxShadow: state.isFocused
                            ? "0 4px 4px rgba(0,0,0,0.45)"
                            : "0 4px 4px rgba(0,0,0,0.25)",
                        minHeight: "3rem",
                        fontSize: "1rem",
                    }),
                    placeholder: (provided: any) => ({
                        ...provided,
                        color: "black", // tailwind: text-gray-500
                    }),
                    dropdownIndicator: (provided: any) => ({
                        ...provided,
                        padding: "0.5rem",
                    }),
                    indicatorSeparator: () => ({
                        display: "none",
                    }),
                    menu: (provided: any) => ({
                        ...provided,
                        borderRadius: 12,
                        color: "black",
                        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                        width: "100%",
                    }),
                    menuPortal: (provided: any) => ({
                        ...provided,
                        width: "100%",
                        zIndex: 9999,
                    }),
                }}
            />
        </div>
    );
}
