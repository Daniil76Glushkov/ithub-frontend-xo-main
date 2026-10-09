import {
  createContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

import type { Board, GameStatus } from "@/types";

export const gameContext = createContext<{
  board: Board;
  status: GameStatus;
  updateBoard: Dispatch<SetStateAction<Board>>;
  updateStatus: Dispatch<SetStateAction<GameStatus>>;
}>(undefined!);

export function GameContext({ children }: PropsWithChildren) {
  const [board, updateBoard] = useState<Board>(Array(9).fill(null));
  const [status, updateStatus] = useState<GameStatus>("x-move");

  return (
    <gameContext.Provider value={{ board, updateBoard, status, updateStatus }}>
      {children}
    </gameContext.Provider>
  );
}
