// File: pages/index.tsx
// Main homepage that loads and searches all duty data using Fuse.js

import { useEffect, useState } from 'react';
import Fuse from 'fuse.js';
import DutyCard from '@/components/DutyCard';
import type { Duty } from '@/types/Duty';

// Load all duty data from JSON
import duties from '@/data/duties.json';

export default function Home() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Duty[]>(duties);

  useEffect(() => {
    const fuse = new Fuse(duties, {
      keys: ['title', 'tags'],
      threshold: 0.3,
    });

    if (search.trim() === '') {
      setResults(duties);
    } else {
      const filtered = fuse.search(search).map(result => result.item);
      setResults(filtered);
    }
  }, [search]);

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">FFXIV Duty Guide</h1>

      <input
        type="text"
        placeholder="Search by tag, title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 mb-6 border rounded-md"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((duty) => (
          <DutyCard key={duty.slug} duty={duty} />
        ))}
      </div>
    </main>
  );
}
