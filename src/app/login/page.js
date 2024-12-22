"use client";
// Show both sign in and login using if statements
import GoogleButton from "react-google-button";
import "./login.css";

export default function Login() {
    return (
        <div className="bg-light my-auto h-[100vh]">
            <div className="h-[80%] w-[50%] mx-auto my-auto flex flex-col">
                <h1 className="text-dark text-6xl font-extrabold text-center mt-[8%]">
                    Login
                </h1>

                {/* Google Button (adding nested tags may affect css styling in login.css) */}
                <div className="google-container flex justify-center mt-[8%] mr-[2rem]">
                    <GoogleButton
                        onClick={() => {
                            console.log("Google button clicked");
                        }}
                    />
                    <p className="relative top-[28%] ml-[-11rem] text-dark">
                        Sign in With Google
                    </p>
                </div>

                <hr className="h-[2px] mt-16 text-gray" />

                {/* Login Form */}
                <div className="flex justify-between">
                    <div className="w-[40%] mt-16">
                        <form className="text-dark flex flex-col">
                            {/* <label className="text-lg">Name</label>
                        <input
                            className="border-2 border-gray px-4 py-2 rounded-[30px] bg-transparent"
                            type="text"
                            id="name"
                            name="name"
                        /> */}
                            <label className="text-lg text-dark">Email</label>
                            <input
                                className="border-2 border-gray px-4 py-2 rounded-[30px] bg-transparent"
                                type="text"
                                id="email"
                                name="email"
                            />

                            <label className="text-lg text-dark mt-8">
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
                                className="border-2 border-gray px-4 py-2 rounded-[30px] bg-transparent mt-8 w-[50%] text-lg text-dark"
                                value="Login"
                            />
                        </form>
                    </div>

                    <div className="w-[50%] mt-16">
                        <button className="bg-white w-[100%] h-[100%] rounded-[30px] shadow-md flex flex-col justify-center items-center">
                            <p className="text-xl text-dark text-center">
                                Don't Have an Account?
                            </p>
                            <p className="text-xl text-dark mt-4 text-center">
                                Sign Up!
                            </p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
