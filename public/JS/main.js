import { renderWelcomeScreen } from './lobby.js';

document.addEventListener('DOMContentLoaded', () => {
  renderWelcomeScreen();
});

// Utility function to change screens
export function changeScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}