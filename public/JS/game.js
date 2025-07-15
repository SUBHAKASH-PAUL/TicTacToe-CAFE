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
          <span class="connection-dot"></span>
          <span>Connected</span>
        </div>
      </div>
      <div class="game-board" id="game-board">
        ${Array(9).fill().map((_, i) => `
          <div class="cell" data-index="${i}">
            <div class="marker"></div>
          </div>
        `).join('')}
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

  // Enhanced polling function with better error handling
  const pollGameState = async () => {
    if (isUpdating) return;
    isUpdating = true;

    try {
      const response = await fetch(`/api/game/state/${gameCode}?playerId=${playerId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (!data) throw new Error('Invalid game state received');

      // Only update if state changed significantly
      if (!gameState || 
          data.status !== gameState.status || 
          JSON.stringify(data.board) !== JSON.stringify(gameState.board) ){
        updateBoard(data.board);
        updateGameStatus(data);
      }

      gameState = data;
      updateConnectionStatus(true);
    } catch (error) {
      console.error('Polling error:', error);
      updateConnectionStatus(false);
    } finally {
      isUpdating = false;
    }
  };

  // Connection status updater
  const updateConnectionStatus = (isConnected) => {
    const statusElement = document.querySelector('#connection-status span:last-child');
    const dotElement = document.querySelector('.connection-dot');
    
    if (isConnected) {
      statusElement.textContent = 'Connected';
      dotElement.style.backgroundColor = '#A7C4BC';
    } else if (!gameState || gameState.status !== 'completed') {
      statusElement.textContent = 'Reconnecting...';
      dotElement.style.backgroundColor = '#FF6B6B';
    }
  };

  // Cell click handler with better validation
  const handleCellClick = async (position) => {
    if (!gameState || 
        gameState.status !== 'active' || 
        gameState.currentPlayer !== playerId || 
        gameState.board[position] !== null) {
      return;
    }

    try {
      const response = await fetch('/api/game/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          gameCode, 
          playerId, 
          position 
        })
      });

      const result = await response.json();
      if (result.valid) {
        await pollGameState(); // Immediate update after move
      } else {
        console.warn('Invalid move:', result.message);
      }
    } catch (error) {
      console.error('Move error:', error);
      updateConnectionStatus(false);
    }
  };

  // Board visual updater
  const updateBoard = (board) => {
    cells.forEach((cell, index) => {
      const marker = cell.querySelector('.marker');
      cell.className = 'cell';
      marker.className = 'marker';
      
      if (board[index] === 'X') {
        marker.classList.add('x');
      } else if (board[index] === 'O') {
        marker.classList.add('o');
      }
      
      cell.style.pointerEvents = gameState?.status === 'completed' ? 'none' : 'auto';
    });
  };

  // Game status updater
  const updateGameStatus = (data) => {
    if (data.status === 'completed') {
      clearInterval(gameUpdateInterval);
      
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
      }
    } else {
      turnIndicator.textContent = data.currentPlayer === playerId 
        ? 'Your turn!' 
        : 'Waiting for opponent...';
      turnIndicator.style.color = data.currentPlayer === playerId 
        ? '#8B4513' 
        : '#A7C4BC';
    }
  };

  // Cleanup function
  const cleanup = () => {
    clearInterval(gameUpdateInterval);
    cells.forEach(cell => {
      cell.removeEventListener('click', cellClickHandler);
    });
  };

  // Set up cell click handlers
  const cellClickHandler = (event) => {
    const position = parseInt(event.currentTarget.dataset.index);
    handleCellClick(position);
  };

  cells.forEach(cell => {
    cell.addEventListener('click', cellClickHandler);
  });

  // Set up quit button
  document.getElementById('quit-game-btn').addEventListener('click', () => {
    cleanup();
    fetch(`/api/game/quit/${gameCode}?playerId=${playerId}`, {
      method: 'POST'
    }).catch(console.error);
    renderWelcomeScreen();
  });

  // Start polling
  gameUpdateInterval = setInterval(pollGameState, 500);
  pollGameState(); // Initial load
}

// Image preloader
function preloadImages() {
  ['coffee-x.png', 'coffee-o.png'].forEach(img => {
    const image = new Image();
    image.src = `../images/${img}`;
  });
}
preloadImages();