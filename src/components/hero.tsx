"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#0A332B]">
      {/* Wave Background */}
      <div className="absolute inset-0 z-0">
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillOpacity="1"
            fill="#1A534B"
            d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,202.7C960,224,1056,224,1152,197.3C1248,171,1344,117,1392,90.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-white max-w-2xl"
          >
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Premium Fresh Produce <br />
              <span className="text-green-400">Export & Import</span>
            </h1>
            <p className="text-xl text-green-100/80 mb-10 leading-relaxed">
              KTF Vegetable and Fruits delivers the world's finest produce from farm to table.
              Connecting global growers with premium markets through a seamless supply chain.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-white text-[#0A332B] font-semibold rounded-full hover:bg-green-50 transition-colors shadow-lg"
              >
                Get Started
              </Link>
              <Link
                href="#services"
                className="px-8 py-4 border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex-1 relative"
          >
            <div className="relative w-80 h-80 lg:w-[500px] lg:h-[500px] mx-auto">
              <div className="absolute inset-0 rounded-full border-[15px] border-white/10 animate-pulse" />
              <div className="absolute inset-4 rounded-full overflow-hidden border-8 border-white bg-white shadow-2xl">
                <Image
                  src="/images/hero_produce.png"
                  alt="Fresh Produce"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Decorative circle icon */}
              <div className="absolute top-0 right-10 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center -rotate-12">
                <div className="w-10 h-10 border-2 border-green-600 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-0.5 bg-green-600 rotate-45 absolute" />
                  <div className="w-6 h-0.5 bg-green-600 -rotate-45 absolute" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Indicators */}
        <div className="mt-20 flex items-center gap-8 text-white/50 font-mono text-sm">
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-white" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
          </div>
          <div className="flex gap-8">
            <span className="text-white border-b border-white">01</span>
            <span>02</span>
            <span>03</span>
          </div>
        </div>
      </div>
    </div>
  );
}
