import { describe, it, expect, beforeEach } from "vitest";
import { ChessService } from "../ChessService.js";

describe("ChessService (chess.js)", () => {
  let service: ChessService;

  beforeEach(() => {
    service = new ChessService();
  });

  it("should initialize an 8x8 board with correct starting pieces", () => {
    const board = service.getBoard();

    expect(board).toHaveLength(8);
    for (const row of board) expect(row).toHaveLength(8);

    // Black back rank (row 0)
    expect(board[0][0]).toMatchObject({ type: "rook", color: "black" });
    expect(board[0][1]).toMatchObject({ type: "knight", color: "black" });
    expect(board[0][2]).toMatchObject({ type: "bishop", color: "black" });
    expect(board[0][3]).toMatchObject({ type: "queen", color: "black" });
    expect(board[0][4]).toMatchObject({ type: "king", color: "black" });

    // Black pawns (row 1)
    expect(board[1][0]).toMatchObject({ type: "pawn", color: "black" });
    expect(board[1][7]).toMatchObject({ type: "pawn", color: "black" });

    // Empty middle
    expect(board[2][0]).toBeNull();
    expect(board[5][7]).toBeNull();

    // White pawns (row 6)
    expect(board[6][0]).toMatchObject({ type: "pawn", color: "white" });
    expect(board[6][7]).toMatchObject({ type: "pawn", color: "white" });

    // White back rank (row 7)
    expect(board[7][0]).toMatchObject({ type: "rook", color: "white" });
    expect(board[7][3]).toMatchObject({ type: "queen", color: "white" });
    expect(board[7][4]).toMatchObject({ type: "king", color: "white" });
    expect(board[7][7]).toMatchObject({ type: "rook", color: "white" });
  });

  it("getPieceAt should return null for out-of-bounds", () => {
    expect(service.getPieceAt(-1, 0)).toBeNull();
    expect(service.getPieceAt(0, -1)).toBeNull();
    expect(service.getPieceAt(8, 0)).toBeNull();
    expect(service.getPieceAt(0, 8)).toBeNull();
  });

  it("getPieceAt should return the piece at a valid position", () => {
    expect(service.getPieceAt(7, 4)).toMatchObject({ type: "king", color: "white" });
    expect(service.getPieceAt(0, 4)).toMatchObject({ type: "king", color: "black" });
    expect(service.getPieceAt(3, 3)).toBeNull();
  });

  it("movePiece should return false if there is no piece at the source", () => {
    expect(service.movePiece(3, 3, 4, 4)).toBe(false);
    expect(service.getMoveHistory()).toHaveLength(0);
  });

  it("movePiece should return false for an illegal move", () => {
    // Try to move white pawn from a2 (6,0) to a5 (3,0) — illegal (too far)
    expect(service.movePiece(6, 0, 3, 0)).toBe(false);
    expect(service.getMoveHistory()).toHaveLength(0);
  });

  it("movePiece should move a piece legally and record history", () => {
    // Move white pawn from e2 (6,4) to e4 (4,4) — legal opening move
    const ok = service.movePiece(6, 4, 4, 4);
    expect(ok).toBe(true);

    expect(service.getPieceAt(6, 4)).toBeNull();
    expect(service.getPieceAt(4, 4)).toMatchObject({ type: "pawn", color: "white" });

    const history = service.getMoveHistory();
    expect(history).toHaveLength(1);

    const m = history[0];
    expect(m.from).toEqual({ row: 6, col: 4 });
    expect(m.to).toEqual({ row: 4, col: 4 });
    expect(m.piece).toMatchObject({ type: "pawn", color: "white" });
    expect(m.capturedPiece).toBeNull();
    expect(m.timestamp).toBeInstanceOf(Date);
  });

  it("movePiece should enforce turn order", () => {
    // White moves first — trying to move black should fail
    expect(service.movePiece(1, 4, 3, 4)).toBe(false); // black pawn e7→e5

    // White moves first
    expect(service.movePiece(6, 4, 4, 4)).toBe(true); // white pawn e2→e4

    // Now black can move
    expect(service.movePiece(1, 4, 3, 4)).toBe(true); // black pawn e7→e5
  });

  it("movePiece should allow a legal capture", () => {
    // 1. e2→e4
    service.movePiece(6, 4, 4, 4);
    // 2. d7→d5
    service.movePiece(1, 3, 3, 3);
    // 3. e4xd5 — capture
    const ok = service.movePiece(4, 4, 3, 3);
    expect(ok).toBe(true);

    expect(service.getPieceAt(3, 3)).toMatchObject({ type: "pawn", color: "white" });
    expect(service.getPieceAt(4, 4)).toBeNull();

    const history = service.getMoveHistory();
    expect(history).toHaveLength(3);
    expect(history[2].capturedPiece).toMatchObject({ type: "pawn", color: "black" });
  });

  it("getCurrentTurn should return the current turn", () => {
    expect(service.getCurrentTurn()).toBe("white");
    service.movePiece(6, 4, 4, 4);
    expect(service.getCurrentTurn()).toBe("black");
  });

  it("getLegalMoves should return valid destinations for a piece", () => {
    // White pawn on e2 (6,4) can go to e3 (5,4) or e4 (4,4)
    const moves = service.getLegalMoves(6, 4);
    expect(moves).toEqual(
      expect.arrayContaining([
        { row: 5, col: 4 },
        { row: 4, col: 4 }
      ])
    );
    expect(moves).toHaveLength(2);
  });

  it("getGameStatus should return 'playing' at start", () => {
    expect(service.getGameStatus()).toBe("playing");
  });

  it("getLastMove should return null when history is empty, otherwise the last move", () => {
    expect(service.getLastMove()).toBeNull();

    service.movePiece(6, 4, 4, 4);
    service.movePiece(1, 4, 3, 4);

    const last = service.getLastMove();
    expect(last).not.toBeNull();
    expect(last!.from).toEqual({ row: 1, col: 4 });
    expect(last!.to).toEqual({ row: 3, col: 4 });
  });

  it("getAllPiecePositions should return all current pieces", () => {
    const positions = service.getAllPiecePositions();
    expect(positions.length).toBe(32);

    expect(positions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ row: 0, col: 4, piece: expect.objectContaining({ type: "king", color: "black" }) }),
        expect.objectContaining({ row: 7, col: 4, piece: expect.objectContaining({ type: "king", color: "white" }) }),
      ])
    );
  });

  it("reset should restore initial board and clear move history", () => {
    service.movePiece(6, 4, 4, 4);
    expect(service.getMoveHistory().length).toBe(1);

    service.reset();

    expect(service.getMoveHistory().length).toBe(0);
    expect(service.getPieceAt(6, 4)).toMatchObject({ type: "pawn", color: "white" });
    expect(service.getPieceAt(4, 4)).toBeNull();
    expect(service.getCurrentTurn()).toBe("white");
  });
});
