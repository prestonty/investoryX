"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function NavButton(props) {
    return (
        <motion.div
        className="rounded-[30px] border-2 w-100 text-center text-3xl border-white py-2"
        initial={{backgroundColor: "#181D2A" }}
        animate={{}}
        transition={{duration: 0.3, ease: "easeOut"}}
        whileHover={{backgroundColor: "#E8EBED", color: "#181D2A", fontWeight: 500, scale:1.05}}
        >
        <Link
            className="flex w-full h-full justify-center"
            href={props.route}
        >
            {props.text}
        </Link>
        </motion.div>
    );
}
