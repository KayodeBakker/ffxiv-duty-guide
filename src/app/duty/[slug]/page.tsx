import { notFound } from "next/navigation";
import { IDuty } from "@/types/IDuty";
import fs from "fs/promises";
import path from "path";

// Load duties from both sources at build time
async function loadAllDuties(): Promise<IDuty[]> {
  const dungeonsData = await fs.readFile(path.join(process.cwd(), "public/data/dungeons.json"), "utf-8");
  const trialsData = await fs.readFile(path.join(process.cwd(), "public/data/trials.json"), "utf-8");

  const dungeons = JSON.parse(dungeonsData) as IDuty[];
  const trials = JSON.parse(trialsData) as IDuty[];

  return [...dungeons, ...trials];
}

export async function generateStaticParams() {
  const allDuties = await loadAllDuties();
  return allDuties.map((duty) => ({
    slug: duty.slug,
  }));
}

export default async function DutyPage({ params }: { params: { slug: string } }) {
  const allDuties = await loadAllDuties();
  const duty = allDuties.find((d) => d.slug === params.slug);

  if (!duty) return notFound();

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{duty.title}</h1>
      <p className="text-sm text-gray-500 mb-2">Type: {duty.type}</p>
      <p className="mb-4 text-gray-700">{duty.description}</p>
      {/* <p><strong>Level:</strong> {duty.level}</p> */}
      {/* <p><strong>Min iLvl:</strong> {duty.minILvl}</p> */}
      {/* <p><strong>Bosses:</strong> {duty.bosses?.join(", ")}</p> */}
    </main>
  );
}
