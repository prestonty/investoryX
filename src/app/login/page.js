"use client";
// Show both sign in and login using if statements
import GoogleButton from "react-google-button";
import "./login.css";

export default function Login() {
    return (
        <div className="bg-light my-auto h-[100vh]">
            <div className="h-[80%] w-[80%] mx-auto my-auto flex flex-col">
                <h1 className="text-dark text-6xl font-extrabold text-center mt-[8%]">
                    Login
                </h1>
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
            </div>
        </div>
    );
}
