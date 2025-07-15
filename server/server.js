const express = require('express');
const path = require('path');
const GameManager = require('./gameManager.js'); // Use relative path
const cors = require('cors'); // Add for cross-origin support

const app = express();
const PORT = process.env.PORT || 3000;

const gameManager = new GameManager();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// API Endpoints
app.post('/api/game/create', (req, res) => {
  try {
    const { playerName } = req.body;
    if (!playerName || playerName.trim() === '') {
      return res.status(400).json({ error: 'Player name is required' });
    }
    const gameCode = gameManager.createGame(playerName.trim());
    res.json({ gameCode });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create game' });
  }
});

app.post('/api/game/join', (req, res) => {
  try {
    const { gameCode, playerName } = req.body;
    
    if (!gameCode || !playerName) {
      return res.status(400).json({ 
        error: 'Both game code and player name are required' 
      });
    }

    const result = gameManager.joinGame(gameCode.toUpperCase(), playerName.trim());
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to join game' });
  }
});

app.post('/api/game/move', (req, res) => {
  try {
    const { gameCode, playerId, position } = req.body;
    
    if (!gameCode || playerId === undefined || position === undefined) {
      return res.status(400).json({ 
        error: 'Game code, player ID and position are required' 
      });
    }

    const result = gameManager.makeMove(
      gameCode.toUpperCase(), 
      parseInt(playerId), 
      parseInt(position)
    );
    
    if (!result.valid) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process move' });
  }
});

app.get('/api/game/state/:gameCode', (req, res) => {
  try {
    const { gameCode } = req.params;
    const playerId = req.query.playerId;
    
    if (!gameCode) {
      return res.status(400).json({ error: 'Game code is required' });
    }

    const gameState = gameManager.getGameState(
      gameCode.toUpperCase(),
      playerId ? parseInt(playerId) : null
    );
    
    if (!gameState) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json(gameState);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get game state' });
  }
});

app.post('/api/game/quit/:gameCode', (req, res) => {
  try {
    const { gameCode } = req.params;
    const { playerId } = req.query;
    
    if (!gameCode || !playerId) {
      return res.status(400).json({ 
        error: 'Game code and player ID are required' 
      });
    }

    // Optional: Add server-side cleanup logic here
    // gameManager.cleanupGame(gameCode, playerId);
    
    res.json({ 
      success: true,
      message: `Player ${playerId} has left the game`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process quit request' });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});