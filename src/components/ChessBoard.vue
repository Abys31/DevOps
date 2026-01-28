<template>
  <div class="chess-container">
    <h1>Jeu d'Échecs - Déplacement Libre</h1>
    
    <div class="chess-board">
      <div 
        v-for="(row, rowIndex) in board" 
        :key="rowIndex" 
        class="board-row"
      >
        <div
          v-for="(cell, colIndex) in row"
          :key="colIndex"
          class="board-cell"
          :class="[
            getCellColor(rowIndex, colIndex),
            { 
              'selected': isSelected(rowIndex, colIndex),
              'last-move': isLastMove(rowIndex, colIndex)
            }
          ]"
          @click="handleCellClick(rowIndex, colIndex)"
        >
          <div v-if="cell" class="piece" :class="cell.color">
            {{ getPieceSymbol(cell) }}
          </div>
        </div>
      </div>
    </div>

    <div class="info-panel">
      <button @click="resetBoard" class="reset-button">Réinitialiser</button>
      
      <div class="history-section">
        <h3>Historique des mouvements ({{ moveHistory.length }})</h3>
        <div class="history-list">
          <div 
            v-for="(move, index) in moveHistory.slice().reverse()" 
            :key="index"
            class="history-item"
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
import { ChessService } from '../services/ChessService.js';

export default {
  name: 'ChessBoard',
  data() {
    return {
      chessService: new ChessService(),
      board: [],
      selectedCell: null,
      moveHistory: []
    };
  },
  mounted() {
    this.updateBoard();
  },
  methods: {
    updateBoard() {
      this.board = this.chessService.getBoard();
      this.moveHistory = this.chessService.getMoveHistory();
    },
    getCellColor(row, col) {
      return (row + col) % 2 === 0 ? 'light' : 'dark';
    },
    isSelected(row, col) {
      return this.selectedCell && 
             this.selectedCell.row === row && 
             this.selectedCell.col === col;
    },
    isLastMove(row, col) {
      const lastMove = this.chessService.getLastMove();
      if (!lastMove) return false;
      
      return (lastMove.from.row === row && lastMove.from.col === col) ||
             (lastMove.to.row === row && lastMove.to.col === col);
    },
    handleCellClick(row, col) {
      if (this.selectedCell === null) {
        // Sélectionner une pièce
        const piece = this.chessService.getPieceAt(row, col);
        if (piece) {
          this.selectedCell = { row, col };
        }
      } else {
        // Déplacer la pièce
        this.chessService.movePiece(
          this.selectedCell.row,
          this.selectedCell.col,
          row,
          col
        );
        this.selectedCell = null;
        this.updateBoard();
      }
    },
    getPieceSymbol(piece) {
      const symbols = {
        white: {
          king: '♔',
          queen: '♕',
          rook: '♖',
          bishop: '♗',
          knight: '♘',
          pawn: '♙'
        },
        black: {
          king: '♚',
          queen: '♛',
          rook: '♜',
          bishop: '♝',
          knight: '♞',
          pawn: '♟'
        }
      };
      return symbols[piece.color][piece.type];
    },
    formatMove(move) {
      const colLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const pieceNames = {
        king: 'Roi',
        queen: 'Dame',
        rook: 'Tour',
        bishop: 'Fou',
        knight: 'Cavalier',
        pawn: 'Pion'
      };
      
      const from = `${colLetters[move.from.col]}${8 - move.from.row}`;
      const to = `${colLetters[move.to.col]}${8 - move.to.row}`;
      const pieceName = pieceNames[move.piece.type];
      const captured = move.capturedPiece ? ' (capture)' : '';
      
      return `${pieceName} ${from} → ${to}${captured}`;
    },
    resetBoard() {
      this.chessService.reset();
      this.selectedCell = null;
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
  margin-bottom: 20px;
  color: #333;
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