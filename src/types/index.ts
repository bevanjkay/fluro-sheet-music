export interface CustomSetlist {
  _id: string;
  title: string;
  songs: PlanSong[];
  created: Date | null;
}

export interface Image {
  _id: string;
}

export interface Plan {
  _id: string;
  title: string;
  schedules: Schedule[];
  startDate: Date;
}

export interface PlanSong {
  _id: string;
  key: string;
  title: string;
  type: string;
}

export interface PopulatedSong {
  _id: string;
  title: string;
  data: SongData;
  selectedSheet?: Sheet;
  pages?: number[];
  sheetMusic?: Sheet[];
}

export interface Schedule {
  _id: string;
  key: string;
  title: string;
  type: string;
}

export interface Service {
  _id: string;
  title: string;
  startDate: Date;
  plans: Plan[];
  mainImage: Image;
}

export interface Session {
  _id: string;
}

export interface Sheet {
  _id: string;
  title: string;
  data?: SheetData;
}

export interface SheetData {
  key?: string;
}

export interface Song {
  _id: string;
  title: string;
  data: SongData;
}

export interface SongData {
  key: string;
  sheetMusic: Sheet[];
  firstLine: string;
}

export interface User {
  token: string;
  refreshToken: string;
  firstName?: string;
}