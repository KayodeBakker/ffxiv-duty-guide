import type { IDuty } from "@/types/IDuty";

export async function loadDuties(): Promise<IDuty[]> {
  const [dungeons, trials] = await Promise.all([
    fetch("/data/dungeons.json").then((res) => res.json()),
    fetch("/data/trials.json").then((res) => res.json()),
  ]);

  return [...dungeons, ...trials];
}

export async function getDutyBySlug(slug: string): Promise<IDuty | null> {
  const allDuties = await loadDuties();
  return allDuties.find((duty) => duty.slug === slug) ?? null;
}
