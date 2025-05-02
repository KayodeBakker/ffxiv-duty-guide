"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getDutyBySlug } from "@/lib/dutydetaillogic";
import type { IDuty } from "@/types/IDuty";

export default function DutyDetailView() {
  const { slug } = useParams();
  const [duty, setDuty] = useState<IDuty | null>(null);

  useEffect(() => {
    async function load() {
      if (typeof slug === "string") {
        const data = await getDutyBySlug(slug);
        setDuty(data);
      }
    }
    load();
  }, [slug]);

  if (!duty) {
    return <p className="p-4">Loading or not found...</p>;
  }

  return (
    // <main className="max-w-3xl mx-auto p-4">
    //   <h1 className="text-3xl font-bold mb-4">{duty.title}</h1>
    //   <p className="text-gray-600 mb-2">Type: {duty.type}</p>
    //   <p className="text-gray-600 mb-2">Level: {duty.minLevel ?? "?"}–{duty.maxLevel ?? "?"}</p>
    //   <p className="mb-4">{duty.description ?? "No description available."}</p>

    //   {duty.tags?.length > 0 && (
    //     <div className="flex gap-2 flex-wrap">
    //       {duty.tags.map((tag) => (
    //         <span key={tag} className="bg-gray-200 text-sm px-2 py-1 rounded">
    //           {tag}
    //         </span>
    //       ))}
    //     </div>
    //   )}
    // </main>
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
