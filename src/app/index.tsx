"use client";
import NavButton from "@/components/NavButton";
import "../styles/animations.css";

import { useState, useEffect } from "react";
import MagneticWrapper from "@/components/MagneticWrapper";
import { motion } from "framer-motion"

export default function Landing() {
    return (
        <div>
            <div className="fixed h-full w-screen bg-light">
                <div className="absolute inset-0 overflow-hidden">
                    {/* Black Triangle */}
                    <div
                        className="black-in absolute bottom-0 left-[12%] h-[200vmax]
                    w-[200vmax] origin-bottom-left rotate-[30deg]
                    bg-dark md:rotate-[60deg] black-triangle"
                    ></div>

                    {/* Blue Triangle */}
                    <div className="blue-in absolute bottom-0 right-[75%] hidden h-[200vmax] w-[200vmax] origin-bottom-right rotate-[-30deg] bg-blue outline-dashed outline-offset-[-3.25px] outline-[#748EFE] md:block"></div>
                </div>

                <MagneticWrapper>
                    <motion.img 
                    className="ml-[18rem] mt-[5rem] w-[18%]"
                    src="/ani-bull.png"
                    initial={{scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.35, type: "spring", stiffness: 200, damping: 16, }}
                    />
                </MagneticWrapper>

                <div className="absolute text-white bottom-[5%] right-[7%] h-[50%]">
                    <h1 className="text-8xl mb-[40%]">Investory</h1>
                    <div className="w-[80%] m-auto flex flex-col">
                        <NavButton
                            className="w-100 text-center text-3xl border-white py-2 mb-[15%]"
                            route="/dashboard"
                            text="Get Started"
                        ></NavButton>
                        {/* <NavButton
                            className="w-100 text-center text-3xl border-white py-2 my-4"
                            route="/login"
                            text="Login"
                        ></NavButton> */}
                    </div>
                </div>
            </div>
        </div>
    );
}
