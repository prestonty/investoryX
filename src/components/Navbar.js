"use client";

import { React, useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
    return(
        <div className="flex justify-between items-center px-[4%]">
            {/* <img src="" className="" alt="article thumbnail"/> */}

            <div className="flex w-[22rem] justify-between">
                <Link
                    className="w-100 text-center text-dark text-xl"
                    href="/latest-news">
                    Latest News
                </Link>

                <Link
                    className="w-100 text-center text-dark text-xl"
                    href="/dashboard">
                    Dashboard
                </Link>
                <Link
                    className="w-100 text-center text-dark text-xl"
                    href="/watch-list">
                    Watch List
                </Link>
            </div>

            {/* It should display log out or log in */}
            <div className="flex">
            <p className="text-dark">Log Out</p>
            </div>
        </div>
    );
}