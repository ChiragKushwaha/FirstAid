'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, AlertTriangle, Check } from 'lucide-react';
import drugsData from '@/data/drugs.json';
import { calculateDose, convertLbsToKg, type Drug, type DoseResult } from '@/lib/dose-calculator';
import ThemeToggle from '@/components/ThemeToggle';
import SlidingSegmentedControl from '@/components/SlidingSegmentedControl';
import SlidingPillsNav from '@/components/SlidingPillsNav';

type WeightUnit = 'kg' | 'lbs';
type AgeCategory = 'Infant' | 'Child' | 'Adult';

const drugs: Drug[] = drugsData as Drug[];

const CATEGORY_MAP: Record<string, string> = {
  'All': 'All',
  'Analgesic / Antipyretic': 'Analgesics',
  'NSAID / Anti-inflammatory': 'NSAIDs',
  'Antihistamine': 'Antihistamines',
  'Antidote / Opioid Antagonist': 'Antidotes',
  'Bronchodilator / Anticholinergic': 'Bronchodilators',
  'Antiemetic': 'Antiemetics',
  'Antibiotic / Penicillin': 'Antibiotics',
  'Corticosteroid': 'Steroids',
  'Antiseptic / Disinfectant': 'Antiseptics',
  'Electrolyte / Hydration': 'Electrolytes',
};

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
      <header className="flex items-center justify-between px-4 sm:px-6 pt-10 sm:pt-14 pb-4">
        <button
          onClick={() => router.back()}
          className="icon-btn"
          aria-label="Go Back"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2} />
        </button>

        <div className="text-center">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-warm-muted">PRD Formula Calculator</p>
          <h1 className="text-sm sm:text-base font-bold">Dosage Calculator</h1>
        </div>

        <ThemeToggle />
      </header>

      <main className="px-4 sm:px-6 flex-1 space-y-4 max-w-md mx-auto w-full">
        {/* ── Weight & Age Input Card ── */}
        <section
          className="p-4 sm:p-6 space-y-3 rounded-[var(--radius-card)]"
          style={{ background: 'var(--gold)', color: '#1A1510', boxShadow: 'var(--card-shadow)' }}
          aria-label="Patient Weight and Age Group"
        >
          <div className="flex items-center justify-between">
            <label htmlFor="weight-input" className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider opacity-70">
              1. Weight &amp; Group
            </label>
            {weightKg && (
              <span className="text-xs font-extrabold bg-black/10 px-2.5 py-1 rounded-full">
                {weightKg} kg
              </span>
            )}
          </div>

          <SlidingSegmentedControl<AgeCategory>
            ariaLabel="Patient Age Group"
            value={ageCategory}
            onChange={setAgeCategory}
            activeColor="#1A1510"
            activeTextColor="#FFFFFF"
            options={[
              { id: 'Infant', label: 'Infant' },
              { id: 'Child', label: 'Child' },
              { id: 'Adult', label: 'Adult' },
            ]}
          />

          <div className="flex gap-2 items-center">
            <input
              id="weight-input"
              type="number"
              inputMode="decimal"
              value={weightValue}
              onChange={(e) => setWeightValue(e.target.value)}
              placeholder="Weight"
              className="flex-1 min-w-0 h-13 sm:h-14 bg-white/40 text-[#1A1510] placeholder:text-[#1A1510]/40 font-black text-xl sm:text-2xl px-3.5 sm:px-4 rounded-2xl border-none focus:outline-none"
              aria-label="Patient Weight"
            />
            <div className="w-28 flex-shrink-0">
              <SlidingSegmentedControl<WeightUnit>
                ariaLabel="Weight Unit"
                value={weightUnit}
                onChange={setWeightUnit}
                activeColor="#1A1510"
                activeTextColor="#FFFFFF"
                options={[
                  { id: 'kg', label: 'kg' },
                  { id: 'lbs', label: 'lbs' },
                ]}
              />
            </div>
          </div>
        </section>

        {/* ── Drug Selection Card ── */}
        <section className="warm-card p-4 sm:p-6 space-y-4" aria-label="Select Medication">
          <div>
            <label htmlFor="drug-search" className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-warm-muted">
              2. Select Pre-Loaded Drug
            </label>
            {selectedDrug && (
              <p className="text-base sm:text-lg font-black mt-0.5">
                {selectedDrug.generic_name}
              </p>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-sub)] pointer-events-none" />
            <input
              id="drug-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search generic / brand..."
              className="w-full h-11 bg-[var(--card-bg-solid)] text-[var(--text-main)] placeholder:text-[var(--text-sub)] font-bold text-sm pl-10 pr-4 rounded-xl focus:outline-none border border-[var(--card-border)] shadow-sm transition-all focus:border-[var(--orange)] focus:ring-2 focus:ring-[var(--orange)]/30"
              aria-label="Search Drugs"
            />
          </div>

          <SlidingPillsNav
            ariaLabel="Drug Category Filter"
            options={CATEGORIES.map((c) => CATEGORY_MAP[c] || c)}
            value={CATEGORY_MAP[category] || category}
            onChange={(selectedLabel) => {
              const matchedKey = CATEGORIES.find((c) => (CATEGORY_MAP[c] || c) === selectedLabel);
              if (matchedKey) setCategory(matchedKey);
            }}
          />

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
                    isSelected
                      ? 'bg-[var(--orange)] text-white shadow-sm'
                      : 'bg-[var(--input-bg)] hover:bg-[var(--input-border)]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-extrabold text-sm truncate">{drug.generic_name}</p>
                    <p className={`text-xs truncate ${isSelected ? 'text-white/70' : 'text-warm-muted'}`}>
                      {drug.brand_names.join(', ')}
                    </p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-white flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Dose Result Card ── */}
        {result && selectedDrug && weightKg && (
          <section
            className="p-5 sm:p-6 space-y-4 animate-card-in rounded-[var(--radius-card)]"
            style={{ background: 'var(--coral)', color: '#FFFFFF', boxShadow: 'var(--card-shadow-lg)' }}
            aria-live="polite"
            aria-label="Dosage Result"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-widest opacity-70">
                Formula Output (mL)
              </span>
              <h2 className="text-4xl sm:text-5xl font-black mt-1 leading-none">
                {result.displayDose}
              </h2>
              <p className="text-xs sm:text-sm font-bold opacity-80 mt-2">
                ({result.finalDoseMg} mg total) · {result.route}
              </p>
            </div>

            <div className="p-3 bg-black/15 rounded-2xl text-[11px] font-bold text-white/90">
              Volume = ({weightKg} kg × {selectedDrug.dosing_rules.mg_per_kg_default} mg/kg) ÷ ({selectedDrug.standard_concentration.mg} mg / {selectedDrug.standard_concentration.ml} mL)
            </div>

            {result.isCapped && (
              <div className="p-3 bg-black/15 rounded-2xl text-xs font-bold flex items-center gap-2 text-[var(--gold)]">
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
