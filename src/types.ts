import type paper from "paper"
import type firebase from "firebase/compat/app"

export interface PathData {
  path: string
  edges: number
  width: number
  height: number
  length: number
}

export interface Tangram extends PathData {
  id?: string
  uid?: string
  approved?: boolean
  category?: string
  emoji?: string
}

export interface SavedTangram extends Tangram {
  id: string
  uid: string
  category: string
  emoji: string
}

export interface UserMetadata {
  username: string
  signupDate: number
  isAdmin?: boolean
}

export interface CurrentUser extends UserMetadata {
  uid: string
  firebaseUser: firebase.User
}

export type TanId = "st1" | "st2" | "mt1" | "lt1" | "lt2" | "sq" | "rh"

export interface TanGroup extends paper.Group {
  children: paper.Path[] &
    Record<"display" | "collision" | "insetBorder" | "display 1", paper.Path>
  data: {
    id: TanId
    collisions: Set<TanId>
    rotation: number
    removeListeners: () => void
  }
}

export interface PiecesGroup extends paper.Group {
  children: TanGroup[]
}

export type Outline = paper.Path | paper.CompoundPath
export type TangramStats = Record<
  string,
  { completed?: number; starred?: boolean }
>
export type CompletionMap = Record<string, Record<string, number | undefined>>
export type StarMap = Record<string, Record<string, boolean | undefined>>
