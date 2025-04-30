import Link from "next/link";
import type { IDuty } from "@/types/IDuty";

export default function DutyCard({ duty }: { duty: IDuty }) {
  return (
    <Link href={`/duty/${duty.slug}`}>
      <div className="border rounded-md shadow-md overflow-hidden">
        <img
          src={duty.backgroundImage}
          alt={duty.title}
          className="w-full h-40 object-cover"
        />
        <div className="p-4">
          <h2 className="text-xl font-semibold">{duty.title}</h2>
          <p className="text-sm text-gray-600">{duty.type}</p>
          <p className="text-sm text-gray-600">{duty.description}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {duty.tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
