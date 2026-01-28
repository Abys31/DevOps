import { describe, it, expect, beforeEach } from "vitest";
import { ChessService } from "../ChessService";

describe("ChessService (8x8 board)", () => {
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
    // Middle board is empty initially
    expect(service.movePiece(3, 3, 4, 4)).toBe(false);
    expect(service.getMoveHistory()).toHaveLength(0);
  });

  it("movePiece should move a piece freely to an empty square and record history", () => {
    // Move white pawn from (6,0) to (4,0) (free mode)
    const ok = service.movePiece(6, 0, 4, 0);
    expect(ok).toBe(true);

    expect(service.getPieceAt(6, 0)).toBeNull();
    expect(service.getPieceAt(4, 0)).toMatchObject({ type: "pawn", color: "white" });

    const history = service.getMoveHistory();
    expect(history).toHaveLength(1);

    const m = history[0];
    expect(m.from).toEqual({ row: 6, col: 0 });
    expect(m.to).toEqual({ row: 4, col: 0 });
    expect(m.piece).toMatchObject({ type: "pawn", color: "white" });
    expect(m.capturedPiece).toBeNull();
    expect(m.timestamp).toBeInstanceOf(Date);
  });

  it("movePiece should replace (capture) a piece if destination is occupied", () => {
    // Move white pawn from (6,0) onto a black pawn at (1,0)
    const ok = service.movePiece(6, 0, 1, 0);
    expect(ok).toBe(true);

    // Destination now has white pawn
    expect(service.getPieceAt(1, 0)).toMatchObject({ type: "pawn", color: "white" });
    // Source cleared
    expect(service.getPieceAt(6, 0)).toBeNull();

    const history = service.getMoveHistory();
    expect(history).toHaveLength(1);
    expect(history[0].capturedPiece).toMatchObject({ type: "pawn", color: "black" });
  });

  it("getLastMove should return null when history is empty, otherwise the last move", () => {
    expect(service.getLastMove()).toBeNull();

    service.movePiece(6, 1, 5, 1);
    service.movePiece(6, 2, 5, 2);

    const last = service.getLastMove();
    expect(last).not.toBeNull();
    expect(last!.from).toEqual({ row: 6, col: 2 });
    expect(last!.to).toEqual({ row: 5, col: 2 });
  });

  it("getAllPiecePositions should return all current pieces with their positions", () => {
    const positions = service.getAllPiecePositions();

    // Initial pieces = 32
    expect(positions.length).toBe(32);

    // Contains some known pieces
    expect(positions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ row: 0, col: 4, piece: expect.objectContaining({ type: "king", color: "black" }) }),
        expect.objectContaining({ row: 7, col: 4, piece: expect.objectContaining({ type: "king", color: "white" }) }),
      ])
    );
  });

  it("reset should restore initial board and clear move history", () => {
    service.movePiece(6, 0, 4, 0);
    expect(service.getMoveHistory().length).toBe(1);

    service.reset();

    expect(service.getMoveHistory().length).toBe(0);
    expect(service.getPieceAt(6, 0)).toMatchObject({ type: "pawn", color: "white" });
    expect(service.getPieceAt(4, 0)).toBeNull();
  });

  it("getBoard returns the internal board reference (sanity)", () => {
    const b1 = service.getBoard();
    const b2 = service.getBoard();
    expect(b1).toBe(b2);
  });
});
