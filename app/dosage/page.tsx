'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, AlertTriangle, ChevronRight, Pill, Info } from 'lucide-react';
import drugsData from '@/data/drugs.json';
import { calculateDose, convertLbsToKg, type Drug, type DoseResult } from '@/lib/dose-calculator';

type WeightUnit = 'kg' | 'lbs';

const drugs: Drug[] = drugsData as Drug[];

const CATEGORIES = ['All', ...Array.from(new Set(drugs.map((d) => d.category)))];

export default function DosagePage() {
  const router = useRouter();
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [weightValue, setWeightValue] = useState('');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [result, setResult] = useState<DoseResult | null>(null);

  const weightKg = useMemo(() => {
    const num = parseFloat(weightValue);
    if (isNaN(num) || num <= 0) return null;
    return weightUnit === 'kg' ? num : convertLbsToKg(num);
  }, [weightValue, weightUnit]);

  // Auto-calculate when drug + weight are set
  useEffect(() => {
    if (selectedDrug && weightKg) {
      setResult(calculateDose(weightKg, selectedDrug));
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
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button
          onClick={() => router.back()}
          className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold text-base">Dosage Calculator</h1>
          <p className="text-gray-500 text-xs">Weight-based · Pediatric Safe</p>
        </div>
        <div className="w-12 h-12" />
      </div>

      <div className="flex-1 px-5 pb-8 space-y-4 overflow-y-auto">
        {/* Weight Input */}
        <div className="glass-card-elevated p-5 rounded-2xl">
          <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 block">
            Patient Weight
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              inputMode="decimal"
              value={weightValue}
              onChange={(e) => setWeightValue(e.target.value)}
              placeholder="Enter weight"
              className="flex-1 h-14 bg-gray-900 border border-gray-700 rounded-xl px-4 text-white text-xl font-bold placeholder:text-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
              aria-label="Patient weight"
            />
            <div className="glass-card p-1 rounded-xl flex gap-1">
              {(['kg', 'lbs'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setWeightUnit(u)}
                  className={`px-4 h-full rounded-lg text-sm font-bold transition-all ${
                    weightUnit === u
                      ? 'bg-white text-gray-950'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          {weightKg && (
            <p className="text-xs text-gray-500">
              = <span className="text-gray-300 font-semibold">{weightKg} kg</span>
              {weightUnit === 'lbs' && ` (${weightValue} lbs)`}
            </p>
          )}
        </div>

        {/* Drug Search */}
        <div className="glass-card-elevated p-5 rounded-2xl">
          <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 block">
            Select Medication
          </label>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search drugs..."
              className="w-full h-11 bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  category === cat
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : 'text-gray-500 border-gray-700 hover:text-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Drug list */}
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {filteredDrugs.map((drug) => (
              <button
                key={drug.drug_id}
                onClick={() => setSelectedDrug(drug)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  selectedDrug?.drug_id === drug.drug_id
                    ? 'bg-blue-900/40 border-blue-500/60 shadow-lg shadow-blue-900/30'
                    : 'bg-gray-900/50 border-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                  <Pill className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{drug.generic_name}</p>
                  <p className="text-gray-500 text-xs truncate">{drug.brand_names.slice(0, 2).join(' / ')}</p>
                </div>
                <span className="text-xs text-gray-600 border border-gray-700 px-2 py-0.5 rounded flex-shrink-0">
                  {drug.dosing_rules.route.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        {result && selectedDrug && weightKg && (
          <div className="space-y-3 animate-fade-in-up">
            {/* MAX CAP warning */}
            {result.isCapped && (
              <div className="flex items-start gap-3 px-4 py-3 bg-amber-900/30 border border-amber-600/50 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-300 font-bold text-sm">⚠️ MAX CAP REACHED</p>
                  <p className="text-amber-400/80 text-xs mt-0.5">
                    Calculated dose exceeds adult maximum. Capped at{' '}
                    {result.cappedAt?.toFixed(2)} mL ({selectedDrug.dosing_rules.max_single_dose_mg} mg max).
                  </p>
                </div>
              </div>
            )}

            {/* Weight warning */}
            {result.warning && (
              <div className="flex items-start gap-3 px-4 py-3 bg-red-900/30 border border-red-600/50 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-xs leading-relaxed">{result.warning}</p>
              </div>
            )}

            {/* Dose display */}
            <div className="glass-card-elevated p-6 rounded-2xl">
              <div className="text-center mb-6">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  Administer
                </p>
                <p className="text-6xl font-black text-white leading-none mb-1">
                  {result.displayDose}
                </p>
                <p className="text-gray-400 text-sm">
                  ({result.finalDoseMg} mg) · {result.route}
                </p>
              </div>

              {/* Concentration */}
              <div className="h-3 bg-gray-800 rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, (result.finalDoseMl / (selectedDrug.dosing_rules.max_single_dose_mg / (selectedDrug.standard_concentration.mg / selectedDrug.standard_concentration.ml))) * 100)}%`,
                  }}
                />
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Concentration', value: `${selectedDrug.standard_concentration.mg}mg / ${selectedDrug.standard_concentration.ml}mL` },
                  { label: 'Dose/kg', value: `${selectedDrug.dosing_rules.mg_per_kg_default} mg/kg` },
                  { label: 'Max single dose', value: `${selectedDrug.dosing_rules.max_single_dose_mg} mg` },
                  { label: 'Repeat every', value: selectedDrug.dosing_rules.interval_hours === 0 ? 'As needed' : `${selectedDrug.dosing_rules.interval_hours}h` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-900/60 rounded-xl p-3">
                    <p className="text-gray-500 text-xs mb-1">{label}</p>
                    <p className="text-white text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Drug notes */}
            <div className="glass-card p-4 rounded-2xl flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-300 text-xs font-semibold mb-1">Clinical Notes</p>
                <p className="text-gray-400 text-xs leading-relaxed">{selectedDrug.notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="glass-card p-4 rounded-2xl">
          <p className="text-xs text-gray-500 leading-relaxed text-center">
            ⚠️ Always verify doses with current guidelines and consider clinical context.
            Doses are starting points — adjust for renal/hepatic impairment.
          </p>
        </div>
      </div>
    </div>
  );
}
