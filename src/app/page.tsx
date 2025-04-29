"use client"; // Required for client-side features like useState/useEffect

import { useEffect, useState } from "react";
import Fuse from "fuse.js";
import DutyCard from "@/components/DutyCard";
import type { Duty } from "@/types/Duty";
																 

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Duty[]>([]);
  const [allDuties, setAllDuties] = useState<Duty[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/data/duties.json");
        const json = await res.json();

		// Runtime type check
        if (!Array.isArray(json)) {
          console.error("duties.json is not an array:", json);
          setAllDuties([]);
          return;
        }

        setAllDuties(json);
        setResults(json); // Show all by default
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
