"use client";
// Show both sign in and login using if statements
import GoogleButton from "react-google-button";
import Image from "next/image";
import Link from "next/link";
import "@/styles/animations.css";

// import { google } from "@/lib/googleClient";
import { useState, useEffect } from "react";

export default function Register() {
    const [isEmailFocused, setIsEmailFocused] = useState<boolean>(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);
    const [isNameFocused, setIsNameFocused] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    return (
        <div className="relative bg-light h-screen flex items-center justify-center">
            {/* Triangle Animations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* TODO - Add a character that appears when user enters their name!! */}

                {/* Blue triangles */}
                {password !== "" && (
                    <>
                        <div
                            className="login-top-blue-tri absolute -top-12 -right-20 h-[16vmax]
                    w-[60vmax] origin-top-right
                    bg-blue rotate-[14deg] blue-triangle"
                        ></div>

                        <div
                            className="login-bot-blue-tri absolute -bottom-12 -left-20 h-[16vmax]
                    w-[60vmax] origin-bottom-left
                    bg-blue rotate-[14deg] blue-triangle"
                        ></div>
                    </>
                )}

                {/* Black triangles */}
                {email !== "" && (
                    <>
                        <div
                            className="login-bot-black-tri absolute -bottom-10 right-56 h-[86vmax]
                    w-[50vmax] origin-bottom-left
                    bg-dark rotate-[76deg] black-triangle"
                        ></div>

                        <div
                            className="login-top-black-tri absolute -top-10 left-56 h-[86vmax]
                    w-[50vmax] origin-top-right
                    bg-dark rotate-[76deg] black-triangle"
                        ></div>
                    </>
                )}
            </div>

            <div className="w-3/4 xl:w-1/2 mx-auto flex flex-col justify-center z-5">
                <h1 className="text-dark text-6xl font-extrabold text-center">
                    Sign Up
                </h1>

                {/* Google Button (adding nested tags may affect css styling in login.css) */}
                {/* <div className="google-container flex justify-center mt-[8%] mr-[2rem]">
                    <GoogleButton
                        onClick={() => {
                            google.signIn();
                        }}
                    />
                    <p className="relative top-[28%] ml-[-11rem] text-dark">
                        Sign in With Google
                    </p>
                </div> */}

                <hr className="h-[2px] mt-16 bg-livid" />

                {/* Login Form */}
                <div className="flex flex-col items-center gap-x-4 mt-10">
                    <form className="w-full text-dark flex flex-col items-center gap-y-4">
                        <div className="flex flex-col text-dark">
                            <label
                                className={`text-lg pl-4 ${
                                    isNameFocused ? "text-blue" : ""
                                } transition-colors duration-500`}
                            >
                                Name
                            </label>
                            <input
                                className="w-72 border-2 border-livid px-4 py-2 rounded-[30px] bg-transparent focus:border-blue focus:outline-none transition-colors duration-500"
                                type="text"
                                id="name"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onFocus={() => {
                                    setIsNameFocused(true);
                                }}
                                onBlur={() => {
                                    setIsNameFocused(false);
                                }}
                            />
                        </div>
                        <div className="flex flex-col text-dark">
                            <label
                                className={`text-lg pl-4 ${
                                    isEmailFocused ? "text-blue" : ""
                                } transition-colors duration-500`}
                            >
                                Email
                            </label>
                            <input
                                className="w-72 border-2 border-livid px-4 py-2 rounded-[30px] bg-transparent focus:border-blue focus:outline-none transition-colors duration-500"
                                type="text"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => {
                                    setIsEmailFocused(true);
                                }}
                                onBlur={() => {
                                    setIsEmailFocused(false);
                                }}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label
                                className={`text-lg pl-4 ${
                                    isPasswordFocused ? "text-blue" : ""
                                } transition-colors duration-500`}
                            >
                                Password
                            </label>

                            <input
                                className="w-72 border-2 border-livid px-4 py-2 rounded-[30px] bg-transparent focus:border-blue focus:outline-none transition-colors duration-500"
                                type="text"
                                id="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => {
                                    setIsPasswordFocused(true);
                                }}
                                onBlur={() => {
                                    setIsPasswordFocused(false);
                                }}
                            />
                        </div>

                        <input
                            type="submit"
                            className="w-40 px-4 py-2 mt-8 rounded-[30px] bg-dark text-lg text-white hover:text-light hover:bg-blue transition-colors duration-500"
                            value="Continue"
                        />
                    </form>
                    <div className="flex justify-center items-center gap-2 text-xl mt-8">
                        <p className="text-dark m-0">
                            Already have an account?
                        </p>
                        <Link
                            className="text-blue text-center hover:text-darkblue transition-colors duration-500"
                            href="/register"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
