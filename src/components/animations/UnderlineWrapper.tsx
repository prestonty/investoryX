"use client";

import { motion } from "framer-motion";

type Props = {
  children: React.ReactNode;
};

export default function UnderlineWrapper({children} : Props) {
    {/* Need the height value so underline effect does not push object upwards */}
    return(
        <motion.div
            className="h-[1.9rem]"
            whileHover={{ borderBottom: "3px solid #748EFE" }}
            transition={{ duration: 0.08 }}
            >
           {children}
        </motion.div>
    );
}