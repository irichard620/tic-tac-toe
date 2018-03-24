// Constants
const SYMBOLS = {
  x:'X',
  o:'O'
};
const RESULT = {
  inprogress: 0,
  xWon: 1,
  oWon: 2,
  tie: 3
};
const SCREEN = {
  q1: 1,
  q2: 2,
  game: 3,
  end: 4
};
const winCombos = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6]
];

// KEep track of state
state = {};

function startProgram() {
  state = {
    screen: SCREEN.q1,
    player1: {
      symbol: null,
      isHuman: true,
      score: 0
    },
    player2: {
      symbol: null,
      isHuman: false,
      score: 0  
    }
  };
}

function startGame() {
  state.game = {
    board: ["", "", "", "", "", "", "", "", ""],
    turn: Math.round(Math.random())
  };
}
  
/* Data methods */
//--------------------------
  
function checkResult(board) {
  // Default result is in progress
  var result = RESULT.inprogress;
  
  // Check for win
  for (var i = 0; i < winCombos.length; i++) {
		if (board[winCombos[i][0]] === SYMBOLS.x &&
			board[winCombos[i][1]] === SYMBOLS.x &&
			board[winCombos[i][2]] === SYMBOLS.x) {
			return RESULT.xWon;
		} else if (board[winCombos[i][0]] === SYMBOLS.o &&
			board[winCombos[i][1]] === SYMBOLS.o &&
			board[winCombos[i][2]] === SYMBOLS.o) {
			return RESULT.oWon;
		}
	}

  // Check if all spots filled and it's a tie
  var isTie = true;
  for (i = 0; i < board.length; i++){
    if (board[i] === "") {
      isTie = false;
    }
  }
  if (isTie) {
    return RESULT.tie;
  }

  // If not returned, return inprogress
  return result;
}
  
function getPossibleMoves(board) {
  // Get an array of potential moves
  var possibleMoves = [];
  for (var i = 0; i < board.length; i++) {
    if (board[i] === "") {
      // If no symbol, add to array
      possibleMoves.push(i);
    }
  }
  return possibleMoves;
} 
  
// ES2015 shuffle
function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
  
function getComputerMove(board, symbol, depth) {
  // Get possible moves
  var possibleMoves = getPossibleMoves(board);
  
  var result = checkResult(board);
	if ((result === RESULT.oWon && state.player1.symbol === SYMBOLS.o) ||
     (result === RESULT.xWon && state.player1.symbol === SYMBOLS.x)) {
    // Human player won
		return { score: -10 + depth };
	} else if (result === RESULT.xWon || result === RESULT.oWon) {
    // AI won
		return { score: 10 - depth };
	} else if (result === RESULT.tie) {
		return { score: 0 };
	}
  
  // Array for storing moves and scores
  var moveScores = [];
  
  // Iterate over potential moves
  var boardCopy = JSON.parse(JSON.stringify(board));
  var otherSymbol = (symbol === SYMBOLS.x) ? SYMBOLS.o : SYMBOLS.x;
  for (var i = 0; i < possibleMoves.length; i++) {
    
    // Apply the move
    var move = possibleMoves[i];
    boardCopy[move] = symbol;
    
    // Get best move recursively
    var best = getComputerMove(boardCopy, otherSymbol, depth + 1);
    // Add to moves, scores array
    moveScores.push({score: best.score, move: move});
    // Reset board copy
    boardCopy[move] = "";
  }
    
  // Randomize array so computer doesnt play the same every time
  shuffle(moveScores);
  
  if (state.player1.symbol === symbol) {
    // Human - sort ascending 
    moveScores.sort((a, b) => a.score - b.score);
  } else {
    // AI - sort descending
    moveScores.sort((a, b) => b.score - a.score);
  }

  // Get first item
  return moveScores[0];
}
  
/* View methods */
//--------------------------

function getBoardHTML() {
  // HTML for board
  var boardHTML = state.game.board.reduce(function(acc, currValue, currIndex) {
    // Add row beginning
    if (currIndex === 0 || currIndex === 3 || currIndex === 6) {
      var rowIndex = currIndex / 3;
      acc += `<div id="row${rowIndex}" class="row">`;
    }

    // Add cell
    var colIndex = currIndex % 3;
    acc += `<div class="cell col${colIndex}" data-row="${currIndex}">
${currValue}</div>`;

    // Add row ending
    if (currIndex === 2 || currIndex === 5 || currIndex === 8) {
      acc += `</div>`;
    }
    return acc;
  }, ``);
  return boardHTML;
}

function getScoreHTML() {
  var scoreHTML = `<h4><b><u>Score:</u></b></br>Player 1: ${state.player1.score}</br>${state.player2.isHuman? "Player 2" : "Computer" }: ${state.player2.score}</h4>`;
  return scoreHTML;
}
  
function render() {
  html = "";
  if (state.screen == SCREEN.q1) {
    html = `<div id="screen-q1"><h3>How many players?\n</h3>
      <button type="button" class="btn btn-lg btn-default btnq1" data="computer">Single Player</button>
      <button type="button" class="btn btn-lg btn-default btnq1" data="human">Two Players</button>
      </div>`;
  } else if (state.screen == SCREEN.q2) {
    var playerName = "";
    if (state.player2.isHuman) playerName = "Player 1, <br/>";
    html = `<div id="screen-q2"><h3>${playerName}Would you like to be X or O?</h3>
      <button type="button" class="btn btn-lg btn-default btnq2" data="X">X</button>
      <button type="button" class="btn btn-lg btn-default btnq2" data="O">O</button>
      </div>`;
  } else if (state.screen == SCREEN.game) {
    // Get current turn
    var currentPlayerTurn = "";
    if (state.game.turn === 0) {
      currentPlayerTurn = "Player 1";
    } else {
      if (state.player2.isHuman) {
        currentPlayerTurn = "Player 2";  
      } else {
        currentPlayerTurn = "Computer";
      }
    }
    
    //  Get turn and score HTML
    var turnHTML = `<h3><b><u>Turn:</u></b></br>${currentPlayerTurn}</h3></br>`;
    var scoreHTML = getScoreHTML();
    
    // HTML for board
    var boardHTML = getBoardHTML();
    html = `<div id='screen-game'> ${turnHTML}<div id="board">${boardHTML}</div>${scoreHTML} </div>`;
  } else {
    // Check result
    var result = checkResult(state.game.board);
    var resultText = "It was a draw!";
    if ((state.player1.symbol == SYMBOLS.x && result == RESULT.xWon) ||
         (state.player1.symbol == SYMBOLS.o && result == RESULT.oWon))  {
      resultText = "Player 1 won the game!";
    } else if (result == RESULT.xWon || result == RESULT.oWon) {
      resultText = (state.player2.isHuman) ? "Player 2 won the game!" : "The Computer won the game!";
    }
    
    var resultHTML = `<h3>${resultText}</h3><button type="button" class="btn btn-lg btn-default btnrestart" data="restart">Restart</button></br>`;
    var scoreHTML = getScoreHTML();
    var boardHTML = getBoardHTML();
    html = `<div id='screen-end'> ${resultHTML} <div id="board">${boardHTML}</div> ${scoreHTML} </div>`;
  }
  document.getElementById("container").innerHTML = html;
}  
  
/* Interaction */
//--------------------------
  
function q1Handler(click) {
  state.player2.isHuman = ($(click.currentTarget).attr('data') !== "computer");
  state.screen = SCREEN.q2;
  render();
}

function q2Handler(click) {
  // Set symbols
  state.player1.symbol = $(click.currentTarget).attr('data');
  if (state.player1.symbol === SYMBOLS.x) {
    state.player2.symbol = SYMBOLS.o;  
  } else {
    state.player2.symbol = SYMBOLS.x;
  }
  
  // Set state
  state.screen = SCREEN.game;
  
  // Initialize game
  startGame();
    
  // Make computer move if needed
  if (!state.player2.isHuman && state.game.turn === 1) {
    aiHandler();
  }
  
  // Re-render
  render();
}
  
function moveHandler(click) {
    // Get symbol
    var symbol = "";
    if (state.game.turn === 0) symbol = state.player1.symbol;
    else symbol = state.player2.symbol;
    
    // Get index
    var index = parseInt($(click.currentTarget).attr('data-row'));
    
    // Perform turn
    performTurn(index, symbol);
}

function aiHandler() {
  var moveScore = getComputerMove(state.game.board, state.player2.symbol, 0);
  performTurn(moveScore.move, state.player2.symbol);
}
  
function performTurn(move, symbol) {
  // Check if already performed
  if (state.game.board[move] !== "") return;
  
  // Apply it
  state.game.board[move] = symbol;
  
  // Check result
  var result = checkResult(state.game.board);
  if (result === RESULT.inprogress) {
    // Switch turns and re-render
    if (state.game.turn === 0) state.game.turn = 1;
    else state.game.turn = 0;
      // Do computer move if needed
    if (state.game.turn === 1 && !state.player2.isHuman) {
      aiHandler();
    }
  } else {
    // Increase score if winning
    if ((state.player1.symbol == SYMBOLS.x && result == RESULT.xWon) ||
         (state.player1.symbol == SYMBOLS.o && result == RESULT.oWon))  {
      state.player1.score++;
    } else if (result == RESULT.xWon || result == RESULT.oWon) {
      state.player2.score++;
    }
    
    // Render end screen
    state.screen = SCREEN.end;
  }
  render();
}
  
function endHandler(click) {
    // Reset game data
    startGame();
  
    // Set screen
    state.screen = SCREEN.game;
  
    // Re-render
    render();
    
    // Do computer move if needed
    if (state.game.turn === 1 && !state.player2.isHuman) {
      aiHandler();
    }
}
  
var container = document.getElementById("container");
// Clicking button for one or two players
$(container).on("click", ".btnq1", q1Handler);
  
// Clicking symbol
$(container).on("click", ".btnq2", q2Handler);
  
// Player making a move - clicking cell
$(container).on("click", "#screen-game .cell", moveHandler);
  
// Click at end of game to restart
$(container).on("click", ".btnrestart", endHandler);
  
/* Start program */
//--------------------------
startProgram();
render();