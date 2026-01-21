"use client";

import { motion } from "framer-motion";
import { Carrot, Grape, ShieldCheck, Ship, Globe, Zap } from "lucide-react";

const lightServices = [
    {
        icon: <Grape className="w-8 h-8 text-green-600" />,
        title: "Fresh Fruits",
        description: "Premium citrus, exotic tropicals, and seasonal favorites sourced directly from global orchards.",
    },
    {
        icon: <Carrot className="w-8 h-8 text-green-600" />,
        title: "Organic Veggies",
        description: "Farm-fresh organic greens and root vegetables grown with sustainable agricultural practices.",
    },
    {
        icon: <ShieldCheck className="w-8 h-8 text-green-600" />,
        title: "Quality Assurance",
        description: "Rigorous testing and certification for every shipment to ensure maximum safety and freshness.",
    },
];

const darkServices = [
    {
        icon: <Ship className="w-8 h-8 text-green-400" />,
        title: "Export Logistics",
        description: "Seamless global shipping and customs handling for temperature-sensitive produce.",
    },
    {
        icon: <Zap className="w-8 h-8 text-green-400" />,
        title: "Fast Supply Chain",
        description: "Optimized routes and rapid transit to ensure farm-to-table freshness within 48 hours.",
    },
    {
        icon: <Globe className="w-8 h-8 text-green-400" />,
        title: "Global Network",
        description: "Connecting growers with premium retailers and wholesalers across five continents.",
    },
];

export default function LandingServices() {
    return (
        <div id="services">
            {/* Light Services Section */}
            <section className="py-24 bg-[#E8F5E9]/30">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-green-900 mb-12">Premium Fruit & Vegetable Equipment</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {lightServices.map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center"
                            >
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-bold text-green-900 mb-4">{service.title}</h3>
                                <p className="text-gray-600 mb-6">{service.description}</p>
                                <button className="text-green-700 font-semibold hover:underline">Read more</button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Dark Services Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-[#0A332B] mb-12">Global Trading Solutions</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {darkServices.map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-[#0A332B] p-8 rounded-2xl shadow-xl flex flex-col items-center text-white text-center"
                            >
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                                <p className="text-green-100/70 mb-6">{service.description}</p>
                                <button className="text-green-400 font-semibold hover:underline">Read more</button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
