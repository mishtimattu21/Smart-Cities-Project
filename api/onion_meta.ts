import fs from "fs";
import path from "path";

type Scope = "states" | "districts" | "varieties" | "markets";

function readCsvLines(): string[] {
  const csvPath = path.join(process.cwd(), "onion.csv");
  const raw = fs.readFileSync(csvPath, "utf8");
  return raw.split(/\r?\n/).filter(Boolean);
}

function parseHeader(headerLine: string) {
  const headers = headerLine.split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  // Try both 'Your_X' and lowercase variants
  const find = (names: string[]) => {
    for (const n of names) {
      const i = headers.findIndex((h) => h.toLowerCase() === n.toLowerCase());
      if (i !== -1) return i;
    }
    return -1;
  };
  return {
    stateIdx: find(["Your_State", "state"]),
    districtIdx: find(["Your_District", "district"]),
    marketIdx: find(["Your_Market", "market"]),
    varietyIdx: find(["Your_Variety", "variety"]),
    gradeIdx: find(["Your_Grade", "grade"]),
    dateIdx: find(["Your_Date", "date"]),
  };
}

function safeCell(line: string, index: number): string {
  const parts = line.split(",");
  const cell = index >= 0 && index < parts.length ? parts[index] : "";
  return cell.trim().replace(/^"|"$/g, "");
}

export default function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const scope: Scope = (req.query?.scope as Scope) || "states";
    const filterState = (req.query?.state as string) || "";
    const filterDistrict = (req.query?.district as string) || "";

    const lines = readCsvLines();
    if (!lines.length) return res.status(404).json({ error: "CSV empty" });
    const idx = parseHeader(lines[0]);

    const set = new Map<string, number>();
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const state = safeCell(line, idx.stateIdx);
      const district = safeCell(line, idx.districtIdx);
      const market = safeCell(line, idx.marketIdx);
      const variety = safeCell(line, idx.varietyIdx);

      if (filterState && state.toLowerCase() !== filterState.toLowerCase()) continue;
      if (filterDistrict && district.toLowerCase() !== filterDistrict.toLowerCase()) continue;

      let key = "";
      if (scope === "states") key = state;
      else if (scope === "districts") key = district;
      else if (scope === "varieties") key = variety;
      else key = market;

      if (!key) continue;
      set.set(key, (set.get(key) || 0) + 1);
    }

    const items = Array.from(set.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    return res.status(200).json({ scope, items });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Unexpected error" });
  }
}


