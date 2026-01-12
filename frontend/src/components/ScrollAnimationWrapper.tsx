"use client";

import { motion } from "framer-motion";

type AnimationPreset = "fade-up" | "fade-down" | "fade-right" | "fade-left" | "zoom-in" | "fade-in";

interface ScrollAnimationWrapperProps {
    children: React.ReactNode;
    className?: string;
    preset?: AnimationPreset;
    delay?: number;
    duration?: number;
}

export default function ScrollAnimationWrapper({
    children,
    className = "",
    preset = "fade-up",
    delay = 0,
    duration = 0.5,
}: ScrollAnimationWrapperProps) {
    const getVariants = () => {
        switch (preset) {
            case "fade-up":
                return {
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0 },
                };
            case "fade-down":
                return {
                    hidden: { opacity: 0, y: -50 },
                    visible: { opacity: 1, y: 0 },
                };
            case "fade-right":
                return {
                    hidden: { opacity: 0, x: -50 },
                    visible: { opacity: 1, x: 0 },
                };
            case "fade-left":
                return {
                    hidden: { opacity: 0, x: 50 },
                    visible: { opacity: 1, x: 0 },
                };
            case "zoom-in":
                return {
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { opacity: 1, scale: 1 },
                };
            case "fade-in":
                return {
                    hidden: { opacity: 0 },
                    visible: { opacity: 1 },
                };
            default:
                return {
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0 },
                };
        }
    };

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={getVariants()}
            transition={{ duration, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
