import { changeScreen } from './main.js';
import { renderGameScreen } from './game.js';

export function renderWelcomeScreen() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div id="welcome-screen" class="screen active">
      <h2>Welcome to Tic Tac Toe Café</h2>
      <div class="btn-container">
        <button id="create-game-btn" class="btn">Start New Game</button>
        <button id="join-game-btn" class="btn">Join Game</button>
      </div>
    </div>
    <div id="create-game-screen" class="screen">
      <h2>Create New Game</h2>
      <div class="input-group">
        <label for="player-name">Your Name</label>
        <input type="text" id="player-name" placeholder="Enter your name">
      </div>
      <button id="create-btn" class="btn">Create Game</button>
      <button id="back-btn" class="btn">Back</button>
    </div>
    <div id="join-game-screen" class="screen">
      <h2>Join a Game</h2>
      <div class="input-group">
        <label for="game-code">Game Code</label>
        <input type="text" id="game-code" placeholder="Enter game code">
      </div>
      <div class="input-group">
        <label for="join-player-name">Your Name</label>
        <input type="text" id="join-player-name" placeholder="Enter your name">
      </div>
      <button id="join-btn" class="btn">Join Game</button>
      <button id="back-btn-join" class="btn">Back</button>
    </div>
    <div id="lobby-screen" class="screen">
      <h2>Game Lobby</h2>
      <div id="lobby-content"></div>
      <button id="lobby-back-btn" class="btn">Back to Main</button>
    </div>
  `;

  // Event listeners
  document.getElementById('create-game-btn').addEventListener('click', () => {
    changeScreen('create-game-screen');
  });

  document.getElementById('join-game-btn').addEventListener('click', () => {
    changeScreen('join-game-screen');
  });

  document.getElementById('back-btn').addEventListener('click', () => {
    changeScreen('welcome-screen');
  });

  document.getElementById('back-btn-join').addEventListener('click', () => {
    changeScreen('welcome-screen');
  });

  document.getElementById('lobby-back-btn')?.addEventListener('click', () => {
    changeScreen('welcome-screen');
  });

  document.getElementById('create-btn').addEventListener('click', createGame);
  document.getElementById('join-btn').addEventListener('click', joinGame);
}

async function createGame() {
  const playerName = document.getElementById('player-name').value.trim();
  if (!playerName) {
    alert('Please enter your name');
    return;
  }

  try {
    const response = await fetch('/api/game/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ playerName })
    });

    const data = await response.json();
    renderLobbyScreen(data.gameCode, playerName, 1);
  } catch (error) {
    console.error('Error creating game:', error);
    alert('Failed to create game. Please try again.');
  }
}

async function joinGame() {
  const gameCode = document.getElementById('game-code').value.trim().toUpperCase();
  const playerName = document.getElementById('join-player-name').value.trim();

  if (!gameCode || !playerName) {
    alert('Please enter both game code and your name');
    return;
  }

  try {
    const response = await fetch('/api/game/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ gameCode, playerName })
    });

    const data = await response.json();
    if (data.success) {
      renderGameScreen(gameCode, playerName, data.playerId, data.opponentName);
    } else {
      alert(data.message || 'Failed to join game');
    }
  } catch (error) {
    console.error('Error joining game:', error);
    alert('Failed to join game. Please try again.');
  }
}

function renderLobbyScreen(gameCode, playerName, playerId) {
  changeScreen('lobby-screen');
  const lobbyContent = document.getElementById('lobby-content');
  lobbyContent.innerHTML = `
    <div class="game-info">
      <p>Your name: <strong>${playerName}</strong></p>
      <p>Share this code with your friend:</p>
      <div class="game-code-container" style="display: flex; align-items: center; gap: 10px;">
        <div class="game-code">${gameCode}</div>
        <button id="copy-code-btn" class="btn" style="padding: 5px 10px; font-size: 0.9rem;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="2">
            <path d="M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z"/>
          </svg>
          Copy
        </button>
      </div>
      <p class="waiting-message">Waiting for opponent to join...</p>
    </div>
  `;

  // Add copy functionality
  document.getElementById('copy-code-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(gameCode).then(() => {
      const copyBtn = document.getElementById('copy-code-btn');
      copyBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="2">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        Copied!
      `;
      setTimeout(() => {
        copyBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="2">
            <path d="M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z"/>
          </svg>
          Copy
        `;
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      alert('Failed to copy code. Please copy it manually.');
    });
  });

  // Rest of your polling logic...
  const checkOpponent = setInterval(async () => {
    try {
      const response = await fetch(`/api/game/state/${gameCode}`);
      const gameState = await response.json();
      
      if (gameState && gameState.players.length === 2) {
        clearInterval(checkOpponent);
        const opponentName = gameState.players.find(p => p.id !== playerId).name;
        renderGameScreen(gameCode, playerName, playerId, opponentName);
      }
    } catch (error) {
      console.error('Error checking game state:', error);
    }
  }, 2000);
}