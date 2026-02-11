// Service pour gérer l'état du jeu d'échecs avec chess.js
import { Chess } from 'chess.js';

export class ChessService {
  constructor() {
    this.game = new Chess();
    this.moveHistory = [];
  }

  // Convertit row/col en notation algébrique (ex: 6,4 -> "e2")
  _toSquare(row, col) {
    const files = 'abcdefgh';
    return files[col] + (8 - row);
  }

  // Convertit notation algébrique en row/col (ex: "e2" -> {row:6, col:4})
  _fromSquare(square) {
    const files = 'abcdefgh';
    return {
      row: 8 - parseInt(square[1]),
      col: files.indexOf(square[0])
    };
  }

  // Convertit le type de pièce chess.js vers notre format
  _convertPieceType(chessJsType) {
    const typeMap = { p: 'pawn', r: 'rook', n: 'knight', b: 'bishop', q: 'queen', k: 'king' };
    return typeMap[chessJsType];
  }

  // Convertit la couleur chess.js vers notre format
  _convertColor(chessJsColor) {
    return chessJsColor === 'w' ? 'white' : 'black';
  }

  // Récupère le plateau dans le format { type, color } compatible avec le composant Vue
  getBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = this._toSquare(row, col);
        const piece = this.game.get(square);
        if (piece) {
          board[row][col] = {
            type: this._convertPieceType(piece.type),
            color: this._convertColor(piece.color)
          };
        }
      }
    }
    return board;
  }

  // Récupère une pièce à une position donnée
  getPieceAt(row, col) {
    if (row < 0 || row > 7 || col < 0 || col > 7) {
      return null;
    }
    const square = this._toSquare(row, col);
    const piece = this.game.get(square);
    if (!piece) return null;
    return {
      type: this._convertPieceType(piece.type),
      color: this._convertColor(piece.color)
    };
  }

  // Déplace une pièce — retourne false si le coup est illégal
  movePiece(fromRow, fromCol, toRow, toCol) {
    const from = this._toSquare(fromRow, fromCol);
    const to = this._toSquare(toRow, toCol);

    const piece = this.getPieceAt(fromRow, fromCol);
    if (!piece) return false;

    const capturedPiece = this.getPieceAt(toRow, toCol);

    try {
      const result = this.game.move({ from, to, promotion: 'q' });
      if (!result) return false;

      this.moveHistory.push({
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol },
        piece: { ...piece },
        capturedPiece: capturedPiece ? { ...capturedPiece } : null,
        timestamp: new Date()
      });

      return true;
    } catch (e) {
      return false;
    }
  }

  // Retourne les cases légales pour une pièce à (row, col)
  getLegalMoves(row, col) {
    const square = this._toSquare(row, col);
    const moves = this.game.moves({ square, verbose: true });
    return moves.map(m => this._fromSquare(m.to));
  }

  // Retourne le tour actuel ('white' ou 'black')
  getCurrentTurn() {
    return this.game.turn() === 'w' ? 'white' : 'black';
  }

  // Retourne le statut de la partie
  getGameStatus() {
    if (this.game.isCheckmate()) return 'checkmate';
    if (this.game.isStalemate()) return 'stalemate';
    if (this.game.isDraw()) return 'draw';
    if (this.game.isCheck()) return 'check';
    return 'playing';
  }

  // Récupère toutes les positions des pièces
  getAllPiecePositions() {
    const positions = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.getPieceAt(row, col);
        if (piece) {
          positions.push({ row, col, piece: { ...piece } });
        }
      }
    }
    return positions;
  }

  // Récupère l'historique des déplacements
  getMoveHistory() {
    return [...this.moveHistory];
  }

  // Récupère le dernier mouvement
  getLastMove() {
    return this.moveHistory.length > 0
      ? this.moveHistory[this.moveHistory.length - 1]
      : null;
  }

  // Réinitialise le plateau
  reset() {
    this.game = new Chess();
    this.moveHistory = [];
  }
}