document.addEventListener('DOMContentLoaded', () => {
  const board = document.querySelector('.memory-board');
  const startBtn = document.getElementById('start-btn');
  const resetBtn = document.getElementById('reset-btn');
  const levelDisplay = document.getElementById('level');
  const scoreDisplay = document.getElementById('score');
  const highScoreDisplay = document.getElementById('high-score');
  const messageDisplay = document.getElementById('message');
  
  // Símbolos tecnológicos (usando Font Awesome)
  const symbols = [
    'fa-microchip', 'fa-robot', 'fa-satellite', 'fa-keyboard',
    'fa-server', 'fa-code', 'fa-database', 'fa-memory',
    'fa-laptop-code', 'fa-network-wired', 'fa-bug', 'fa-shield-alt'
  ];
  
  let cards = [];
  let revealedCards = [];
  let matchedPairs = 0;
  let level = 1;
  let score = 0;
  let highScore = localStorage.getItem('techMemoryHighScore') || 0;
  let gameStarted = false;
  
  highScoreDisplay.textContent = highScore;
  
  // Inicializar el tablero
  function initializeBoard() {
    board.innerHTML = '';
    cards = [];
    revealedCards = [];
    matchedPairs = 0;
    
    // Seleccionar símbolos según el nivel (más símbolos en niveles más altos)
    const pairsCount = Math.min(4 + Math.floor(level / 2), 8); // Entre 4 y 8 pares
    const selectedSymbols = [...symbols].sort(() => 0.5 - Math.random()).slice(0, pairsCount);
    const gameCards = [...selectedSymbols, ...selectedSymbols].sort(() => 0.5 - Math.random());
    
    gameCards.forEach((symbol, index) => {
      const card = document.createElement('div');
      card.className = 'memory-cell';
      card.dataset.index = index;
      card.dataset.symbol = symbol;
      
      const icon = document.createElement('i');
      icon.className = `fas ${symbol}`;
      card.appendChild(icon);
      
      card.addEventListener('click', () => handleCardClick(card));
      board.appendChild(card);
      cards.push(card);
    });
  }
  
  // Manejar clic en una carta
  function handleCardClick(card) {
    if (!gameStarted || revealedCards.length >= 2 || card.classList.contains('revealed') || card.classList.contains('matched')) {
      return;
    }
    
    // Revelar la carta
    card.classList.add('revealed');
    revealedCards.push(card);
    
    // Verificar si hay un par revelado
    if (revealedCards.length === 2) {
      const [card1, card2] = revealedCards;
      
      if (card1.dataset.symbol === card2.dataset.symbol) {
        // Par encontrado
        card1.classList.add('matched');
        card2.classList.add('matched');
        revealedCards = [];
        matchedPairs++;
        score += level * 10;
        scoreDisplay.textContent = score;
        
        // Verificar si se completó el nivel
        if (matchedPairs === cards.length / 2) {
          setTimeout(() => {
            levelUp();
          }, 1000);
        }
      } else {
        // No es un par, voltear de nuevo después de un breve retraso
        setTimeout(() => {
          card1.classList.remove('revealed');
          card2.classList.remove('revealed');
          revealedCards = [];
        }, 1000);
      }
    }
  }
  
  // Subir de nivel
  function levelUp() {
    level++;
    levelDisplay.textContent = level;
    levelDisplay.classList.add('level-up');
    messageDisplay.innerHTML = `<p>¡Nivel ${level} desbloqueado! Completa ${Math.min(4 + Math.floor(level / 2), 8)} pares.</p>`;
    
    setTimeout(() => {
      levelDisplay.classList.remove('level-up');
      initializeBoard();
    }, 1500);
  }
  
  // Iniciar juego
  startBtn.addEventListener('click', () => {
    if (!gameStarted) {
      gameStarted = true;
      level = 1;
      score = 0;
      levelDisplay.textContent = level;
      scoreDisplay.textContent = score;
      messageDisplay.innerHTML = '<p>Encuentra todos los pares de símbolos tecnológicos.</p>';
      initializeBoard();
    }
  });
  
  // Reiniciar juego
  resetBtn.addEventListener('click', () => {
    gameStarted = false;
    level = 1;
    score = 0;
    levelDisplay.textContent = level;
    scoreDisplay.textContent = score;
    messageDisplay.innerHTML = '<p>Presiona "Iniciar" para comenzar el juego</p>';
    board.innerHTML = '';
    
    // Actualizar puntaje máximo si es necesario
    if (score > highScore) {
      highScore = score;
      highScoreDisplay.textContent = highScore;
      localStorage.setItem('techMemoryHighScore', highScore);
    }
  });
});