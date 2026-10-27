"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Package, ShoppingCart, Star, ShieldCheck, Wrench, Sparkles, Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CATEGORIES = ["All", "Equipment", "Consumables", "Instruments", "Lab", "Digital / CAD-CAM", "Sterilization"];

const PRODUCTS = [
  { id: "p1", name: "Dental Chair Unit — Pro X3", brand: "DentMax", cat: "Equipment", price: "₹3,20,000", tag: "Best Seller", img: "https://images.unsplash.com/photo-1728342057953-94bfad8f0e7e?w=600&q=70&auto=format&fit=crop" },
  { id: "p2", name: "LED Curing Light (Cordless)", brand: "OrisTech", cat: "Instruments", price: "₹12,500", tag: "New", img: "https://images.unsplash.com/photo-1698749778813-ad5f2814e50f?w=600&q=70&auto=format&fit=crop" },
  { id: "p3", name: "Composite Resin Kit — 8 Shades", brand: "FillPro", cat: "Consumables", price: "₹8,900", img: "https://images.unsplash.com/photo-1495573020741-8a2f372bbec3?w=600&q=70&auto=format&fit=crop" },
  { id: "p4", name: "Intraoral Scanner — ScanOne", brand: "DigiDent", cat: "Digital / CAD-CAM", price: "₹5,90,000", tag: "Premium", img: "https://images.unsplash.com/photo-1606811856475-5e6fcdc6e509?w=600&q=70&auto=format&fit=crop" },
  { id: "p5", name: "Autoclave Class B 18L", brand: "SteriCare", cat: "Sterilization", price: "₹78,000", img: "https://images.unsplash.com/photo-1704455306925-1401c3012117?w=600&q=70&auto=format&fit=crop" },
  { id: "p6", name: "Zirconia Blocks (Pack of 5)", brand: "LabForge", cat: "Lab", price: "₹22,000", img: "https://images.unsplash.com/photo-1495573020741-8a2f372bbec3?w=600&q=70&auto=format&fit=crop" },
  { id: "p7", name: "Ultrasonic Scaler Handpiece", brand: "OrisTech", cat: "Instruments", price: "₹18,400", img: "https://images.unsplash.com/photo-1698749778813-ad5f2814e50f?w=600&q=70&auto=format&fit=crop" },
  { id: "p8", name: "Digital X-Ray Sensor (Size 2)", brand: "DigiDent", cat: "Digital / CAD-CAM", price: "₹1,45,000", tag: "Best Seller", img: "https://images.unsplash.com/photo-1704455306251-b4634215d98f?w=600&q=70&auto=format&fit=crop" },
  { id: "p9", name: "Impression Material — VPS Kit", brand: "FillPro", cat: "Consumables", price: "₹6,300", img: "https://images.unsplash.com/photo-1606811856475-5e6fcdc6e509?w=600&q=70&auto=format&fit=crop" },
];

export default function Products() {
  const navigate = useNavigate();
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const list = PRODUCTS.filter((p) =>
    (cat === "All" || p.cat === cat) &&
    (!q || p.name.toLowerCase().includes(q.toLowerCase()) || p.brand.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div>
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-14">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-800/60 px-3 py-1 text-xs font-semibold text-emerald-100"><Package className="h-3.5 w-3.5" /> Dental Products Marketplace</span>
          <h1 className="mt-4 font-heading text-4xl sm:text-5xl font-extrabold leading-tight">Equip your practice with<br /><span className="text-amber-400">trusted dental products.</span></h1>
          <p className="mt-4 max-w-2xl text-slate-300">Browse equipment, consumables, instruments, lab and digital solutions from verified suppliers. Sample catalogue shown for demonstration.</p>
          <div className="mt-6 flex max-w-xl items-center gap-2 rounded-2xl bg-white p-2 shadow-lg">
            <Search className="ml-2 h-5 w-5 text-slate-400" />
            <Input data-testid="product-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products or brands…" className="border-0 bg-transparent text-slate-900 focus-visible:ring-0" />
            <Button className="rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white">Search</Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          {CATEGORIES.map((c) => (
            <button key={c} data-testid={`product-cat-${c.toLowerCase().replace(/[^a-z]+/g, "-")}`} onClick={() => setCat(c)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${cat === c ? "bg-emerald-800 text-white border-emerald-800" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500"}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((p, i) => (
            <motion.div key={p.id} data-testid={`product-card-${p.id}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img src={p.img} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {p.tag && <span className="absolute top-3 left-3 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white">{p.tag}</span>}
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">{p.brand} · {p.cat}</p>
                <h3 className="mt-1 font-heading font-bold text-slate-900 dark:text-white">{p.name}</h3>
                <div className="mt-1 flex items-center gap-1 text-amber-500">{[...Array(5)].map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-current" />)}<span className="ml-1 text-xs text-slate-400">(demo)</span></div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-heading text-lg font-extrabold text-slate-900 dark:text-white">{p.price}</span>
                  <Button size="sm" onClick={() => navigate("/contact")} className="rounded-full bg-emerald-800 hover:bg-emerald-900 text-white"><ShoppingCart className="h-4 w-4 mr-1" /> Enquire</Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {list.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center text-slate-500">No products match your search.</div>}
      </section>

      <section className="mx-auto max-w-7xl px-4 lg:px-8 pb-16">
        <div className="grid sm:grid-cols-3 gap-4">
          {[{ i: ShieldCheck, t: "Verified Suppliers", d: "Products listed by verified dental vendors." }, { i: Wrench, t: "Installation Support", d: "Setup & servicing available on request." }, { i: Sparkles, t: "Best Price Enquiry", d: "Request quotes and compare offers." }].map((f) => (
            <div key={f.t} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
              <f.i className="h-6 w-6 text-emerald-800" /><h3 className="mt-3 font-heading font-bold text-slate-900 dark:text-white">{f.t}</h3><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{f.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
