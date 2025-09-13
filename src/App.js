import { Client } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer';
import { SocketIO } from 'boardgame.io/multiplayer';
import { TicTacToe } from './Game';
import oPiece from "../images/oPiece.png"; // Orange piece
import bPiece from "../images/bPiece.png"; // Blue piece

const util = require('./util/Util');

class TicTacToeClient {
  constructor(rootElement) {
    this.client = Client({ 
      game: TicTacToe
      // multiplayer: SocketIO({ server: 'localhost:8000' }),
      // playerID,
    });
    this.client.start();
    this.rootElement = rootElement;
    this.createBoard();
    this.createPieceArea();
    this.attachListeners();

    // As before, but we also subscribe to the client:
    this.client.subscribe(state => this.update(state));
  }
    
  createBoard() {
    // Create cells in rows for the Tic-Tac-Toe board.
    const rows = [];
    for (let i = -1; i < 3; i++) {
      const cells = [];
      for (let j = 0; j < 3; j++) {
        const id = 3 * i + j;

        if (i < 0 && j == 0) {
          cells.push(`<td class="address"></td>`); // Empty tag to adjust address
          cells.push(`<td class="address">${util.convertNumToAlphabet(j)}</td>`);
          
        } else if (i < 0 && 0 < j) {
          cells.push(`<td class="address">${util.convertNumToAlphabet(j)}</td>`);
        
        } else if (id === 0 || id === 3 || id === 6) {
          cells.push(`<td class="address">${i+1}</td>`);
          cells.push(`<td class="cell" data-id="${id}"></td>`);
          
        } else {
          cells.push(`<td class="cell" data-id="${id}"></td>`);
        }
      }
      rows.push(`<tr>${cells.join('')}</tr>`);
    }

    // Add the HTML to our app <div>.
    // We’ll use the empty <p> to display the game winner later.
    this.rootElement.innerHTML = `
      <p class="winner"></p>
      <table>${rows.join('')}</table>
    `;
  }

  createPieceArea() {
    // Create cells in rows for the Tic-Tac-Toe pieces.
    const pRows = [];
    for (let i = 0; i < 3; i++) {
      const cells = [];
      for (let j = 0; j < 3; j++) {
        const id = (3*i)+j
        
        if (i < 2) {
          cells.push(`<td class="piece" data-id="${id}" id=""></td>`);
        } else {
          cells.push(`<td class="size">${util.convertNumToPieceSize(j)}</td>`);
        }
      }
      pRows.push(`<tr>${cells.join('')}</tr>`);
    }

    const sRows = []
    for (let i = 0; i < 2; i++) {
      const cells = [];
      for (let j = 0; j < 3; j++) {
        const id = (3*i)+j
        cells.push(`
            <td class="opp" data-id="${id}" id=""></td>
          `);
      }
      sRows.push(`<tr>${cells.join('')}</tr>`);
    }

    // Add the HTML to our app <div>.
    // We’ll use the empty <p> to display the game winner later.
    this.rootElement.innerHTML += `
      <div id="side">
        <div class="piece-area">
          <p>Pieces</p>
          <table>${pRows.join('')}</table>
        </div>
        <div class="select-area">
          <p>Select</p>
          <div class="select" id=""></div>
          <p>Opponent's Piece</p>
          <table>${sRows.join('')}</table>
        </div>
      </div>
    `;
  }

  attachListeners() {
    // This event handler will read the cell id from a cell’s
    // `data-id` attribute and make the `clickCell` move.
    const handleCellClick = event => {
      const cellId = parseInt(event.target.dataset.id);
      this.client.moves.clickCell(cellId);
    };
    // Attach the event listener to each of the board cells.
    const cells = this.rootElement.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.onclick = handleCellClick;
    });

    const handlePieceClick = event => {
      const pieceId = parseInt(event.target.dataset.id);
      this.client.moves.clickPiece(pieceId);
    };
    const pieces = this.rootElement.querySelectorAll('.piece');
    pieces.forEach(piece => {
      piece.onclick = handlePieceClick;
    });

    // 
    const handleSelectClick = event => {
      const pieceId = parseInt(event.target.dataset.id);
      this.client.moves.clickSelect();
    }
    const select = this.rootElement.querySelector('.select');
    select.onclick = handleSelectClick;

  }

  update(state) {
    if (state === null) return;

    // Update cells on the board.
    // Get all the board cells.
    const cells = this.rootElement.querySelectorAll('.cell');
    // Update cells to display the values in game state.
    cells.forEach(cell => {
      const cellId = parseInt(cell.dataset.id);
      const cellValue = state.G.displayCells[cellId];
      cell.textContent = cellValue !== null ? cellValue : '';
      cell.id = cellValue !== null ? "v"+ cellValue : '';

      // Set image of pieces.
      if (cellValue !== null) {
        const pSize = util.getPieceSize(parseInt(util.getAnyDigit(state.G.cells[cellId][0], 0)));
        const imgRatio = setPieceImageRatio(pSize)
        const pImg = togglePieceImage(parseInt(util.getAnyDigit(state.G.cells[cellId][0], 1)));
        cell.innerHTML = `<img src="${pImg}" data-id="${cell.dataset.id}" width="${imgRatio}px">`;
      }
      
      // When gameover, the winning line will be highlighted
      if (state.ctx.gameover
          && state.ctx.gameover.winner !== undefined
          && state.ctx.gameover.wLine.includes(cellId)) {
        // cell.style.setProperty("background-color", "#bcf68d");
        cell.classList.add("win");
      } else {
        // cell.style.setProperty("background-color", "#eaeaea");
        cell.classList.remove("win");
      }
    });

    // Update piece area
    const pieces = this.rootElement.querySelectorAll('.piece');
    var piecesIDX1 = 0;
    pieces.forEach(piece => {
      piece.id = "v"+state.ctx.currentPlayer;

      // Set image of pieces.
      const pSize = util.getPieceSize(parseInt(piece.dataset.id), 1);
      const imgRatio = setPieceImageRatio(pSize)
      const pImg = togglePieceImage(parseInt(state.ctx.currentPlayer));

      // Deactivate piece which has already set on the board.
      if (state.G.activePieces[state.ctx.currentPlayer][piecesIDX1]) {
        // piece.classList.remove("deactive");
        piece.innerHTML = `<img src="${pImg}" data-id="${piece.dataset.id}" width="${imgRatio}px">`;
      } else {
        // piece.classList.add("deactive");
        if (null !== piece.firstElementChild) {
          piece.removeChild(piece.firstElementChild);
        }
      }
      piecesIDX1++;
    });

    const selected = this.rootElement.querySelector('.select');
    if (null !== state.G.selectedPiece) {
      selected.id = state.G.selectedPiece;
      selected.textContent = state.G.selectedPiece;
      const imgRatio = setPieceImageRatio(util.getPieceSize(state.G.selectedPiece));
      const pImg = togglePieceImage(parseInt(state.ctx.currentPlayer));
      selected.innerHTML = `<img src="${pImg}" data-id="${selected.dataset.id}" width="${imgRatio}px">`;
    } else {
      if (null !== selected.firstElementChild) {
        selected.removeChild(selected.firstElementChild);
      }
    }

    const opponentPieces = this.rootElement.querySelectorAll('.opp');
    const opponent = "0" === state.ctx.currentPlayer ? "1" : "0";
    var piecesIDX2 = 0;
    opponentPieces.forEach(piece => {
      // Deactivate piece which has already set on the board.
      if (state.G.activePieces[opponent][piecesIDX2]) {
        piece.classList.remove("deactive");
      } else {
        piece.classList.add("deactive");
      }
      piecesIDX2++;
    });

    // Get the gameover message element.
    const messageEl = this.rootElement.querySelector('.winner');
    const pTurn = util.getPlayerName(state.ctx.currentPlayer)
    // Update the element to show a winner if any.
    if (state.ctx.gameover) {
      const winPlayer = util.getPlayerName(state.ctx.gameover.winner);
      messageEl.textContent =
        state.ctx.gameover.winner !== undefined
          ? 'Winner: ' + winPlayer
          : 'Draw!';
    } else {
      messageEl.textContent = `${pTurn}'s Turn!`;
    }
  }
}
    
const appElement = document.getElementById('app');
const playerIDs = ['0', '1'];
const clients = playerIDs.map(playerID => {
  // const rootElement = document.createElement('div');
  // appElement.append(rootElement);
  // return new TicTacToeClient(appElement, { playerID });
})
// const app = Server({ games: [TicTacToe] });
const app = new TicTacToeClient(appElement);

/**
 * Change image ratio by piece size.
 * @param {*} pSize Piece size
 * @returns 
 */
function setPieceImageRatio(pSize) {
  switch (pSize) {
    case 1:
      return 20;
    case 2:
      return 30;
    case 3:
      return 45;
    default:
      return 20;
  }
}

/**
 * // Toggle the piece image by player.
 * @param {*} pid Player ID
 * @returns Player = 0: orage / 1: blue
 */
function togglePieceImage(pid) {
  switch (pid) {
    case 0:
      return oPiece;
    case 1:
      return bPiece;
    default:
      return undefined;
  }
}