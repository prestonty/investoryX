"use client";

import { useState, type InputHTMLAttributes } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

// A password field with a button to show or hide what's been typed.
export default function PasswordInput({
    className = "",
    ...props
}: PasswordInputProps) {
    const [visible, setVisible] = useState<boolean>(false);

    return (
        <div className='relative w-fit'>
            <input
                {...props}
                type={visible ? "text" : "password"}
                // Room for the toggle; hide Edge's built-in reveal button so there aren't two.
                className={`${className} pr-12 [&::-ms-reveal]:hidden`}
            />
            <button
                type='button'
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Hide password" : "Show password"}
                aria-pressed={visible}
                className='absolute right-4 top-1/2 -translate-y-1/2 text-gray hover:text-blue transition-colors duration-300'
            >
                {visible ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
        </div>
    );
}
