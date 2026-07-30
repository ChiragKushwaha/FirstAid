'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, AlertTriangle, Check } from 'lucide-react';
import drugsData from '@/data/drugs.json';
import { calculateDose, convertLbsToKg, type Drug, type DoseResult } from '@/lib/dose-calculator';
import ThemeToggle from '@/components/ThemeToggle';

type WeightUnit = 'kg' | 'lbs';
type AgeCategory = 'Infant' | 'Child' | 'Adult';

const drugs: Drug[] = drugsData as Drug[];
const CATEGORIES = ['All', ...Array.from(new Set(drugs.map((d) => d.category)))];

export default function DosagePage() {
  const router = useRouter();
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [weightValue, setWeightValue] = useState('');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [ageCategory, setAgeCategory] = useState<AgeCategory>('Child');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [result, setResult] = useState<DoseResult | null>(null);

  const weightKg = useMemo(() => {
    const num = parseFloat(weightValue);
    if (isNaN(num) || num <= 0) return null;
    return weightUnit === 'kg' ? num : convertLbsToKg(num);
  }, [weightValue, weightUnit]);

  useEffect(() => {
    if (selectedDrug && weightKg) {
      const res = calculateDose(weightKg, selectedDrug);
      setResult(res);
      const announcer = document.getElementById('aria-announcer');
      if (announcer) {
        announcer.textContent = `Calculated dose for ${selectedDrug.generic_name}: ${res.displayDose} (${res.finalDoseMg} mg)`;
      }
    } else {
      setResult(null);
    }
  }, [selectedDrug, weightKg]);

  const filteredDrugs = useMemo(() => {
    return drugs.filter((d) => {
      const matchCat = category === 'All' || d.category === category;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        d.generic_name.toLowerCase().includes(q) ||
        d.brand_names.some((b) => b.toLowerCase().includes(q)) ||
        d.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [searchQuery, category]);

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-main pb-12">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 pt-14 pb-4">
        <button
          onClick={() => router.back()}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-95 border border-current/15 bg-white/10 text-current hover:bg-white/20"
          aria-label="Go Back"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2} />
        </button>

        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-50">PRD Formula Calculator</p>
          <h1 className="text-base font-bold">Dosage Calculator</h1>
        </div>

        <ThemeToggle />
      </header>

      <main className="px-6 flex-1 space-y-4">
        {/* ── Weight & Age Input Card (Yellow Leaf Card) ── */}
        <section className="feat-card feat-card-yellow leaf-card-left p-6 space-y-3" aria-label="Patient Weight and Age Group">
          <div className="card-handle" style={{ background: 'rgba(0,0,0,0.15)' }} />
          <div className="flex items-center justify-between text-black">
            <label htmlFor="weight-input" className="text-xs font-extrabold uppercase tracking-wider text-black/60">
              1. Patient Weight &amp; Group
            </label>
            {weightKg && (
              <span className="text-xs font-extrabold bg-black/10 px-2.5 py-1 rounded-full">
                {weightKg} kg
              </span>
            )}
          </div>

          <div
            className="bg-black/10 p-1 rounded-2xl flex gap-1 items-center"
            role="radiogroup"
            aria-label="Patient Age Group"
          >
            {(['Infant', 'Child', 'Adult'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setAgeCategory(cat)}
                role="radio"
                aria-checked={ageCategory === cat}
                className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  ageCategory === cat ? 'bg-black text-white' : 'text-black/60 hover:text-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              id="weight-input"
              type="number"
              inputMode="decimal"
              value={weightValue}
              onChange={(e) => setWeightValue(e.target.value)}
              placeholder="Enter weight"
              className="flex-1 min-w-0 h-14 bg-white/40 text-black placeholder:text-black/40 font-black text-2xl px-4 rounded-2xl border-none focus:outline-none"
              aria-label="Patient Weight"
            />
            <div
              className="bg-black/10 p-1 rounded-2xl flex gap-1 items-center flex-shrink-0"
              role="radiogroup"
              aria-label="Weight Unit"
            >
              {(['kg', 'lbs'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setWeightUnit(u)}
                  role="radio"
                  aria-checked={weightUnit === u}
                  className={`px-3.5 h-12 rounded-xl text-xs font-extrabold transition-all ${
                    weightUnit === u ? 'bg-black text-white' : 'text-black/60 hover:text-black'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Drug Selection Card (Cream Leaf Card) ── */}
        <section className="feat-card feat-card-cream leaf-card-full p-6 space-y-4" aria-label="Select Medication">
          <div className="card-handle" style={{ background: 'rgba(0,0,0,0.15)' }} />
          <div className="text-black">
            <label htmlFor="drug-search" className="text-xs font-extrabold uppercase tracking-wider text-black/60">
              2. Select Pre-Loaded Drug
            </label>
            {selectedDrug && (
              <p className="text-lg font-black mt-1 text-black">
                {selectedDrug.generic_name}
              </p>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/50" />
            <input
              id="drug-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search generic / brand..."
              className="w-full h-11 bg-black/5 text-black placeholder:text-black/40 font-semibold text-sm pl-10 pr-4 rounded-xl focus:outline-none"
              aria-label="Search Drugs"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1" aria-label="Drug Category Filter">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
                  category === cat
                    ? 'bg-black text-white'
                    : 'bg-black/5 text-black/60 hover:text-black'
                }`}
                aria-pressed={category === cat}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1" role="listbox" aria-label="Medications List">
            {filteredDrugs.map((drug) => {
              const isSelected = selectedDrug?.drug_id === drug.drug_id;
              return (
                <button
                  key={drug.drug_id}
                  onClick={() => setSelectedDrug(drug)}
                  role="option"
                  aria-selected={isSelected}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                    isSelected ? 'bg-black text-white shadow' : 'bg-black/5 text-black hover:bg-black/10'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-extrabold text-sm truncate">{drug.generic_name}</p>
                    <p className={`text-xs truncate ${isSelected ? 'text-white/60' : 'text-black/50'}`}>
                      {drug.brand_names.join(', ')}
                    </p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#A8D672] flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Dose Result Card (Coral Leaf Card) ── */}
        {result && selectedDrug && weightKg && (
          <section className="feat-card feat-card-coral leaf-card-right p-6 space-y-4 animate-card-in" aria-live="polite" aria-label="Dosage Result">
            <div className="card-handle" />
            <div>
              <span className="text-xs font-bold uppercase tracking-widest opacity-70">
                Formula Output (mL)
              </span>
              <h2 className="text-5xl font-black mt-1 leading-none">
                {result.displayDose}
              </h2>
              <p className="text-sm font-bold opacity-80 mt-2">
                ({result.finalDoseMg} mg total) · {result.route}
              </p>
            </div>

            <div className="p-3 bg-black/20 rounded-2xl text-[11px] font-bold text-white/90">
              Volume = ({weightKg} kg × {selectedDrug.dosing_rules.mg_per_kg_default} mg/kg) ÷ ({selectedDrug.standard_concentration.mg} mg / {selectedDrug.standard_concentration.ml} mL)
            </div>

            {result.isCapped && (
              <div className="p-3 bg-black/20 rounded-2xl text-xs font-bold flex items-center gap-2 text-[#F7D44C]">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Enforced Adult Upper Cap ({result.cappedAt?.toFixed(2)} mL max)</span>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
