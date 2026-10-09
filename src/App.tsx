import { useEffect, useState } from "react";
import type { Board, Move, Players, Player } from "@/types";

const EMPTY_BOARD: Board = Array(9).fill(null);
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];
const DEFAULT_PLAYERS: Players = {
  x: { name: "Игрок 1", color: "#7cdbff" },
  o: { name: "Игрок 2", color: "#c5a1ff" },
};
type Screen = "idle" | "settings" | "progress" | "results";
type SavedGame = { move: Move; board: Board };

function getWinner(board: Board): { winner: Move; line: number[] } | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return { winner: board[a] as Move, line };
    }
  }
  return null;
}

function readPlayers(): Players {
  try {
    const saved = localStorage.getItem("xo__players");
    if (saved) return { ...DEFAULT_PLAYERS, ...JSON.parse(saved) };
  } catch { /* use default names if storage is damaged */ }
  return DEFAULT_PLAYERS;
}

function readGame(): SavedGame | null {
  try {
    const saved = localStorage.getItem("xo__game");
    if (!saved) return null;
    const data = JSON.parse(saved);
    
    if (Array.isArray(data) && data.length === 9) {
      if (data.some((cell) => cell !== null)) {
        return { board: data, move: data.filter(Boolean).length % 2 === 0 ? "x" : "o" };
      }
      return null;
    }
    if (Array.isArray(data.board) && data.board.length === 9 && data.board.some((cell: Move | null) => cell !== null)) {
      return { board: data.board, move: data.move === "o" ? "o" : "x" };
    }
  } catch {}
  return null;
}

function Icon({ mark, color }: { mark: Move; color: string }) {
  return <span className={`mark mark-${mark}`} style={{ color }}>{mark === "x" ? "×" : "○"}</span>;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("idle");
  const [players, setPlayers] = useState<Players>(DEFAULT_PLAYERS);
  const [board, setBoard] = useState<Board>(EMPTY_BOARD);
  const [move, setMove] = useState<Move>("x");
  const [savedGame, setSavedGame] = useState<SavedGame | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [seconds, setSeconds] = useState(10);
  const [roundResult, setRoundResult] = useState<{ winner: Move; line: number[] } | null>(null);
  const [isDraw, setIsDraw] = useState(false);

  useEffect(() => {
    setPlayers(readPlayers());
    setSavedGame(readGame());
  }, []);

  useEffect(() => {
    if (screen === "progress") {
      localStorage.setItem("xo__game", JSON.stringify({ move, board }));
    }
  }, [screen, board, move]);

  useEffect(() => {
    if (screen !== "progress") return;
    const timer = window.setInterval(() => {
      setSeconds((value) => (value <= 0 ? 0 : value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [screen]);

  useEffect(() => {
    if (screen !== "progress" || seconds !== 0) return;
    const empty = board.map((cell, index) => cell === null ? index : -1).filter((index) => index >= 0);
    if (empty.length === 0) return;
    const next = [...board];
    next[empty[Math.floor(Math.random() * empty.length)]] = move;
    setBoard(next);
    const result = getWinner(next);
    if (result) {
      setRoundResult(result);
      setIsDraw(false);
      setScreen("results");
      localStorage.removeItem("xo__game");
    } else if (next.every(Boolean)) {
      setRoundResult(null);
      setIsDraw(true);
      setScreen("results");
      localStorage.removeItem("xo__game");
    } else {
      setMove(move === "x" ? "o" : "x");
      setSeconds(10);
    }
  }, [seconds, screen, board, move]);

  function startNewGame() {
    setBoard([...EMPTY_BOARD]);
    setMove("x");
    setSeconds(10);
    setRoundResult(null);
    setIsDraw(false);
    setSavedGame(null);
    localStorage.removeItem("xo__game");
    setScreen("settings");
  }

  function beginGame() {
    const cleanPlayers: Players = {
      x: { ...players.x, name: players.x.name.trim() || "Игрок 1" },
      o: { ...players.o, name: players.o.name.trim() || "Игрок 2" },
    };
    setPlayers(cleanPlayers);
    localStorage.setItem("xo__players", JSON.stringify(cleanPlayers));
    setBoard([...EMPTY_BOARD]);
    setMove("x");
    setRoundResult(null);
    setIsDraw(false);
    setSeconds(10);
    localStorage.removeItem("xo__game");
    setScreen("progress");
  }

  function makeMove(index: number) {
    if (board[index] !== null || screen !== "progress") return;
    const next = [...board];
    next[index] = move;
    setBoard(next);
    setSeconds(10);
    const result = getWinner(next);
    if (result) {
      setRoundResult(result);
      setIsDraw(false);
      setScreen("results");
      localStorage.removeItem("xo__game");
    } else if (next.every(Boolean)) {
      setRoundResult(null);
      setIsDraw(true);
      setScreen("results");
      localStorage.removeItem("xo__game");
    } else {
      setMove(move === "x" ? "o" : "x");
    }
  }

  function continueGame() {
    if (!savedGame) return;
    setBoard(savedGame.board);
    setMove(savedGame.move);
    setRoundResult(null);
    setIsDraw(false);
    setScreen("progress");
  }

  function updatePlayer(key: Move, field: keyof Player, value: string) {
    setPlayers((current) => ({ ...current, [key]: { ...current[key], [field]: value } }));
  }

  const currentPlayer = players[move];
  const finished = screen === "results";
  const winningLine = finished ? roundResult?.line ?? [] : [];

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <button className="brand" onClick={() => setScreen("idle")} aria-label="На главную"><span className="brand-icon">XO</span><span>Крестики-нолики</span></button>
        <span className="top-note">Игра для двух игроков</span>
      </header>

      {screen === "idle" && <section className="splash screen-card">
        
        <div className="hero-mark"><span className="hero-x">×</span><span className="hero-o">○</span></div>
        {savedGame ? <div className="resume-panel"><div><strong>У тебя есть незаконченная партия</strong><span>Продолжим с того же хода?</span></div><div className="resume-actions"><button className="button button-primary" onClick={continueGame}>Продолжить <span>↗</span></button><button className="button button-quiet" onClick={startNewGame}>Новая игра</button></div></div> : <button className="button button-primary hero-button" onClick={() => setScreen("settings")}>Начать игру <span>↗</span></button>}
        
      </section>}

      {screen === "settings" && <section className="screen-card settings-screen">
        <div className="section-top"><span className="step-label">Настройки</span></div>
        <h1>Настройки игроков</h1>
        <p className="section-copy">Введите имена и выберите цвет символов.</p>
        <div className="players-grid">
          {(["x", "o"] as Move[]).map((key, index) => <div className={`player-card player-${key}`} key={key}>
            <div className="player-card-head"><span className="player-symbol" style={{ color: players[key].color }}><Icon mark={key} color={players[key].color} /></span><span className="player-number">ИГРОК 0{index + 1}</span></div>
            <label htmlFor={`player-${key}`}>Имя игрока</label>
            <input id={`player-${key}`} maxLength={18} value={players[key].name} onChange={(event) => updatePlayer(key, "name", event.target.value)} placeholder={`Игрок ${index + 1}`} />
            <div className="color-row"><label htmlFor={`color-${key}`}>Цвет символа</label><div className="color-picker"><input id={`color-${key}`} type="color" value={players[key].color} onChange={(event) => updatePlayer(key, "color", event.target.value)} /><span>{players[key].color.toUpperCase()}</span></div></div>
          </div>)}
        </div>
        <div className="settings-actions"><button className="button button-quiet" onClick={() => setScreen("idle")}>← Назад</button><button className="button button-primary" onClick={beginGame}>На поле <span>↗</span></button></div>

      </section>}

      {screen === "progress" && <section className="screen-card game-screen">
        <div className="section-top"><span className="step-label">Игра</span></div>
        <div className="game-heading"><div><h1>Игровое поле</h1><p className="section-copy">Ход игрока: {currentPlayer.name}</p></div><button className="icon-button" title="Начать заново" onClick={() => setShowReset(true)}>↻</button></div>
        <div className="turn-card"><div className="turn-player"><span className="turn-symbol" style={{ color: currentPlayer.color }}><Icon mark={move} color={currentPlayer.color} /></span><div><span className="turn-caption">ХОДИТ</span><strong>{currentPlayer.name}</strong></div></div><div className="timer-block"><span className="timer-number">00:{String(seconds).padStart(2, "0")}</span><span className="timer-caption">СЕКУНД НА ХОД</span><div className="timer-track"><span style={{ width: `${seconds * 10}%` }} /></div></div></div>
        <div className="board" role="grid" aria-label="Игровое поле">
          {board.map((cell, index) => <button key={index} role="gridcell" aria-label={`Клетка ${index + 1}${cell ? `, ${cell === "x" ? "крестик" : "нолик"}` : ", пустая"}`} className={`cell ${cell ? `cell-${cell}` : ""} ${winningLine.includes(index) ? "cell-winner" : ""}`} onClick={() => makeMove(index)} disabled={cell !== null} style={cell ? { color: players[cell].color } : undefined}>{cell && <Icon mark={cell} color={players[cell].color} />}</button>)}
        </div>
        <div className="game-footer"><div className={`mini-player ${move === "x" ? "mini-active" : ""}`}><span className="mini-mark" style={{ color: players.x.color }}>×</span><span>{players.x.name}</span></div><span className="vs-label">VS</span><div className={`mini-player ${move === "o" ? "mini-active" : ""}`}><span className="mini-mark" style={{ color: players.o.color }}>○</span><span>{players.o.name}</span></div></div>
        <button className="reset-link" onClick={() => setShowReset(true)}>↻ Начать заново</button>
        {showReset && <div className="modal-backdrop" role="presentation"><div className="modal" role="dialog" aria-modal="true" aria-labelledby="reset-title"><div className="modal-icon">↻</div><h2 id="reset-title">Начать заново?</h2><p>Текущая партия будет сброшена.</p><div className="modal-actions"><button className="button button-quiet" onClick={() => setShowReset(false)}>Продолжить игру</button><button className="button button-primary" onClick={() => { setShowReset(false); startNewGame(); }}>Сбросить <span>↗</span></button></div></div></div>}
      </section>}

      {finished && <section className="screen-card results-screen">
        <div className="section-top"><span className="step-label">Результат</span></div>
        <div className="result-symbol">{roundResult ? <Icon mark={roundResult.winner} color={players[roundResult.winner].color} /> : <span>＝</span>}</div>
        <span className={`result-kicker ${isDraw ? "draw-kicker" : ""}`}>{isDraw ? "НИЧЬЯ" : "ПОБЕДИТЕЛЬ"}</span>
        <h1>{isDraw ? <>Ничья</> : <>{players[roundResult!.winner].name} победил!</>}</h1>
        <p className="section-copy">{isDraw ? "Все клетки заполнены. Попробуйте сыграть ещё раз." : "Игра завершена."}</p>
        <div className="result-board board board-small">{board.map((cell, index) => <div key={index} className={`cell result-cell ${cell ? `cell-${cell}` : ""} ${winningLine.includes(index) ? "cell-winner" : ""}`} style={cell ? { color: players[cell].color } : undefined}>{cell && <Icon mark={cell} color={players[cell].color} />}</div>)}</div>
        <button className="button button-primary hero-button" onClick={startNewGame}>Новая игра <span>↗</span></button>
        <button className="reset-link" onClick={() => setScreen("idle")}>На главный экран</button>
      </section>}

      <footer className="page-footer">Крестики-нолики</footer>
    </main>
  );
}
