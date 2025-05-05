"use client";

import React, { useState, useEffect } from "react";

export default function StockWatchItem() {
    return(
        <div className="flex flex-col text-dark gap-y-1">
            <div className="flex justify-between justify-between">
                {/* Stock Symbol */}
                <p className="font-semibold">Dow Jones</p>
                <p className="">41,317.43</p>
            </div>

            <div className="flex justify-between items-center">
                <p className="">Dow Jones Industrial Average</p>
                <div className="bg-lightgreen rounded-[16px] border-radius py-2 px-4">
                    <p className="text-light">+564.47</p>
                </div>
            </div>

        </div>
    );
}