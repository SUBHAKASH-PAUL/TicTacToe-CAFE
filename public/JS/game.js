import { changeScreen } from './main.js';
import { renderWelcomeScreen } from './lobby.js';

export function renderGameScreen(gameCode, playerName, playerId, opponentName) {
  const app = document.getElementById('app');
  
  // Clear any existing game screen first
  const oldScreen = document.getElementById('game-screen');
  if (oldScreen) oldScreen.remove();

  app.innerHTML = `
    <div id="game-screen" class="screen active">
      <h2>Tic Tac Toe Café</h2>
      <div class="game-info">
        <p>Game Code: <strong>${gameCode}</strong></p>
        <p>${playerName} (You) vs ${opponentName}</p>
        <p id="turn-indicator">${playerId === 1 ? 'Your turn!' : 'Waiting for opponent...'}</p>
        <div id="connection-status" style="margin-top: 10px;">
          <span class="connection-dot" style="height: 10px; width: 10px; background-color: #A7C4BC; border-radius: 50%; display: inline-block;"></span>
          <span>Connected</span>
        </div>
      </div>
      <div class="game-board" id="game-board">
        ${Array(9).fill().map((_, i) => `<div class="cell" data-index="${i}"></div>`).join('')}
      </div>
      <button id="quit-game-btn" class="btn">Quit Game</button>
    </div>
  `;

  setupGame(gameCode, playerId, playerName, opponentName);
}

function setupGame(gameCode, playerId, playerName, opponentName) {
  const cells = document.querySelectorAll('.cell');
  const turnIndicator = document.getElementById('turn-indicator');
  let gameState = null;
  let isUpdating = false;
  let gameUpdateInterval;
  const connectionStatus = document.querySelector('#connection-status span:last-child');
  const connectionDot = document.querySelector('.connection-dot');

  // Cleanup function
  const cleanup = () => {
    clearInterval(gameUpdateInterval);
    const quitBtn = document.getElementById('quit-game-btn');
    if (quitBtn) {
      quitBtn.removeEventListener('click', handleQuit);
    }
  };

  // Quit handler
  const handleQuit = () => {
    cleanup();
    
    // Notify server (optional)
    fetch(`/api/game/quit/${gameCode}?playerId=${playerId}`, {
      method: 'POST'
    }).catch(console.error);
    
    // Clear the game screen completely
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) gameScreen.remove();
    
    // Render fresh welcome screen
    renderWelcomeScreen();
  };

  // Set up quit button
  document.getElementById('quit-game-btn').addEventListener('click', handleQuit);

  // Enhanced polling function
  const pollGameState = async () => {
    if (isUpdating) return;
    isUpdating = true;

    try {
      const response = await fetch(`/api/game/state/${gameCode}?playerId=${playerId}`);
      if (!response.ok) throw new Error('Network error');
      
      const data = await response.json();
      if (!data) throw new Error('Invalid game state');

      if (!gameState || 
          data.status !== gameState.status || 
          JSON.stringify(data.board) !== JSON.stringify(gameState.board)) {
        updateBoard(data.board);
        updateGameStatus(data);
      }

      gameState = data;
      connectionStatus.textContent = 'Connected';
      connectionDot.style.backgroundColor = '#A7C4BC';
    } catch (error) {
      console.error('Polling error:', error);
      if (!gameState || gameState.status !== 'completed') {
        connectionStatus.textContent = 'Reconnecting...';
        connectionDot.style.backgroundColor = '#FF6B6B';
      }
    } finally {
      isUpdating = false;
    }
  };

  // Start polling
  gameUpdateInterval = setInterval(pollGameState, 500);
  pollGameState();

  // Handle cell clicks
  cells.forEach(cell => {
    cell.addEventListener('click', async () => {
      if (!gameState || gameState.status !== 'active' || gameState.currentPlayer !== playerId) {
        return;
      }

      const position = parseInt(cell.dataset.index);
      if (gameState.board[position]) return;

      try {
        const response = await fetch('/api/game/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameCode, playerId, position })
        });

        const result = await response.json();
        if (result.valid) {
          await pollGameState();
        }
      } catch (error) {
        console.error('Move error:', error);
      }
    });
  });

  // Update board visuals
  function updateBoard(board) {
    cells.forEach((cell, index) => {
      cell.className = 'cell';
      cell.style.pointerEvents = gameState?.status === 'completed' ? 'none' : 'auto';
      if (board[index] === 'X') {
        cell.classList.add('x');
      } else if (board[index] === 'O') {
        cell.classList.add('o');
      }
    });
  }

  // Update game status text
  function updateGameStatus(data) {
    if (data.status === 'completed') {
      cleanup();
      let resultMessage;
      
      if (data.winner === 'draw') {
        resultMessage = 'Game ended in a draw!';
      } else {
        resultMessage = data.winner === playerId 
          ? `You win! ☕🎉` 
          : `${opponentName} wins!`;
      }
      
      turnIndicator.textContent = resultMessage;
      turnIndicator.style.color = '#8B4513';
      
      // Update quit button
      const quitBtn = document.getElementById('quit-game-btn');
      if (quitBtn) {
        quitBtn.textContent = 'Return to Menu';
        quitBtn.removeEventListener('click', handleQuit);
        quitBtn.addEventListener('click', handleQuit);
      }
    } else {
      turnIndicator.textContent = data.currentPlayer === playerId 
        ? 'Your turn!' 
        : 'Waiting for opponent...';
      turnIndicator.style.color = data.currentPlayer === playerId 
        ? '#8B4513' 
        : '#A7C4BC';
    }
  }
}

// Image preloader
function preloadImages() {
  ['coffee-x.png', 'coffee-o.png'].forEach(img => {
    new Image().src = `../images/${img}`;
  });
}
preloadImages();