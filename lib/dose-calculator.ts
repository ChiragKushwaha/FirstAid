export interface Drug {
  drug_id: string;
  generic_name: string;
  brand_names: string[];
  category: string;
  standard_concentration: { mg: number; ml: number };
  dosing_rules: {
    mg_per_kg_default: number;
    min_weight_kg: number;
    max_single_dose_mg: number;
    max_daily_dose_mg: number;
    interval_hours: number;
    route: string;
  };
  notes: string;
}

export interface DoseResult {
  calculatedDoseMl: number;
  finalDoseMl: number;
  calculatedDoseMg: number;
  finalDoseMg: number;
  cappedAt: number | null;
  isCapped: boolean;
  displayDose: string;
  warning: string | null;
  concentration: { mg: number; ml: number };
  route: string;
  intervalHours: number;
  maxDailyDoseMg: number;
}

/**
 * Round dose per syringe precision rules (PRD §3.3):
 *  < 1.0 mL  → nearest 0.01 mL (1 mL syringe)
 *  1.0–10 mL → nearest 0.1 mL
 *  > 10 mL   → nearest 0.5 mL
 */
function roundForSyringe(ml: number): number {
  if (ml < 1.0) return Math.round(ml * 100) / 100;
  if (ml <= 10.0) return Math.round(ml * 10) / 10;
  return Math.round(ml * 2) / 2;
}

function formatDose(ml: number): string {
  if (ml < 1.0) return `${ml.toFixed(2)} mL`;
  if (ml <= 10.0) return `${ml.toFixed(1)} mL`;
  return `${ml.toFixed(1)} mL`;
}

export function calculateDose(weightKg: number, drug: Drug): DoseResult {
  const { standard_concentration, dosing_rules } = drug;
  const concentrationMgPerMl = standard_concentration.mg / standard_concentration.ml;

  // Raw calculated dose in mg
  const calculatedDoseMg = weightKg * dosing_rules.mg_per_kg_default;

  // Convert to mL
  const calculatedDoseMl = calculatedDoseMg / concentrationMgPerMl;

  // Maximum allowed volume based on adult cap
  const maxCapDoseMl = dosing_rules.max_single_dose_mg / concentrationMgPerMl;

  // Apply cap
  const isCapped = calculatedDoseMl > maxCapDoseMl;
  const rawFinalMl = isCapped ? maxCapDoseMl : calculatedDoseMl;
  const finalDoseMl = roundForSyringe(rawFinalMl);
  const finalDoseMg = finalDoseMl * concentrationMgPerMl;

  let warning: string | null = null;
  if (weightKg < dosing_rules.min_weight_kg) {
    warning = `⚠️ Weight (${weightKg} kg) is below minimum recommended weight of ${dosing_rules.min_weight_kg} kg for this drug. Consult a medical professional before administering.`;
  } else if (isCapped) {
    warning = null; // Shown separately as MAX CAP REACHED
  }

  return {
    calculatedDoseMl: roundForSyringe(calculatedDoseMl),
    finalDoseMl,
    calculatedDoseMg: Math.round(calculatedDoseMg * 10) / 10,
    finalDoseMg: Math.round(finalDoseMg * 10) / 10,
    cappedAt: isCapped ? maxCapDoseMl : null,
    isCapped,
    displayDose: formatDose(finalDoseMl),
    warning,
    concentration: standard_concentration,
    route: dosing_rules.route,
    intervalHours: dosing_rules.interval_hours,
    maxDailyDoseMg: dosing_rules.max_daily_dose_mg,
  };
}

export function convertLbsToKg(lbs: number): number {
  return Math.round(lbs / 2.2046 * 10) / 10;
}
