"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white px-4 py-3 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold hover:text-gray-300">
          FFXIV Duty Guide
        </Link>

        <div className="space-x-4">
          <Link href="/?type=all" className="hover:text-gray-300">All Duties</Link>
          <Link href="/?type=dungeon" className="hover:text-gray-300">Dungeons</Link>
          <Link href="/?type=trial" className="hover:text-gray-300">Trials</Link>
          <Link href="/?type=raid" className="hover:text-gray-300">Raids</Link>
        </div>
      </div>
    </nav>
  );
}
