<template>
  <div class="chess-container">
    <h1>Jeu d'Échecs</h1>

    <!-- Indicateur de tour et statut -->
    <div class="status-bar" data-testid="status-bar">
      <div class="turn-indicator" data-testid="turn-indicator">
        <span class="turn-dot" :class="currentTurn"></span>
        Tour : <strong>{{ currentTurn === 'white' ? 'Blancs' : 'Noirs' }}</strong>
      </div>
      <div
        v-if="gameStatus !== 'playing'"
        class="game-status"
        :class="gameStatus"
        data-testid="game-status"
      >
        <template v-if="gameStatus === 'check'">⚠️ Échec !</template>
        <template v-else-if="gameStatus === 'checkmate'">
          ♚ Échec et mat ! {{ currentTurn === 'white' ? 'Les Noirs' : 'Les Blancs' }} gagnent !
        </template>
        <template v-else-if="gameStatus === 'stalemate'">🤝 Pat — Partie nulle</template>
        <template v-else-if="gameStatus === 'draw'">🤝 Partie nulle</template>
      </div>
    </div>

    <div class="chess-board" data-testid="chess-board">
      <div
        v-for="(row, rowIndex) in board"
        :key="rowIndex"
        class="board-row"
        :data-testid="`row-r${rowIndex}`"
      >
        <div
          v-for="(cell, colIndex) in row"
          :key="colIndex"
          class="board-cell"
          :data-testid="`cell-r${rowIndex}-c${colIndex}`"
          :class="[
            getCellColor(rowIndex, colIndex),
            {
              selected: isSelected(rowIndex, colIndex),
              'last-move': isLastMove(rowIndex, colIndex),
              'legal-move': isLegalMove(rowIndex, colIndex)
            }
          ]"
          @click="handleCellClick(rowIndex, colIndex)"
        >
          <div
            v-if="cell"
            class="piece"
            :class="cell.color"
            :data-testid="`piece-${cell.color}-${cell.type}-r${rowIndex}-c${colIndex}`"
          >
            {{ getPieceSymbol(cell) }}
          </div>
          <div
            v-else-if="isLegalMove(rowIndex, colIndex)"
            class="legal-move-dot"
          ></div>
        </div>
      </div>
    </div>

    <div class="info-panel">
      <button
        @click="resetBoard"
        class="reset-button"
        data-testid="reset-button"
      >
        Réinitialiser
      </button>

      <div class="history-section" data-testid="history-section">
        <h3 data-testid="history-title">
          Historique des mouvements ({{ moveHistory.length }})
        </h3>

        <div class="history-list" data-testid="history-list">
          <div
            v-for="(move, index) in moveHistory.slice().reverse()"
            :key="index"
            class="history-item"
            :data-testid="`history-item-${index}`"
          >
            <span class="move-number">{{ moveHistory.length - index }}.</span>
            {{ formatMove(move) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ChessService } from "../services/ChessService.js";

export default {
  name: "ChessBoard",
  data() {
    return {
      chessService: new ChessService(),
      board: [],
      selectedCell: null,
      legalMoves: [],
      moveHistory: [],
      currentTurn: 'white',
      gameStatus: 'playing'
    };
  },
  mounted() {
    this.updateBoard();
  },
  methods: {
    updateBoard() {
      this.board = this.chessService.getBoard();
      this.moveHistory = this.chessService.getMoveHistory();
      this.currentTurn = this.chessService.getCurrentTurn();
      this.gameStatus = this.chessService.getGameStatus();
    },
    getCellColor(row, col) {
      return (row + col) % 2 === 0 ? "light" : "dark";
    },
    isSelected(row, col) {
      return (
        this.selectedCell &&
        this.selectedCell.row === row &&
        this.selectedCell.col === col
      );
    },
    isLastMove(row, col) {
      const lastMove = this.chessService.getLastMove();
      if (!lastMove) return false;

      return (
        (lastMove.from.row === row && lastMove.from.col === col) ||
        (lastMove.to.row === row && lastMove.to.col === col)
      );
    },
    isLegalMove(row, col) {
      return this.legalMoves.some(m => m.row === row && m.col === col);
    },
    handleCellClick(row, col) {
      // Ne rien faire si la partie est terminée
      if (this.gameStatus === 'checkmate' || this.gameStatus === 'stalemate' || this.gameStatus === 'draw') {
        return;
      }

      if (this.selectedCell === null) {
        // Sélectionner une pièce (seulement si c'est le bon tour)
        const piece = this.chessService.getPieceAt(row, col);
        if (piece && piece.color === this.currentTurn) {
          this.selectedCell = { row, col };
          this.legalMoves = this.chessService.getLegalMoves(row, col);
        }
      } else {
        // Tenter de déplacer la pièce
        const moved = this.chessService.movePiece(
          this.selectedCell.row,
          this.selectedCell.col,
          row,
          col
        );

        if (!moved) {
          // Si le clic est sur une pièce de la même couleur, sélectionner celle-ci
          const piece = this.chessService.getPieceAt(row, col);
          if (piece && piece.color === this.currentTurn) {
            this.selectedCell = { row, col };
            this.legalMoves = this.chessService.getLegalMoves(row, col);
            return;
          }
        }

        this.selectedCell = null;
        this.legalMoves = [];
        this.updateBoard();
      }
    },
    getPieceSymbol(piece) {
      const symbols = {
        white: {
          king: "♔",
          queen: "♕",
          rook: "♖",
          bishop: "♗",
          knight: "♘",
          pawn: "♙"
        },
        black: {
          king: "♚",
          queen: "♛",
          rook: "♜",
          bishop: "♝",
          knight: "♞",
          pawn: "♟"
        }
      };
      return symbols[piece.color][piece.type];
    },
    formatMove(move) {
      const colLetters = ["a", "b", "c", "d", "e", "f", "g", "h"];
      const pieceNames = {
        king: "Roi",
        queen: "Dame",
        rook: "Tour",
        bishop: "Fou",
        knight: "Cavalier",
        pawn: "Pion"
      };

      const from = `${colLetters[move.from.col]}${8 - move.from.row}`;
      const to = `${colLetters[move.to.col]}${8 - move.to.row}`;
      const pieceName = pieceNames[move.piece.type];
      const captured = move.capturedPiece ? " (capture)" : "";

      return `${pieceName} ${from} → ${to}${captured}`;
    },
    resetBoard() {
      this.chessService.reset();
      this.selectedCell = null;
      this.legalMoves = [];
      this.updateBoard();
    }
  }
};
</script>

<style scoped>
.chess-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 10px;
  color: #333;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 15px;
  padding: 10px 20px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 16px;
}

.turn-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.turn-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #333;
}

.turn-dot.white {
  background-color: #fff;
}

.turn-dot.black {
  background-color: #000;
}

.game-status {
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: bold;
}

.game-status.check {
  background-color: #fff3cd;
  color: #856404;
}

.game-status.checkmate {
  background-color: #f8d7da;
  color: #721c24;
}

.game-status.stalemate,
.game-status.draw {
  background-color: #d1ecf1;
  color: #0c5460;
}

.chess-board {
  border: 3px solid #333;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  margin-bottom: 20px;
}

.board-row {
  display: flex;
}

.board-cell {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.board-cell.light {
  background-color: #f0d9b5;
}

.board-cell.dark {
  background-color: #b58863;
}

.board-cell:hover {
  opacity: 0.8;
}

.board-cell.selected {
  background-color: #7fc97f !important;
  box-shadow: inset 0 0 0 3px #4a9e4a;
}

.board-cell.last-move {
  background-color: #fdd835 !important;
}

.board-cell.legal-move {
  cursor: pointer;
}

.board-cell.legal-move::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 24px;
  background-color: rgba(0, 128, 0, 0.4);
  border-radius: 50%;
  pointer-events: none;
}

.legal-move-dot {
  width: 24px;
  height: 24px;
  background-color: rgba(0, 128, 0, 0.4);
  border-radius: 50%;
}

.piece {
  font-size: 60px;
  user-select: none;
  pointer-events: none;
}

.piece.white {
  color: #fff;
  text-shadow: 0 0 2px #000, 0 0 4px #000;
}

.piece.black {
  color: #000;
  text-shadow: 0 0 2px #fff;
}

.info-panel {
  width: 100%;
  max-width: 640px;
}

.reset-button {
  padding: 12px 24px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 20px;
  transition: background-color 0.2s;
}

.reset-button:hover {
  background-color: #45a049;
}

.history-section {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.history-section h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #555;
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
  background-color: white;
  padding: 10px;
  border-radius: 5px;
}

.history-item {
  padding: 8px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.history-item:last-child {
  border-bottom: none;
}

.move-number {
  font-weight: bold;
  color: #666;
  margin-right: 8px;
}
</style>
