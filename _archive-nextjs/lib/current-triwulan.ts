export function getCurrentTriwulan(date: Date = new Date()) {
  const month = date.getMonth() + 1; // 1-12
  const tahun = date.getFullYear();
  let triwulan: number;

  if (month <= 3) triwulan = 1;
  else if (month <= 6) triwulan = 2;
  else if (month <= 9) triwulan = 3;
  else triwulan = 4;

  return { tahun, triwulan };
}

export const TRIWULAN_LABEL: Record<number, string> = {
  1: "TW1: Jan–Mar",
  2: "TW2: Apr–Jun",
  3: "TW3: Jul–Sep",
  4: "TW4: Okt–Des",
};

export function getPreviousTriwulan(tahun: number, triwulan: number) {
  if (triwulan === 1) {
    return { tahun: tahun - 1, triwulan: 4 };
  }
  return { tahun, triwulan: triwulan - 1 };
}