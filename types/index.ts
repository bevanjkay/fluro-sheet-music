declare global {

  interface CustomSetlist {
    _id?: string
    title: string
    songs: PlanSong[]
    created: Date | null
  }

  interface Image {
    _id: string
  }

  interface Plan {
    _id: string
    title: string
    schedules: Schedule[],
    startDate: Date,
  }

  interface PlanSong {
    _id: string
    key: string
    title: string
    type: string
  }

  interface PopulatedSong {
    _id: string
    title: string
    data: SongData
    selectedSheet?: Sheet
    pages?: number[]
    sheetMusic?: Sheet[]
  }

  interface Schedule {
    _id: string
    key: string
    title: string
    type: string
  }

  interface Service {
    _id: string
    title: string
    startDate: Date
    plans: Plan[]
    mainImage: Image
  }

  interface Session {
    _id: string
  }

  interface Sheet {
    _id: string
    title: string
    data?: SheetData
  }

  interface SheetData {
    key?: string
  }

  interface Song {
    _id: string
    title: string
    data: SongData
  }

  interface SongData {
    key: string
    sheetMusic: Sheet[]
  }

  interface User {
    token: string
    refreshToken: string
  }
}
