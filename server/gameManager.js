class GameManager {
  constructor() {
    this.games = {};
    this.cleanupInterval = setInterval(() => this.cleanupCompletedGames(), 60000); // Cleanup every minute
  }

  generateRandomCode(length) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  createGame(playerName) {
    const gameCode = this.generateRandomCode(6);
    this.games[gameCode] = {
      players: [{ id: 1, name: playerName.trim() }],
      board: Array(9).fill(null),
      currentPlayer: 1,
      status: 'waiting',
      winner: null,
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    return gameCode;
  }

  joinGame(gameCode, playerName) {
    const game = this.games[gameCode];
    if (!game) {
      return { success: false, message: 'Game not found' };
    }
    
    if (game.players.length >= 2) {
      return { success: false, message: 'Game is full' };
    }

    if (game.status !== 'waiting') {
      return { success: false, message: 'Game already started' };
    }

    game.players.push({ id: 2, name: playerName.trim() });
    game.status = 'active';
    game.lastActivity = Date.now();
    return { 
      success: true, 
      playerId: 2, 
      opponentName: game.players[0].name 
    };
  }

  makeMove(gameCode, playerId, position) {
    const game = this.games[gameCode];
    
    // Validate move
    if (!game) {
      return { valid: false, message: 'Game not found' };
    }
    
    if (game.status !== 'active') {
      return { valid: false, message: 'Game not active' };
    }
    
    if (game.currentPlayer !== playerId) {
      return { valid: false, message: 'Not your turn' };
    }
    
    if (position < 0 || position > 8 || game.board[position]) {
      return { valid: false, message: 'Invalid move' };
    }

    // Execute move
    game.board[position] = playerId === 1 ? 'X' : 'O';
    game.lastActivity = Date.now();

    // Check game state
    const winner = this.checkWinner(game.board);
    const isDraw = !winner && this.checkDraw(game.board);

    if (winner) {
      game.status = 'completed';
      game.winner = winner;
      game.currentPlayer = null;
    } else if (isDraw) {
      game.status = 'completed';
      game.winner = 'draw';
      game.currentPlayer = null;
    } else {
      game.currentPlayer = playerId === 1 ? 2 : 1;
    }

    return { 
      valid: true,
      board: [...game.board], // Return a copy
      currentPlayer: game.currentPlayer,
      status: game.status,
      winner: game.winner,
      isDraw: isDraw
    };
  }

  checkWinner(board) {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    for (const [a, b, c] of winPatterns) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a] === 'X' ? 1 : 2;
      }
    }
    return null;
  }

  checkDraw(board) {
    return board.every(cell => cell !== null);
  }

  getGameState(gameCode, requestingPlayerId = null) {
    const game = this.games[gameCode];
    if (!game) return null;

    return {
      board: [...game.board], // Return a copy
      currentPlayer: game.currentPlayer,
      status: game.status,
      players: [...game.players], // Return a copy
      yourTurn: requestingPlayerId ? (game.currentPlayer === requestingPlayerId) : null,
      winner: game.winner,
      isDraw: game.winner === 'draw',
      lastActivity: game.lastActivity
    };
  }

  cleanupCompletedGames() {
    const now = Date.now();
    const timeout = 30 * 60 * 1000; // 30 minutes

    Object.keys(this.games).forEach(code => {
      const game = this.games[code];
      if (game.status === 'completed' && (now - game.lastActivity) > timeout) {
        delete this.games[code];
      }
    });
  }

  quitGame(gameCode, playerId) {
    const game = this.games[gameCode];
    if (!game) return false;

    game.lastActivity = Date.now();
    
    if (game.status === 'waiting') {
      delete this.games[gameCode];
      return true;
    }

    if (game.status === 'active') {
      game.status = 'abandoned';
      game.winner = playerId === 1 ? 2 : 1;
      return true;
    }

    return false;
  }
}

module.exports = GameManager;