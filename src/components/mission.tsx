"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Mission() {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold text-green-900 mb-4">Our Mission</h2>
                    <div className="w-20 h-1 bg-green-500 mx-auto" />
                </motion.div>

                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="flex-1"
                    >
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                            <Image
                                src="/images/mission_farm.png"
                                alt="Our Farm"
                                width={600}
                                height={400}
                                className="w-full aspect-[4/3] object-cover"
                            />
                            <div className="absolute inset-0 bg-green-900/10 hover:bg-transparent transition-colors duration-500" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="flex-1 space-y-6"
                    >
                        <p className="text-lg text-gray-700 leading-relaxed italic">
                            "We believe that everyone deserves access to the freshest, highest quality produce, no matter where they are in the world."
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            At KTF Vegetable and Fruits, we fight for food quality balance focusing on renewable energy and farm performance.
                            Every day, we are dedicated to shape a creative FOOD & AGRICULTURE hub of experts, reliable technologies and
                            innovative solutions towards a greener planet.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            KTF brings to the global market green produce equipment suppliers of a global status. We compile & manage
                            investment portfolios of fresh resources and relevant infrastructure. We undertake complex export projects
                            that require high degree of coordination and demanding management.
                        </p>
                        <div className="pt-4">
                            <button className="px-6 py-3 border-2 border-green-700 text-green-700 font-semibold rounded-full hover:bg-green-700 hover:text-white transition-all">
                                Read Our Story
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
