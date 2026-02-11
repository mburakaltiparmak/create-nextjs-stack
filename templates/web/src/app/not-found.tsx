"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-black text-white relative overflow-hidden">
            {/* Background Grid Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)] pointer-events-none" />

            <div className="relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                >
                    <h1 className="text-[150px] md:text-[200px] font-jersey-10 font-bold text-red-600 leading-none select-none relative">
                        <span className="relative z-10">404</span>
                        <motion.span
                            className="absolute top-0 left-0 text-red-600/50 z-0"
                            animate={{ x: [-2, 2, -2], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 0.1, repeat: Infinity, repeatType: "mirror" }}
                        >
                            404
                        </motion.span>
                        <motion.span
                            className="absolute top-0 left-0 text-white/20 z-0"
                            animate={{ x: [2, -2, 2], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 0.15, repeat: Infinity, repeatType: "mirror" }}
                        >
                            404
                        </motion.span>
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="h-[1px] w-12 bg-red-600/50" />
                        <h2 className="text-xl md:text-2xl font-outfit font-bold tracking-widest uppercase text-white/80">
                            System Error
                        </h2>
                        <div className="h-[1px] w-12 bg-red-600/50" />
                    </div>

                    <p className="text-white/60 mb-10 max-w-md mx-auto font-roboto">
                        An error occurred
                    </p>

                    <Link
                        href="/"
                        className="group relative inline-flex items-center justify-center px-8 py-4 overflow-hidden font-bold text-white transition-all duration-300 bg-red-600 rounded-sm hover:bg-red-700 focus:outline-none focus:ring focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                        <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                        <span className="relative font-outfit tracking-wider">
                            Back to Home Page
                        </span>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
