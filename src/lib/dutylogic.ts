import type { IDuty } from "@/types/IDuty";

export async function loadDuties(): Promise<IDuty[]> {
  try {
    const [dungeons, trials] = await Promise.all([
      fetch("/data/dungeons.json").then((res) => res.json()),
      fetch("/data/trials.json").then((res) => res.json()),
    ]);

    const combinedDutiesData = [...dungeons, ...trials].sort((a, b) => a.id - b.id);

    if (!Array.isArray(combinedDutiesData)) {
      console.error("Combined data is not an array.", combinedDutiesData);
      return [];
    }

    return combinedDutiesData.sort((a: IDuty, b: IDuty) => a.id - b.id);
  } catch (err) {
    console.error("Error loading duties:", err);
    return [];
  }
}