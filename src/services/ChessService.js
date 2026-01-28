// Service pour gérer l'état du jeu d'échecs
export class ChessService {
  constructor() {
    this.board = this.initializeBoard();
    this.moveHistory = [];
  }

  // Initialise le plateau avec la position de départ
  initializeBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));

    // Pièces noires (en haut)
    board[0] = [
      { type: 'rook', color: 'black' },
      { type: 'knight', color: 'black' },
      { type: 'bishop', color: 'black' },
      { type: 'queen', color: 'black' },
      { type: 'king', color: 'black' },
      { type: 'bishop', color: 'black' },
      { type: 'knight', color: 'black' },
      { type: 'rook', color: 'black' }
    ];
    board[1] = Array(8).fill({ type: 'pawn', color: 'black' });

    // Pièces blanches (en bas)
    board[6] = Array(8).fill({ type: 'pawn', color: 'white' });
    board[7] = [
      { type: 'rook', color: 'white' },
      { type: 'knight', color: 'white' },
      { type: 'bishop', color: 'white' },
      { type: 'queen', color: 'white' },
      { type: 'king', color: 'white' },
      { type: 'bishop', color: 'white' },
      { type: 'knight', color: 'white' },
      { type: 'rook', color: 'white' }
    ];

    return board;
  }

  // Récupère une pièce à une position donnée
  getPieceAt(row, col) {
    if (row < 0 || row > 7 || col < 0 || col > 7) {
      return null;
    }
    return this.board[row][col];
  }

  // Déplace une pièce d'une position à une autre
  movePiece(fromRow, fromCol, toRow, toCol) {
    const piece = this.board[fromRow][fromCol];
    
    if (!piece) {
      return false;
    }

    const capturedPiece = this.board[toRow][toCol];

    // Enregistrer le mouvement dans l'historique
    this.moveHistory.push({
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      piece: { ...piece },
      capturedPiece: capturedPiece ? { ...capturedPiece } : null,
      timestamp: new Date()
    });

    // Effectuer le déplacement
    this.board[toRow][toCol] = piece;
    this.board[fromRow][fromCol] = null;

    return true;
  }

  // Récupère toutes les positions des pièces
  getAllPiecePositions() {
    const positions = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece) {
          positions.push({
            row,
            col,
            piece: { ...piece }
          });
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
    this.board = this.initializeBoard();
    this.moveHistory = [];
  }

  // Récupère le plateau complet
  getBoard() {
    return this.board;
  }
}