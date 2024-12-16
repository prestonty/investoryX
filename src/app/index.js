"use client";
import Button from "../components/Button";
import "../styles/animations.css";

import React, { useState, useEffect } from "react";

export default function Landing() {
    return (
        <div>
            {/* This should be the same size as the window height (triangle) */}
            <div className="fixed h-full w-screen bg-[#e8ebed]">
                <div className="absolute inset-0 overflow-hidden">
                    {/* Holy fuck I stole this from spellbrush's source code */}
                    {/* They did not use SVG, they decided to rotate a div */}

                    {/* Black Triangle */}
                    {/* <motion.div
                        initial={{ left: -200, bottom: -200 }}
                        animate={{ left: "12%", bottom: 0 }}
                        transition={{
                            duration: 0.8,
                            delay: 0.5,
                            ease: [0, 0.71, 0.2, 1.01],
                        }}
                    > */}
                    {/* <div
                        className="absolute h-[200vmax]
                    w-[200vmax] origin-bottom-left rotate-[30deg]
                    bg-[#181D2A] md:rotate-[60deg] black-triangle"
                    ></div> */}
                    <div
                        className="black-in absolute bottom-0 left-[12%] h-[200vmax]
                    w-[200vmax] origin-bottom-left rotate-[30deg]
                    bg-[#181D2A] md:rotate-[60deg] black-triangle"
                    ></div>
                    {/* </motion.div> */}

                    {/* Blue Triangle */}
                    <div className="blue-in absolute bottom-0 right-[75%] hidden h-[200vmax] w-[200vmax] origin-bottom-right rotate-[-30deg] bg-[#748EFE] outline-dashed outline-offset-[-3.25px] outline-[#748EFE] md:block"></div>
                </div>

                <div className="absolute text-[#fff] bottom-[5%] right-[7%] h-[50%]">
                    <h1 className="text-8xl mb-[40%]">Investory</h1>
                    <div className="w-[80%] m-auto">
                        <Button
                            className="w-100 text-center text-3xl border-[#fff] py-2 mb-[15%]"
                            route="/dashboard"
                            text="Get Started"
                        ></Button>
                        <Button
                            className="w-100 text-center text-3xl border-[#fff] py-2 my-4"
                            route="/login"
                            text="Login"
                        ></Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
