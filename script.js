// Game variables
const boardSize = 10; // 10x10 grid
const rat = "🐀";
const cheese = "🧀";
const empty = "";
let ratPosition = { x: 0, y: 0 };
let cheesePosition = { x: 5, y: 5 };
let score = 0;

// Create the game board
const gameBoard = document.getElementById("game-board");

function createBoard() {
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.x = x;
      cell.dataset.y = y;
      gameBoard.appendChild(cell);
    }
  }
}

// Update the board with rat and cheese positions
function updateBoard() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => {
    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);

    if (x === ratPosition.x && y === ratPosition.y) {
      cell.textContent = rat;
    } else if (x === cheesePosition.x && y === cheesePosition.y) {
      cell.textContent = cheese;
    } else {
      cell.textContent = empty;
    }
  });
}

// Move the rat
function moveRat(event) {
  switch (event.key) {
    case "ArrowUp":
      if (ratPosition.y > 0) ratPosition.y--;
      break;
    case "ArrowDown":
      if (ratPosition.y < boardSize - 1) ratPosition.y++;
      break;
    case "ArrowLeft":
      if (ratPosition.x > 0) ratPosition.x--;
      break;
    case "ArrowRight":
      if (ratPosition.x < boardSize - 1) ratPosition.x++;
      break;
  }

  // Check if rat eats cheese
  if (ratPosition.x === cheesePosition.x && ratPosition.y === cheesePosition.y) {
    score++;
    alert(`Yum! Score: ${score}`);
    placeCheeseRandomly();
  }

  updateBoard();
}

// Place cheese at a random position
function placeCheeseRandomly() {
  cheesePosition.x = Math.floor(Math.random() * boardSize);
  cheesePosition.y = Math.floor(Math.random() * boardSize);
}

// Initialize the game
function init() {
  createBoard();
  updateBoard();
  document.addEventListener("keydown", moveRat);
}

init();