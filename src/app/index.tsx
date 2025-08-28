"use client";
import NavButton from "@/components/NavButton";
import "@/styles/animations.css";

import { useState, useEffect } from "react";
import MagneticWrapper from "@/components/animations/MagneticWrapper";
import { motion } from "framer-motion";

export default function Landing() {
    return (
        <div>
            <div className='fixed h-full w-screen bg-light'>
                <div className='absolute inset-0 overflow-hidden'>
                    {/* Black Triangle */}
                    <div
                        className='black-in absolute bottom-0 left-[12%] h-[200vmax]
                    w-[200vmax] origin-bottom-left rotate-[30deg]
                    bg-dark md:rotate-[60deg] black-triangle'
                    ></div>

                    {/* Blue Triangle */}
                    <div className='blue-in absolute bottom-0 right-[75%] hidden h-[200vmax] w-[200vmax] origin-bottom-right rotate-[-30deg] bg-blue outline-dashed outline-offset-[-3.25px] outline-[#748EFE] md:block'></div>
                </div>

                <MagneticWrapper>
                    <motion.img
                        className='ml-[18rem] mt-[5rem] w-[18%] z-10'
                        src='/landing/ani-bull.webp'
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            delay: 0.7,
                            duration: 0.35,
                            type: "spring",
                            stiffness: 200,
                            damping: 16,
                        }}
                    />
                </MagneticWrapper>

                <div className='absolute text-white bottom-[5%] right-[7%] h-[50%]'>
                    <h1 className='text-6xl md:text-8xl mb-[35%] px-8 py-2 border-2 border-light 2xl:border-dark bg-dark rounded-full'>
                        InvestoryX
                    </h1>
                    <div className='w-fit m-auto flex flex-col'>
                        <NavButton
                            route='/dashboard'
                            text='Get Started'
                            className='px-10'
                        ></NavButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
