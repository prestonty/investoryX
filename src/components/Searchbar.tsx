"use client";
import React from "react";
import Select, { components } from "react-select";
import { FaSearch } from "react-icons/fa";

interface SearchbarProps {
    options: { value: string; label: string }[];
    onChange: (selectedOption: { value: string; label: string } | null) => void;
}

// TODO recreate this component using a better component not a select!!!

export default function Searchbar(props: SearchbarProps) {
    return (
        <div className="min-w-52 flex justify-center items-center w-fit">
            <Select
                options={props.options}
                onChange={props.onChange}
                className="w-full max-w-52"
                placeholder="Search stocks"
                components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                    Control: (controlProps) => {
                        // TODO add animations to this icon (rotation, colour change, etc.)
                        return (
                            <components.Control {...controlProps}>
                                <FaSearch className="text-black" size={24} />
                                {controlProps.children}
                            </components.Control>
                        );
                    },
                }}
                styles={{
                    control: (provided: any, state: any) => ({
                        ...provided,
                        borderRadius: "100px",
                        borderWidth: "2px",
                        borderColor: state.isFocused
                            ? "#748EFE"
                            : "transparent",
                        backgroundColor: "transparent",
                        paddingLeft: "1rem",
                        minHeight: "3rem",
                        fontSize: "1rem",
                        overflowX: "auto",
                        scrollbarWidth: "none",
                    }),
                    valueContainer: (provided) => ({
                        ...provided,
                        flexWrap: "nowrap",
                        overflowX: "auto",
                        scrollbarWidth: "none",
                    }),
                    input: (provided) => ({
                        ...provided,
                        overflowX: "auto",
                        maxWidth: "100%",
                        scrollbarWidth: "none",
                    }),
                    placeholder: (provided: any) => ({
                        ...provided,
                        color: "black", // tailwind: text-gray-500
                        fontSize: "1.3rem",
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
