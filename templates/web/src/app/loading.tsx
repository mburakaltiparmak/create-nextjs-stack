"use client";

import { motion } from "framer-motion";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden relative">
            {/* Background Grid Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />

            <motion.div
                className="relative z-10 flex flex-col items-center gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Tech Spinner */}
                <div className="relative w-24 h-24">
                    <motion.div
                        className="absolute inset-0 border-4 border-red-600/30 rounded-full"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute inset-0 border-4 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="absolute inset-4 border-2 border-white/10 rounded-full" />
                    <motion.div
                        className="absolute inset-[30%] bg-red-600 rounded-full"
                        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                </div>

                {/* Text */}
                <div className="flex flex-col items-center gap-2">
                    <motion.span
                        className="font-jersey-10 text-2xl text-white tracking-[0.2em]"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        LOADING
                    </motion.span>
                    <div className="flex gap-1 h-1">
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="w-8 h-full bg-red-600/50"
                                animate={{ scaleX: [0, 1, 0], opacity: [0, 1, 0] }}
                                transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
