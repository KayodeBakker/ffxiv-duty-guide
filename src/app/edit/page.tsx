"use client";

import { useState, useEffect } from "react";
import { IDuty } from "@/types/IDuty";

export default function EditPage() {
  const [duties, setDuties] = useState<IDuty[]>([]);
  const [editedDuties, setEditedDuties] = useState<IDuty[]>([]);
  const [selectedType, setSelectedType] = useState<string>("All"); // State for the selected type

  // Load the duties data (first from localStorage, then from duties.json if localStorage is empty)
  useEffect(() => {
    const storedDuties = localStorage.getItem("duties");
    if (storedDuties) {
      const parsedDuties = JSON.parse(storedDuties);
      setDuties(sortDutiesById(parsedDuties));  // Sort the duties when loading from localStorage
      setEditedDuties(sortDutiesById(parsedDuties));
    } else {
      // Fetch duties.json from the public directory if localStorage is empty
      fetch("/data/duties.json")
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch duties.json: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          const sortedData = sortDutiesById(data);
          setDuties(sortedData);
          setEditedDuties(sortedData);
          // Save the fetched duties to localStorage
          localStorage.setItem("duties", JSON.stringify(sortedData));
        })
        .catch((error) => {
          console.error("Error loading duties.json:", error);
        });
    }
  }, []);

  // Function to sort duties by ID in ascending order
  const sortDutiesById = (duties: IDuty[]): IDuty[] => {
    return duties.sort((a, b) => a.id - b.id);  // Sort in ascending order
  };


  // Function to filter duties by type
  const filterDutiesByType = (duties: IDuty[]) => {
    if (selectedType === "All") return duties;
    return duties.filter((duty) => duty.type === selectedType);
  };

  // Update duties in local state when any field is edited
  const handleDutyChange = (index: number, key: keyof IDuty, value: string | string[]) => {
    const updatedDuties = [...editedDuties];

    if (key === "tags" && Array.isArray(value)) {
      updatedDuties[index] = {
        ...updatedDuties[index],
        [key]: value, // Set tags as an array
      };
    } else {
      updatedDuties[index] = {
        ...updatedDuties[index],
        [key]: value, // For other fields (title, description), treat as string
      };
    }

    const sortedDuties = sortDutiesById(updatedDuties); // Sort after updating
    setEditedDuties(sortedDuties);
    localStorage.setItem("duties", JSON.stringify(sortedDuties)); // Save sorted duties
  };

  // Function to download the modified JSON file
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(editedDuties, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "duties.json";  // The file name when downloaded
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset to the original duties from the server (duties.json)
  const resetToServerData = () => {
    fetch("/data/duties.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch duties.json: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const sortedData = sortDutiesById(data);
        setDuties(sortedData);
        setEditedDuties(sortedData);
        localStorage.setItem("duties", JSON.stringify(sortedData)); // Reset localStorage
      })
      .catch((error) => {
        console.error("Error loading duties.json:", error);
      });
  };

  // Add a new duty with the highest id
  const addDuty = () => {
    const newId = Math.max(...editedDuties.map(duty => duty.id)) + 1;
    const newDuty: IDuty = {
      id: newId,
      slug: "",
      title: "",
      tags: [],
      type: "Dungeon", // Default to "Dungeon"
      patch: "",
      backgroundImage: "",
      description: "",
    };
    const updatedDuties = [...editedDuties, newDuty];
    const sortedDuties = sortDutiesById(updatedDuties);  // Sort after adding
    setEditedDuties(sortedDuties);  // Update state with sorted duties
    localStorage.setItem("duties", JSON.stringify(sortedDuties));  // Save sorted duties
  };

  // Remove a duty and reindex the duties
  const removeDuty = (index: number) => {
    const updatedDuties = editedDuties.filter((_, i) => i !== index);

    // Reindex duties to ensure IDs are continuous and sorted
    const reindexedDuties = updatedDuties.map((duty, index) => ({
      ...duty,
      id: index + 1, // Reindex starting from 1
    }));

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
          onChange={(e) => setSelectedType(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="All">All</option>
          <option value="Dungeon">Dungeons</option>
          <option value="Trial">Trials</option>
          <option value="Raid">Raids</option>
        </select>

      </div><div className="space-y-4">
        {filterDutiesByType(editedDuties).length > 0 ? (
          filterDutiesByType(editedDuties).map((duty) => {
            const realIndex = editedDuties.findIndex(d => d.id === duty.id); // Find the real index

            return (
              <div key={duty.id} className="border p-4 rounded-md">
                <h2 className="text-xl font-semibold">ID #{duty.id}</h2>

                <input
                  type="text"
                  value={duty.title}
                  onChange={(e) =>
                    handleDutyChange(realIndex, "title", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md my-2"
                />

                <textarea
                  value={duty.tags.join(", ")}
                  onChange={(e) =>
                    handleDutyChange(realIndex, "tags", e.target.value.split(",").map(tag => tag.trim()))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md my-2"
                  placeholder="Enter tags here"
                />

                <textarea
                  value={duty.description}
                  onChange={(e) =>
                    handleDutyChange(realIndex, "description", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md my-2"
                />

                <select
                  value={duty.type}
                  onChange={(e) =>
                    handleDutyChange(realIndex, "type", e.target.value as IDuty["type"])
                  }
                  className="w-full p-2 border border-gray-300 rounded-md my-2"
                >
                  <option value="Dungeon">Dungeon</option>
                  <option value="Trial">Trial</option>
                  <option value="Raid">Raid</option>
                </select>

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

      <div className="mt-6 flex gap-4">
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
          onClick={downloadJSON}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Download JSON
        </button>
      </div>
    </main>
  );
}
