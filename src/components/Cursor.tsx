"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

const Cursor = () => {
    const cursorRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const mouseMove = (e) => {
            setPosition({
                x: e.clientX,
                y: e.clientY,
            });
        };

        window.addEventListener("mousemove", mouseMove);

        return () => {
            window.removeEventListener("mousemove", mouseMove);
        };
    }, []);

    return (
        <div
            className='fixed top-0 left-0 z-[9999] pointer-events-none w-4 h-4'
            style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            }}
        >
            <Image
                src='/cursor.png'
                alt='Custom Cursor'
                layout='fill'
                objectFit='contain'
            />
        </div>
    );
};

export default Cursor;
