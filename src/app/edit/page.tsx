"use client";

import { useState, useEffect } from "react";
import { IDuty, DutyType } from "@/types/IDuty";

export default function EditPage() {
  const [editedDuties, setEditedDuties] = useState<IDuty[]>([]);
  const [selectedType, setSelectedType] = useState<DutyType>(DutyType.All); // State for the selected type

  // Load the duties data (first from localStorage, then from duties.json if localStorage is empty)
  useEffect(() => {
    const storedDuties = localStorage.getItem("duties");
    if (storedDuties) {
      const parsedDuties = JSON.parse(storedDuties);
      setEditedDuties(sortDutiesById(parsedDuties));
    } else {
      Promise.all([
        fetch("/data/dungeons.json").then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch dungeons.json: ${res.status}`);
          return res.json();
        }),
        fetch("/data/trials.json").then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch trials.json: ${res.status}`);
          return res.json();
        }),
        fetch("/data/raids.json").then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch raids.json: ${res.status}`);
          return res.json();
        }),
      ]).then(([dungeons, trials, raids]) => {
        const sortedData = sortDutiesById([...dungeons, ...trials, ...raids]);
        setEditedDuties(sortedData);
        // Save the fetched duties to localStorage
        localStorage.setItem("duties", JSON.stringify(sortedData));
      }).catch((error) => {
        console.error("Failed to fetch duties:", error);
      });
    }
  }, []);

  // Function to sort duties by ID in ascending order
  const sortDutiesById = (duties: IDuty[]): IDuty[] => {
    return duties.sort((a, b) => a.id - b.id);  // Sort in ascending order
  };


  // Function to filter duties by type
  const filterDutiesByType = (duties: IDuty[]) => {
    duties = sortDutiesById(duties);
    if (selectedType === DutyType.All) return duties;
    return duties.filter((duty) => duty.type === selectedType);
  };

  // Update duties in local state when any field is edited
  const handleDutyChange = (index: number, key: keyof IDuty, value: string | string[] | DutyType) => {
    const updatedDuties = [...editedDuties];

    if (key === "type" && value !== updatedDuties[index].type) {
      const relevantDuties = updatedDuties.filter((d) => d.type === value);
      const newId = relevantDuties.length + 1;
      updatedDuties[index] = {
        ...updatedDuties[index],
        id: newId, // Update ID to the new max ID for the selected type
        type: value as DutyType, // Update type
      };
    }

    if (key === "title") {
      updatedDuties[index] = {
        ...updatedDuties[index],
        slug: (value as string).toLocaleLowerCase().replace(/\s+/g, "-"), // Update slug based on title
        backgroundImage: "/images/" + (value as string).toLocaleLowerCase().replace(/\s+/g, "-") + ".jpg", // Update backgroundImage based on title
        title: value as string, // For other fields (title, description), treat as string
      };
    }
    else {
      updatedDuties[index] = {
        ...updatedDuties[index],
        [key]: value, // For other fields (title, description), treat as string
      };
    }

    // const sortedDuties = sortDutiesById(updatedDuties); // Sort after updating
    setEditedDuties(updatedDuties);
    localStorage.setItem("duties", JSON.stringify(updatedDuties)); // Save sorted duties
  };

  // Function to download the modified JSON file
  const downloadJSON = (data: IDuty[], filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    const dungeons = editedDuties.filter((d) => d.type === DutyType.Dungeon);
    const trials = editedDuties.filter((d) => d.type === DutyType.Trial);
    const raids = editedDuties.filter((d) => d.type === DutyType.Raid);

    downloadJSON(dungeons, "dungeons.json");
    downloadJSON(trials, "trials.json");
    downloadJSON(raids, "raids.json");
  };


  // Reset to the original duties from the server (duties.json)
  const resetToServerData = () => {
    Promise.all([
      fetch("/data/dungeons.json").then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch dungeons.json: ${res.status}`);
        return res.json();
      }),
      fetch("/data/trials.json").then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch trials.json: ${res.status}`);
        return res.json();
      }),
      fetch("/data/raids.json").then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch raids.json: ${res.status}`);
        return res.json();
      }),
    ]).then(([dungeons, trials, raids]) => {
      const sortedData = sortDutiesById([...dungeons, ...trials, ...raids]);
      setEditedDuties(sortedData);
      // Save the fetched duties to localStorage
      localStorage.setItem("duties", JSON.stringify(sortedData));
    }).catch((error) => {
      console.error("Error loading duties.json:", error);
    });
  };

  // Add a new duty with the highest id
  const addDuty = () => {
    const newDuty: IDuty = {
      id: 0,
      slug: "",
      title: "",
      tags: [],
      type: DutyType.Dungeon, // Default to "Dungeon"
      patch: "",
      backgroundImage: "",
      description: "",
    };
    const updatedDuties = [...editedDuties, newDuty];
    const reindexedDuties = updatedDuties.map((duty, _, array) => {
      // Get all duties of the same type
      const sameTypeDuties = array.filter(d => d.type === duty.type);
      // Find this duty's position among duties of the same type
      const typeIndex = sameTypeDuties.findIndex(d => d === duty);
      return {
        ...duty,
        id: typeIndex + 1, // Index within the type
      };
    });

    const sortedDuties = sortDutiesById(reindexedDuties);  // Sort after adding
    setEditedDuties(sortedDuties);  // Update state with sorted duties
    localStorage.setItem("duties", JSON.stringify(sortedDuties));  // Save sorted duties
  };

  // Remove a duty and reindex the duties
  const removeDuty = (index: number) => {
    const updatedDuties = editedDuties.filter((_, i) => i !== index);

    // Reindex duties to ensure IDs are continuous and sorted
    const reindexedDuties = updatedDuties.map((duty, _, array) => {
      // Get all duties of the same type
      const sameTypeDuties = array.filter(d => d.type === duty.type);
      // Find this duty's position among duties of the same type
      const typeIndex = sameTypeDuties.findIndex(d => d === duty);
      return {
        ...duty,
        id: typeIndex + 1, // Index within the type
      };
    });

    const sortedDuties = sortDutiesById(reindexedDuties);  // Sort after removing
    setEditedDuties(sortedDuties);
    localStorage.setItem("duties", JSON.stringify(sortedDuties));
  };

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit FFXIV Duty Guide</h1>

      {/* Dropdown to filter duties by type */}
      <div className="mb-4">
        <label htmlFor="typeFilter" className="block mb-2 text-lg">Filter by Type</label>
        <select
          id="typeFilter"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as DutyType)}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value={DutyType.All}>All</option>
          <option value={DutyType.Dungeon}>Dungeons</option>
          <option value={DutyType.Trial}>Trials</option>
          <option value={DutyType.Raid}>Raids</option>
        </select>
      </div>

      {/* Render filtered duties */}
      <div className="space-y-4">
        {filterDutiesByType(editedDuties).length > 0 ? (
          filterDutiesByType(editedDuties).map((duty) => {
            // Find the index of the duty in the full edited list
            const realIndex = editedDuties.findIndex(d => d.id === duty.id && d.type === duty.type);

            return (
              <div key={`${duty.type}-${duty.id}`} className="border p-4 rounded-md">
                <h2 className="text-xl font-semibold">
                  {duty.type} #{duty.id}
                </h2>

                {/* Title Input */}
                <input
                  type="text"
                  value={duty.title ?? ""}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    handleDutyChange(realIndex, "title", newTitle);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md my-2"
                  placeholder="Title"
                />

                {/* Patch Input */}
                <input
                  type="text"
                  value={duty.patch ?? ""}
                  onChange={(e) =>
                    handleDutyChange(realIndex, "patch", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md my-2"
                  placeholder="Patch (e.g., 6.5)"
                />

                {/* Background Image Input + Preview */}
                <div className="flex items-center gap-4 my-2">
                  {duty.backgroundImage && (
                    <img
                      src={duty.backgroundImage}
                      alt="Background preview"
                      className="w-24 h-24 object-cover rounded border"
                    />
                  )}
                </div>

                {/* Tags */}
                <textarea
                  value={duty.tags?.join(", ") ?? ""}
                  onChange={(e) =>
                    handleDutyChange(
                      realIndex,
                      "tags",
                      e.target.value
                        .split(",")
                        .map(tag => tag.trim())
                        .filter(tag => tag !== "")
                    )
                  }
                  className="w-full p-2 border border-gray-300 rounded-md my-2"
                  placeholder="Enter tags here"
                />

                {/* Description */}
                <textarea
                  value={duty.description ?? ""}
                  onChange={(e) =>
                    handleDutyChange(realIndex, "description", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md my-2"
                  placeholder="Description"
                />

                {/* Type Selector */}
                <select
                  value={duty.type}
                  onChange={(e) =>
                    handleDutyChange(realIndex, "type", e.target.value as DutyType)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md my-2"
                >
                  <option value="Dungeon">Dungeon</option>
                  <option value="Trial">Trial</option>
                  <option value="Raid">Raid</option>
                </select>

                {/* Remove Button */}
                <button
                  onClick={() => removeDuty(realIndex)}
                  className="mt-2 bg-red-500 text-white px-4 py-2 rounded-md"
                >
                  Remove
                </button>
              </div>


            );
          })
        ) : (
          <p>No duties found for this category.</p>
        )}
      </div>

      {/* Controls */}
      <div className="mt-6 flex gap-4 flex-wrap">
        <button
          onClick={addDuty}
          className="bg-green-500 text-white px-4 py-2 rounded-md"
        >
          Add New Duty
        </button>
        <button
          onClick={resetToServerData}
          className="bg-yellow-500 text-white px-4 py-2 rounded-md"
        >
          Reset to Server Data
        </button>
        <button
          onClick={handleDownloadAll}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Download All Files
        </button>
      </div>
    </main>
  );

}
