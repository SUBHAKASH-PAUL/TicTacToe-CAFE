class GameManager {
  constructor() {
    this.games = {};
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
      players: [{ id: 1, name: playerName }],
      board: Array(9).fill(null),
      currentPlayer: 1,
      status: 'waiting',
      winner: null
    };
    return gameCode;
  }

  joinGame(gameCode, playerName) {
    if (!this.games[gameCode]) {
      return { success: false, message: 'Game not found' };
    }
    
    if (this.games[gameCode].players.length >= 2) {
      return { success: false, message: 'Game is full' };
    }

    this.games[gameCode].players.push({ id: 2, name: playerName });
    this.games[gameCode].status = 'active';
    return { 
      success: true, 
      playerId: 2, 
      opponentName: this.games[gameCode].players[0].name 
    };
  }

  makeMove(gameCode, playerId, position) {
    const game = this.games[gameCode];
    
    if (!game || game.status !== 'active') {
      return { valid: false, message: 'Game not active' };
    }
    
    if (game.currentPlayer !== playerId) {
      return { valid: false, message: 'Not your turn' };
    }
    
    if (game.board[position]) {
      return { valid: false, message: 'Position already taken' };
    }

    game.board[position] = playerId === 1 ? 'X' : 'O';
    game.currentPlayer = playerId === 1 ? 2 : 1;

    const winner = this.checkWinner(game.board);
    // In makeMove method:
if (winner) {
  game.status = 'completed';
  game.winner = winner;
  // Keep game in memory for at least 30 seconds after completion
  setTimeout(() => {
    if (this.games[gameCode]?.status === 'completed') {
      delete this.games[gameCode];
    }
  }, 30000);
}

    return { 
      valid: true, 
      board: game.board, 
      currentPlayer: game.currentPlayer,
      gameStatus: game.status,
      winner: game.winner
    };
  }

  checkWinner(board) {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a] === 'X' ? 1 : 2;
      }
    }
    return null;
  }

// Modify the getGameState method to include player perspective
getGameState(gameCode, requestingPlayerId = null) {
  const game = this.games[gameCode];
  if (!game) return null;
  
  // Return a sanitized version of game state
  return {
    board: game.board,
    currentPlayer: game.currentPlayer,
    status: game.status,
    players: game.players,
    yourTurn: requestingPlayerId ? 
      (game.currentPlayer === requestingPlayerId) : null,
    winner: game.winner
  };
}
}

module.exports = GameManager;