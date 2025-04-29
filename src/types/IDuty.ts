export interface IDuty {
    id: number;
    slug: string;
    title: string;
    tags: string[];
    type: DutyType;  // Add type field with possible values
    patch: string;
    backgroundImage: string;
    description: string;
  }

export enum DutyType {
    Dungeon = "Dungeon",
    Trial = "Trial",
    Raid = "Raid",
    All = "All",
  }
  