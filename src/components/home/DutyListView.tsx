"use client";

import { useEffect, useState } from "react";
import Fuse from "fuse.js";
import type { IDuty } from "@/types/IDuty";
import { loadDuties } from "@/lib/dutylogic";
import DutyCard from "@/components/DutyCard";

export default function DutyListView() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<IDuty[]>([]);
  const [allDuties, setAllDuties] = useState<IDuty[]>([]);

  useEffect(() => {
    async function fetchData() {
      const duties = await loadDuties();
      setAllDuties(duties);
      setResults(duties);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setResults(allDuties);
    } else {
      const fuse = new Fuse(allDuties, {
        keys: ["title", "tags"],
        threshold: 0.3,
      });
      setResults(fuse.search(search).map((r) => r.item));
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
