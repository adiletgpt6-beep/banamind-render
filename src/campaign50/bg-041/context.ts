// Губы персонажей. В BG-041 говорит только закадровый диктор, поэтому рты
// персонажей закрыты (CLOSED); мимика — через выражения лица (pose.ts).
export type Viseme = { readonly open: number; readonly round: number; readonly wide: number };
export const CLOSED: Viseme = { open: 0, round: 0, wide: 0 };
