export type AppState = "idle" | "settings" | "game" | "results";

export type Move = "x" | "o";

export type GameStatus = `${Move}-move` | `${Move}-wins` | "draw";

export type Board = Array<Move | null>;

export type Player = {
  name: string;
  color: string; 
};

export type Players = {
  x: Player;
  o: Player;
};
