import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import Mission from "@/components/mission";
import LandingServices from "@/components/landing-services";
import { ArrowUpRight, CheckCircle2, Shield, Users, Zap, Globe, Package, Heart } from 'lucide-react';
import { createClient } from "../../supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Mission />
      <LandingServices />

      {/* Stats Section */}
      <section className="py-24 bg-[#0A332B] text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="space-y-2">
              <div className="text-5xl font-bold text-green-400">QAR 15M+</div>
              <div className="text-green-100/70 text-lg">Gross Trade Volume</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold text-green-400">10,000+</div>
              <div className="text-green-100/70 text-lg">Happy Customers Worldwide</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold text-green-400">99.9%</div>
              <div className="text-green-100/70 text-lg">Quality & Freshness Guaranteed</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-green-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-green-900 mb-6">Ready to Experience the Best Produce?</h2>
          <p className="text-gray-600 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
            Join hundreds of global businesses that trust KTF Vegetable and Fruits for their supply chain needs.
          </p>
          <a href="/dashboard" className="inline-flex items-center px-10 py-4 text-white bg-green-700 rounded-full hover:bg-green-800 transition-all shadow-lg text-lg font-medium">
            Get Started Now
            <ArrowUpRight className="ml-2 w-5 h-5" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
