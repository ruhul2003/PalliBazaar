"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Leaf, Users, ShieldCheck, Heart, Tractor, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  const values = [
    {
      icon: Tractor,
      title: "Empowering Farmers",
      desc: "We give rural farmers direct digital storefronts, bypassing middlemen to secure 100% of their market value."
    },
    {
      icon: ShieldCheck,
      title: "Formalin-Free Quality",
      desc: "Our products are shipped directly from farms, ensuring natural organic quality and complete safety."
    },
    {
      icon: Users,
      title: "Community Trust",
      desc: "Building a transparent Bridge between urban households in Dhaka and rural farmers across Bangladesh."
    },
    {
      icon: Heart,
      title: "Fair Pricing",
      desc: "Eliminating commissions and unfair negotiations, ensuring fair retail prices for buyers and optimal yields for sellers."
    }
  ];

  return (
    <div className="min-h-[calc(100vh-75px)] bg-bg-sand font-sans pb-16">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#275239] via-[#467756] to-[#76aa7b] text-white py-16 md:py-20 text-center">
        <div className="container max-w-[800px] mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-5"
          >
            <Leaf className="w-4 h-4 text-accent" />
            <span>Our Mission & Vision</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl font-black mb-6 leading-tight"
          >
            Empowering Rural Bangladesh Through Direct Trade
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/85 text-base sm:text-lg max-w-xl mx-auto font-light leading-relaxed"
          >
            PalliBazaar is a direct farm-to-table platform connecting Bangladeshi farmers and artisans with urban buyers. No middlemen, no markup.
          </motion.p>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="container max-w-[950px] mx-auto px-6 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-white border border-border-light rounded-3xl p-8 sm:p-12 shadow-sm">
          <div>
            <h2 className="font-serif text-3xl font-bold text-primary mb-5">Our Story</h2>
            <p className="text-text-muted text-sm leading-relaxed mb-4">
              In Bangladesh, rural farmers labor in fields, only to have their profit margins sliced away by layers of local wholesalers, brokers, and retail merchants. Urban buyers, on the other hand, pay inflated retail prices for produce that is often sprayed with preservatives for longer shelf lives.
            </p>
            <p className="text-text-muted text-sm leading-relaxed mb-6">
              PalliBazaar was built to solve this challenge. By giving village farmers, honey collectors, and traditional cottage artisans direct access to a digital storefront, we ensure direct payments go back into the hands of the true producers.
            </p>
            <div className="flex gap-4">
              <Link 
                href="/shop" 
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white hover:bg-primary-hover font-bold rounded-lg text-sm transition"
              >
                Explore Shop <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden h-[300px] shadow-md border border-border-light">
            <Image 
              src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=800" 
              alt="Bangladeshi farmer green fields" 
              className="w-full h-full object-cover" 
              width={800}
              height={800}
            />
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="container max-w-[950px] mx-auto px-6 pt-16">
        <h2 className="font-serif text-3xl font-bold text-primary text-center mb-10">Our Core Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {values.map((val, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="bg-white border border-border-light rounded-2xl p-6 sm:p-8 hover:border-secondary transition shadow-sm"
            >
              <div className="w-12 h-12 bg-primary-light text-primary rounded-xl flex items-center justify-center mb-5 border border-primary/10">
                <val.icon className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-text-earth mb-2">{val.title}</h3>
              <p className="text-text-muted text-xs leading-relaxed">{val.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container max-w-[950px] mx-auto px-6 pt-16">
        <div className="bg-gradient-primary rounded-[2rem] p-8 sm:p-12 text-center text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="font-serif text-3xl font-bold mb-4">Support Local Farmers Today</h2>
            <p className="text-white/80 text-sm mb-6 leading-relaxed">
              Every single order on PalliBazaar feeds a local family in the villages of Rajshahi, Jessore, and Kushtia. Join our network of conscious buyers.
            </p>
            <div className="flex justify-center gap-4">
              <Link 
                href="/signup" 
                className="px-6 py-3 bg-white text-primary hover:bg-bg-sand font-bold rounded-xl text-sm transition shadow-sm"
              >
                Join PalliBazaar
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
