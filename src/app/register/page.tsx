"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
export default function Register() {
    return (
        <div className="bg-light my-auto h-[100vh]">
            <div className="h-[80%] w-[50%] mx-auto my-auto flex flex-col">
                <h1 className="text-dark text-6xl font-extrabold text-center mt-[8%]">
                    Register
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

                <hr className="h-[2px] mt-16 text-gray" />

                {/* Register Form */}
                <div className="flex justify-between gap-x-4">
                    <div className="w-1/2 mt-10">
                        <form className="text-dark flex flex-col">
                            <label className="text-lg">Name</label>
                            <input
                                className="border-2 border-gray px-4 py-2 rounded-[30px] bg-transparent"
                                type="text"
                                id="name"
                                name="name"
                            />
                            <label className="text-lg text-dark mt-4">
                                Email
                            </label>
                            <input
                                className="border-2 border-gray px-4 py-2 rounded-[30px] bg-transparent"
                                type="text"
                                id="email"
                                name="email"
                            />

                            <label className="text-lg text-dark mt-4">
                                Password
                            </label>

                            <input
                                className="border-2 border-gray px-4 py-2 rounded-[30px] bg-transparent"
                                type="text"
                                id="password"
                                name="email"
                            />

                            <input
                                type="submit"
                                className="border-2 border-gray px-4 py-2 rounded-[30px] bg-transparent mt-8 w-[50%] text-lg text-dark hover:text-white hover:bg-gray transition-colors duration-500"
                                value="Register"
                            />
                        </form>
                    </div>

                    <div className="flex flex-col gap-y-4 mt-8">
                        <motion.div
                            initial={{ scale: 1 }}
                            whileHover={{
                                rotate: [-15, 15, -15],
                                transition: {
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatType: "loop",
                                },
                            }}
                            transition={{ duration: 4 }}
                        >
                            <Image
                                src="/login/bull-logo.svg"
                                width={300}
                                height={300}
                                alt="bull logo"
                                className="scale-x-[-1]"
                            />
                        </motion.div>
                        <div className="flex justify-center">
                            <Link
                                className="w-fit px-4 py-2 m-2 rounded-[30px] border-2 border-gray text-dark text-xl text-center hover:text-white hover:bg-gray transition-colors duration-500"
                                href="/login"
                            >
                                Back to login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
