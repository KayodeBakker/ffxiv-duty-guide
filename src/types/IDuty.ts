export interface IDuty {
    id: number;
    slug: string;
    title: string;
    tags: string[];
    type: "Dungeon" | "Trial" | "Raid";  // Add type field with possible values
    patch: string;
    backgroundImage: string;
    description: string;
  }
  