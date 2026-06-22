// USMLE Step 1 topic taxonomy — the app's canonical topic tree.
//
// Structure follows the de-facto standard students navigate by (First Aid):
//   General Principles (foundational disciplines) + 10 Organ Systems,
// each broken into chapter-level subtopics. Every node is tagged with its
// NBME organ-system grouping and the relevant discipline(s) so progress %,
// weakness analytics, and AI card generation all share one vocabulary.
//
// exam_weight on a system = approximate midpoint of its NBME % range (relative
// priority for sorting/weakness-vs-weight analytics; not an exact spec figure).
// This is a LIVING taxonomy — deepen leaf topics over time (P1/P2).
//
// ⚠️ Before treating weights/node names as authoritative, reconcile against the
// official outline PDF at usmle.org (see docs/usmle-prep-app/master-plan.md §12).

export type Discipline =
  | "pathology"
  | "physiology"
  | "pharmacology"
  | "biochemistry"
  | "microbiology"
  | "immunology"
  | "anatomy"
  | "behavioral_science"
  | "biostatistics"
  | "genetics";

export interface SeedSubtopic {
  slug: string; // unique within its system
  name: string;
  disciplines?: Discipline[]; // overrides system default when present
}

export interface SeedSystem {
  slug: string; // top-level id
  name: string;
  organSystem: string; // NBME organ-system grouping label
  examWeight: number | null; // midpoint % (relative priority)
  disciplines: Discipline[]; // default for children lacking their own
  children: SeedSubtopic[];
}

export const TAXONOMY: SeedSystem[] = [
  // ===================== GENERAL PRINCIPLES =====================
  {
    slug: "biochemistry",
    name: "Biochemistry",
    organSystem: "General Principles",
    examWeight: null,
    disciplines: ["biochemistry"],
    children: [
      { slug: "molecular", name: "Molecular biology (DNA/RNA, transcription, translation)" },
      { slug: "genetics", name: "Genetics (inheritance, population genetics, disorders)", disciplines: ["genetics"] },
      { slug: "cellular", name: "Cellular & laboratory techniques" },
      { slug: "metabolism", name: "Metabolism (glycolysis, TCA, lipids, urea cycle)" },
      { slug: "vitamins-nutrition", name: "Vitamins & nutrition" },
      { slug: "metabolic-disorders", name: "Inborn errors of metabolism", disciplines: ["biochemistry", "genetics"] },
    ],
  },
  {
    slug: "immunology",
    name: "Immunology",
    organSystem: "General Principles",
    examWeight: null,
    disciplines: ["immunology"],
    children: [
      { slug: "lymphoid-structures", name: "Lymphoid structures", disciplines: ["immunology", "anatomy"] },
      { slug: "cellular-components", name: "Cellular components & immune responses" },
      { slug: "adaptive", name: "Adaptive immunity (MHC, antibodies, complement)" },
      { slug: "hypersensitivity", name: "Hypersensitivity reactions" },
      { slug: "immunodeficiencies", name: "Immunodeficiencies", disciplines: ["immunology", "pathology"] },
      { slug: "transplant", name: "Transplant rejection & immunosuppressants", disciplines: ["immunology", "pharmacology"] },
    ],
  },
  {
    slug: "microbiology",
    name: "Microbiology",
    organSystem: "General Principles",
    examWeight: null,
    disciplines: ["microbiology"],
    children: [
      { slug: "bacteriology", name: "Bacteriology (gram +/−, structure, toxins)" },
      { slug: "virology", name: "Virology (DNA/RNA viruses)" },
      { slug: "mycology", name: "Mycology (fungal infections)" },
      { slug: "parasitology", name: "Parasitology" },
      { slug: "systems-infections", name: "Systems-based infections" },
      { slug: "antimicrobials", name: "Antimicrobials & resistance", disciplines: ["microbiology", "pharmacology"] },
    ],
  },
  {
    slug: "general-pathology",
    name: "General Pathology",
    organSystem: "General Principles",
    examWeight: null,
    disciplines: ["pathology"],
    children: [
      { slug: "cellular-injury", name: "Cellular injury, adaptation & death" },
      { slug: "inflammation", name: "Inflammation, repair & wound healing" },
      { slug: "neoplasia", name: "Neoplasia (carcinogenesis, tumor markers, metastasis)" },
    ],
  },
  {
    slug: "general-pharmacology",
    name: "General Pharmacology",
    organSystem: "General Principles",
    examWeight: null,
    disciplines: ["pharmacology"],
    children: [
      { slug: "pk-pd", name: "Pharmacokinetics & pharmacodynamics" },
      { slug: "autonomic", name: "Autonomic drugs (cholinergics, adrenergics)" },
      { slug: "toxicities", name: "Toxicities, side effects & antidotes" },
    ],
  },
  {
    slug: "public-health-sciences",
    name: "Public Health Sciences",
    organSystem: "General Principles",
    examWeight: null,
    disciplines: ["biostatistics", "behavioral_science"],
    children: [
      { slug: "epidemiology", name: "Epidemiology & study design", disciplines: ["biostatistics"] },
      { slug: "biostatistics", name: "Biostatistics (sensitivity, PPV, tests)", disciplines: ["biostatistics"] },
      { slug: "ethics", name: "Ethics & professionalism", disciplines: ["behavioral_science"] },
      { slug: "healthcare-delivery", name: "Healthcare delivery & quality/safety", disciplines: ["behavioral_science"] },
    ],
  },

  // ===================== ORGAN SYSTEMS =====================
  {
    slug: "cardiovascular",
    name: "Cardiovascular",
    organSystem: "Cardiovascular",
    examWeight: 12,
    disciplines: ["physiology", "pathology", "pharmacology"],
    children: [
      { slug: "embryology", name: "Embryology", disciplines: ["anatomy"] },
      { slug: "anatomy", name: "Anatomy", disciplines: ["anatomy"] },
      { slug: "physiology", name: "Physiology (cardiac cycle, pressure-volume, hemodynamics)", disciplines: ["physiology"] },
      { slug: "pathology", name: "Pathology (CAD, HF, arrhythmias, valvular, vascular)", disciplines: ["pathology"] },
      { slug: "pharmacology", name: "Pharmacology (antihypertensives, antiarrhythmics, lipids)", disciplines: ["pharmacology"] },
    ],
  },
  {
    slug: "endocrine",
    name: "Endocrine",
    organSystem: "Reproductive & Endocrine",
    examWeight: 14,
    disciplines: ["physiology", "pathology", "pharmacology"],
    children: [
      { slug: "anatomy-physiology", name: "Anatomy & physiology (hormone axes)", disciplines: ["anatomy", "physiology"] },
      { slug: "pituitary", name: "Hypothalamus & pituitary disorders" },
      { slug: "thyroid", name: "Thyroid & parathyroid disorders" },
      { slug: "adrenal", name: "Adrenal disorders" },
      { slug: "pancreas-diabetes", name: "Pancreas & diabetes mellitus" },
      { slug: "pharmacology", name: "Pharmacology (insulin, thyroid, steroids)", disciplines: ["pharmacology"] },
    ],
  },
  {
    slug: "gastrointestinal",
    name: "Gastrointestinal",
    organSystem: "Gastrointestinal",
    examWeight: 8,
    disciplines: ["physiology", "pathology", "pharmacology"],
    children: [
      { slug: "embryology", name: "Embryology", disciplines: ["anatomy"] },
      { slug: "anatomy", name: "Anatomy (GI tract, liver, biliary)", disciplines: ["anatomy"] },
      { slug: "physiology", name: "Physiology (secretions, digestion, absorption)", disciplines: ["physiology"] },
      { slug: "pathology", name: "Pathology (esophagus→colon, liver, pancreas, biliary)", disciplines: ["pathology"] },
      { slug: "pharmacology", name: "Pharmacology (acid suppression, antiemetics, laxatives)", disciplines: ["pharmacology"] },
    ],
  },
  {
    slug: "hematology-oncology",
    name: "Hematology & Oncology",
    organSystem: "Blood & Lymphoreticular / Immune",
    examWeight: 7,
    disciplines: ["physiology", "pathology", "pharmacology"],
    children: [
      { slug: "anatomy-physiology", name: "Anatomy & physiology (blood cells, hemostasis)", disciplines: ["anatomy", "physiology"] },
      { slug: "anemias", name: "RBC pathology & anemias" },
      { slug: "wbc-neoplasms", name: "WBC disorders, leukemias & lymphomas" },
      { slug: "coagulation", name: "Coagulation, platelet & bleeding disorders" },
      { slug: "pharmacology", name: "Pharmacology (anticoagulants, antiplatelets, chemo)", disciplines: ["pharmacology"] },
    ],
  },
  {
    slug: "musculoskeletal-skin",
    name: "Musculoskeletal, Skin & Connective Tissue",
    organSystem: "Musculoskeletal / Skin",
    examWeight: 8,
    disciplines: ["anatomy", "pathology", "pharmacology"],
    children: [
      { slug: "anatomy", name: "Anatomy (bones, joints, muscles, nerves)", disciplines: ["anatomy"] },
      { slug: "physiology", name: "Physiology (muscle contraction, bone formation)", disciplines: ["physiology"] },
      { slug: "rheumatology", name: "Rheumatology & connective tissue disease", disciplines: ["pathology"] },
      { slug: "dermatology", name: "Dermatology", disciplines: ["pathology"] },
      { slug: "pharmacology", name: "Pharmacology (NSAIDs, gout, DMARDs)", disciplines: ["pharmacology"] },
    ],
  },
  {
    slug: "neurology",
    name: "Neurology & Special Senses",
    organSystem: "Nervous System & Special Senses",
    examWeight: 13,
    disciplines: ["anatomy", "physiology", "pathology", "pharmacology"],
    children: [
      { slug: "embryology", name: "Embryology", disciplines: ["anatomy"] },
      { slug: "anatomy", name: "Anatomy (CNS, tracts, cranial nerves, vasculature)", disciplines: ["anatomy"] },
      { slug: "physiology", name: "Physiology (neurotransmitters, CSF, reflexes)", disciplines: ["physiology"] },
      { slug: "pathology", name: "Pathology (stroke, neurodegeneration, demyelination, tumors)", disciplines: ["pathology"] },
      { slug: "ophthalmology", name: "Ophthalmology (eye & vision)" },
      { slug: "otology", name: "Otology (ear & hearing)" },
      { slug: "pharmacology", name: "Pharmacology (anesthetics, anticonvulsants, analgesics)", disciplines: ["pharmacology"] },
    ],
  },
  {
    slug: "psychiatry",
    name: "Psychiatry",
    organSystem: "Behavioral Health",
    examWeight: 6,
    disciplines: ["behavioral_science", "pharmacology"],
    children: [
      { slug: "psychology", name: "Psychology & development", disciplines: ["behavioral_science"] },
      { slug: "disorders", name: "Psychiatric disorders", disciplines: ["behavioral_science", "pathology"] },
      { slug: "substance-use", name: "Substance use & addiction", disciplines: ["behavioral_science"] },
      { slug: "pharmacology", name: "Psychopharmacology", disciplines: ["pharmacology"] },
    ],
  },
  {
    slug: "renal",
    name: "Renal / Urinary",
    organSystem: "Renal / Urinary",
    examWeight: 8,
    disciplines: ["physiology", "pathology", "pharmacology"],
    children: [
      { slug: "embryology", name: "Embryology", disciplines: ["anatomy"] },
      { slug: "anatomy", name: "Anatomy", disciplines: ["anatomy"] },
      { slug: "physiology", name: "Physiology (GFR, clearance, transport)", disciplines: ["physiology"] },
      { slug: "acid-base", name: "Acid-base & electrolytes", disciplines: ["physiology"] },
      { slug: "pathology", name: "Pathology (glomerular, tubular, cystic, renal failure)", disciplines: ["pathology"] },
      { slug: "pharmacology", name: "Pharmacology (diuretics)", disciplines: ["pharmacology"] },
    ],
  },
  {
    slug: "reproductive",
    name: "Reproductive",
    organSystem: "Reproductive & Endocrine",
    examWeight: 14,
    disciplines: ["anatomy", "physiology", "pathology", "pharmacology"],
    children: [
      { slug: "embryology", name: "Embryology (genital development)", disciplines: ["anatomy"] },
      { slug: "anatomy", name: "Anatomy", disciplines: ["anatomy"] },
      { slug: "physiology", name: "Physiology (hormones, menstrual cycle, pregnancy)", disciplines: ["physiology"] },
      { slug: "pathology-female", name: "Female pathology (ovary, uterus, breast)", disciplines: ["pathology"] },
      { slug: "pathology-male", name: "Male pathology (testes, prostate, penis)", disciplines: ["pathology"] },
      { slug: "pharmacology", name: "Pharmacology (hormonal agents, contraceptives)", disciplines: ["pharmacology"] },
    ],
  },
  {
    slug: "respiratory",
    name: "Respiratory",
    organSystem: "Respiratory",
    examWeight: 8,
    disciplines: ["physiology", "pathology", "pharmacology"],
    children: [
      { slug: "embryology", name: "Embryology", disciplines: ["anatomy"] },
      { slug: "anatomy", name: "Anatomy", disciplines: ["anatomy"] },
      { slug: "physiology", name: "Physiology (lung volumes, mechanics, gas exchange)", disciplines: ["physiology"] },
      { slug: "pathology", name: "Pathology (obstructive, restrictive, vascular, neoplasms)", disciplines: ["pathology"] },
      { slug: "pharmacology", name: "Pharmacology (asthma/COPD agents)", disciplines: ["pharmacology"] },
    ],
  },
];

/** Flattened row ready for insertion into the `topics` table. */
export interface FlatTopic {
  id: string;
  parent_id: string | null;
  name: string;
  organ_system: string;
  disciplines: string; // JSON array
  exam_weight: number | null;
  sort_order: number;
}

/** Flatten the nested taxonomy into ordered rows (systems first, then their children). */
export function flattenTaxonomy(): FlatTopic[] {
  const rows: FlatTopic[] = [];
  let order = 0;
  for (const system of TAXONOMY) {
    rows.push({
      id: system.slug,
      parent_id: null,
      name: system.name,
      organ_system: system.organSystem,
      disciplines: JSON.stringify(system.disciplines),
      exam_weight: system.examWeight,
      sort_order: order++,
    });
    for (const sub of system.children) {
      rows.push({
        id: `${system.slug}.${sub.slug}`,
        parent_id: system.slug,
        name: sub.name,
        organ_system: system.organSystem,
        disciplines: JSON.stringify(sub.disciplines ?? system.disciplines),
        exam_weight: system.examWeight,
        sort_order: order++,
      });
    }
  }
  return rows;
}
