![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
# ☕🎮 Tic Tac Toe Café 

*A cozy multiplayer Tic Tac Toe game with coffee shop aesthetics*

![Game Preview](public/images/game-preview.png) *(add a screenshot later)*

## ✨ Features

- **Café-themed UI** with beige, brown, cream, yellow, and matcha green colors
- **Multiplayer mode** with unique game codes
- **Coffee cup markers**:
  - ❌ Player 1: Steaming coffee cup (X)
  - ⭕ Player 2: Empty coffee cup (O)
- **Simple sharing**: Just share the game code to play
- **Real-time gameplay** with turn-based mechanics

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- npm (comes with Node.js)

### Installation
1. Clone the repository:
   ```bash
   -git clone https://github.com/your-username/tic-tac-toe-cafe.git

2. Navigate to project directory:
   ```bash 
   -cd tic-tac-toe-cafe

3. Install dependencies:
   ```bash
   -npm install   

### Running The Game    
1. Start the server:
   ```bash
   -npm start

2. For development with auto-restart:
   ```bash   
   -npm run dev

🎮 How to Play
1. Player 1 (Game Host):

Clicks "Start New Game"

Enters name

Receives a 6-digit game code

Shares code with friend

2. Player 2:

Clicks "Join Game"

Enters the game code and their name

Joins the game

3. Gameplay:

Take turns placing your coffee cup markers

First to get 3 in a row wins!

Enjoy the café ambiance ☕   

🏗️ Project Structure

```bash
tic-tac-toe-cafe/
├── public/            # Client-side files
│   ├── css/           # Stylesheets
│   ├── js/            # Game logic
│   ├── images/        # Assets
│   └── index.html     # Main page
├── server/            # Server code
│   ├── gameManager.js # Game state manager
│   └── server.js      # Express server
├── package.json       # Dependencies
└── README.md          # This file
```


🌟 Color Palette

Color	      Hex Code	     Usage
Beige	      #F5F5DC	  Background
Brown	      #8B4513	  Text & accents
Cream	      #FFFDD0	  Secondary elements
Yellow	      #F8DE7E	  Highlights
Matcha Green  #A7C4BC	  Buttons & active


🛠️ Built With
Frontend: HTML5, CSS3, JavaScript

Backend: Node.js, Express

Design: Custom café aesthetic

🙌 Contributing

📜 License

This project is open-source and available under the [MIT License](LICENSE).
