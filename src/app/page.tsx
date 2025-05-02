"use client";

import { useEffect, useState } from "react";
import Fuse from "fuse.js";
import { useSearchParams } from "next/navigation";
import DutyCard from "@/components/DutyCard";
import type { IDuty } from "@/types/IDuty";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<IDuty[]>([]);
  const [allDuties, setAllDuties] = useState<IDuty[]>([]);
  const searchParams = useSearchParams();

  useEffect(() => {
    async function loadData() {
      try {
        const [dungeons, trials, raids] = await Promise.all([
          fetch("/data/dungeons.json").then((res) => res.json()),
          fetch("/data/trials.json").then((res) => res.json()),
          fetch("/data/raids.json").then((res) => res.json()),
        ]);

        const combinedDutiesData = [...dungeons, ...trials, ...raids];

        if (!Array.isArray(combinedDutiesData)) {
          console.error("duties.json is not an array:", combinedDutiesData);
          setAllDuties([]);
          return;
        }

        const sortedDuties = combinedDutiesData.sort(
          (a: IDuty, b: IDuty) => a.id - b.id
        );

        setAllDuties(sortedDuties);
      } catch (err) {
        console.error("Failed to load duties:", err);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    const typeFilter = searchParams.get("type")?.toLowerCase();

    let filtered = allDuties;
    
    if (typeFilter && typeFilter !== "all") {
      filtered = filtered.filter(
        (duty) => duty.type?.toLowerCase() === typeFilter
      );
    }
    

    if (search.trim() !== "") {
      const fuse = new Fuse(filtered, {
        keys: ["title", "tags"],
        threshold: 0.3,
      });
      filtered = fuse.search(search).map((r) => r.item);
    }

    setResults(filtered);
  }, [search, searchParams, allDuties]);

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">FFXIV Duty Guide</h1>

      <input
        type="text"
        placeholder="Search by title or tags..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 mb-6 border border-gray-300 rounded-md"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((duty) => (
          <DutyCard key={duty.slug} duty={duty} />
        ))}
      </div>
    </main>
  );
}
