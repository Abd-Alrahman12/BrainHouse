export const COLLEGES = [
  { id: 1, name_ar: "كلية العلوم", name_en: "Science" },
  { id: 2, name_ar: "كلية الآداب", name_en: "Arts" },
  { id: 3, name_ar: "كلية العلوم التربوية", name_en: "Education" },
  { id: 4, name_ar: "كلية تكنولوجيا المعلومات", name_en: "IT" },
  { id: 5, name_ar: "كلية الأعمال", name_en: "Business" },
] as const;

export type College = typeof COLLEGES[number];

export function getCollegeName(id: number | null | undefined, lang: "en" | "ar"): string {
  if (!id) return "";
  const college = COLLEGES.find(c => c.id === id);
  if (!college) return "";
  return lang === "ar" ? college.name_ar : college.name_en;
}
