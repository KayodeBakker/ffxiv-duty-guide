"use client"; // Required for client-side features like useState/useEffect

import { useEffect, useState } from "react";
import Fuse from "fuse.js";
import DutyCard from "@/components/DutyCard";
import type { IDuty } from "@/types/IDuty";


export default function HomePage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<IDuty[]>([]);
  const [allDuties, setAllDuties] = useState<IDuty[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [dungeons, trials] = await Promise.all([
          fetch("/data/dungeons.json").then((res) => res.json()),
          fetch("/data/trials.json").then((res) => res.json()),
        ]);

        const combinedDutiesData = [...dungeons, ...trials].sort((a, b) => a.id - b.id);

        // Runtime type check
        if (!Array.isArray(combinedDutiesData)) {
          console.error("duties.json is not an array:", combinedDutiesData);
          setAllDuties([]);
          return;
        }

        // Sort the duties by their ID (assuming 'id' is a long integer)
        const sortedDuties = combinedDutiesData.sort((a: IDuty, b: IDuty) => a.id - b.id);

        setAllDuties(sortedDuties);
        setResults(sortedDuties); // Show all by default
      } catch (err) {
        console.error("Failed to load duties.json:", err);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setResults(allDuties);
    } else {
      const fuse = new Fuse(allDuties, {
        keys: ["title", "tags"],
        threshold: 0.3,
      });
      const filtered = fuse.search(search).map((r) => r.item);
      setResults(filtered);
    }
  }, [search, allDuties]);

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
