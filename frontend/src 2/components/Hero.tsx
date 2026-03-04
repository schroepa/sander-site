import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export const Hero = () => {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
            {/* Background Gradient Mesh */}
            <div className="absolute inset-0 z-0 opacity-30 select-none pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[128px]" />
            </div>

            <div className="container relative z-10 px-6 text-center flex flex-col items-center gap-8">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border backdrop-blur-sm text-sm font-medium text-secondary-foreground"
                >
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Available for new projects
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter max-w-4xl bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent"
                >
                    Elevate Your <br /> Digital Experience.
                </motion.h1>

                {/* Subline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
                >
                    Crafting premium web experiences with precision logic and fluid aesthetics.
                    Built for speed, designed for impact.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center gap-4 mt-4"
                >
                    <Button size="lg" className="h-12 px-8 rounded-full text-base group">
                        Start Building
                        <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button variant="outline" size="lg" className="h-12 px-8 rounded-full text-base bg-background/50 backdrop-blur-sm">
                        <Sparkles className="mr-2 w-4 h-4" />
                        View Showcase
                    </Button>
                </motion.div>

                {/* Floating UI Elements / Dashboard Preview simulation */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                    className="mt-16 w-full max-w-5xl rounded-xl border border-border/50 bg-background/50 backdrop-blur-xl shadow-2xl overflow-hidden aspect-video relative group"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
                    <div className="flex items-center gap-2 border-b border-border/50 p-4 bg-muted/20">
                        <div className="w-3 h-3 rounded-full bg-red-400/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                        <div className="w-3 h-3 rounded-full bg-green-400/80" />
                    </div>
                    <div className="p-8 flex items-center justify-center h-full text-muted-foreground/30 font-mono text-sm">
                        [Interactive Dashboard Preview Mockup]
                    </div>
                </motion.div>

            </div>
        </section>
    );
};
