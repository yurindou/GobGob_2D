import { INVALID_MOVE } from 'boardgame.io/core';
const util = require('./util/Util');

export const TicTacToe = {
  setup: () => (
    {
      // This has All cell values.
      // Values in these array is Selected Pieces' id + PlayerID: 00, 01, 10, ..., 51.
      // The first "[]" means "Cell ID", the second one means "Depth".
      cells: Array(9).fill(Array(3).fill(null)),

      // This is for displaying values on the board.
      // Values in these array is PlayerID: 0 or 1.
      displayCells: Array(9).fill(null),

      // Available pieces
      // true: active, available / false: deactive, inavailable
      activePieces: Array(2).fill(Array(6).fill(true)),

      // Piece current player selects
      // Values in this is Pieces' data-id: 0~5.
      selectedPiece: null,

      pieceBackUp: {cell: null, value: null},

      // The flag of 
      pickUpFlg: false,
    }
  ),
  turn: {
    minMoves: 1,
  },

  moves: {
    clickCell: ({ G, events, playerID }, id) => {
      // Case of not selecting piece
      if (G.selectedPiece === null) {
        // Check which side piece
        if (isPlayersPiece(playerID, G.displayCells[id])) {
          G.selectedPiece = parseInt(util.getAnyDigit(G.cells[id][0], 0));
          G.displayCells[id] = 
            null !== G.cells[id][1] ? String(util.getAnyDigit(G.cells[id][1], 1)): null;
          G.pieceBackUp = {cell: id, value: G.cells[id][0]};
          G.cells[id].shift();
          G.cells[id].push(null);
          G.pickUpFlg = true;
          return;
        }

      // Case of already piece selected
      } else {
        if (cannotSetPiece(G.cells[id], G.selectedPiece)) return INVALID_MOVE;

        // Set value
        G.displayCells[id] = playerID;
        const detailValue = String(G.selectedPiece)+String(playerID);
        pushCell(G.cells[id], detailValue);

        // Deactivate piece
        G.activePieces[playerID][G.selectedPiece] = false;

        // Initialize selected piece and back up of piece
        G.selectedPiece = null;
        G.pieceBackUp = {cell: null, value: null};
        G.pickUpFlg = false;
        
        // Turn end.
        events.endTurn();
      }
    },
    clickPiece: ({ G, playerID }, id) => {
      // Check available piece or not
      if (!G.pickUpFlg && G.activePieces[playerID][id]) {
        G.selectedPiece = id;
      }
    },
    clickSelect: ({ G, playerID }) => {
      if (null !== G.pieceBackUp.cell) {
        // Make it impossible to undo ...?
        // activate piece
        G.activePieces[playerID][G.selectedPiece] = true;
        G.pickUpFlg = false;
      }
      G.selectedPiece = null;
      return;
    },
  },

  endIf: ({ G, ctx }) => {
    const result = IsVictory(G.displayCells);
    if (result.result) {
      // TODO fix it lately
      const winner = G.displayCells[result.winningLine[0]];
      return { winner: winner, wLine: result.winningLine };
    }
    // if (IsDraw(G.displayCells)) {
    //   return { draw: true };
    // }
  },

  // TODO: まったく考えてない、多分動かない。どうやって作るんでしょうか。
  ai: {
    enumerate: (G, ctx) => {
      let moves = [];
      for (let i = 0; i < 9; i++) {
        if (G.cells[i].at(-1) === null) {
          moves.push({ move: 'clickCell', args: [i] });
        }
      }
      return moves;
    },
  },
};

/**
 * Check whether the piece clicked by player is current player's piece or not.
 * @param   {*} pid Player ID
 * @param   {*} cell Clicked cell info
 * @returns {boolean} true: Current player's piece / false: Opponet's piece
 */
function isPlayersPiece(pid, cell) {
  return pid === cell ? true : false;
}

/**
 * Check player can place piece.
 * @param {*} cells Clicked cell info
 * @param {*} sPiece Selected piece
 * @returns  {boolean} true: piece can be put / false: piece cannot be put
 */
function cannotSetPiece(cells, sPiece) {
  if (null === cells[0]) {
    return false;
  } else {
    // Confirm the cell which player selected is afford to have additional value.
    const isFilled = !cells.includes(null);
    // Is placed piece larger than selected piece.
    const isSPieceSmaller = 
      util.getPieceSize(parseInt(sPiece)) <= util.getPieceSize(parseInt(util.getAnyDigit(cells[0], 0)));
    
    return isFilled || isSPieceSmaller;
  }
}

/**
 * Push the value into target cell.
 * [0]: Latest added value / [2]: Oldest added value
 * e.g.: {"", "", ""} -> {"0", "", ""} -> {"1", "0", ""}
 * @param {*} cell Target cell
 * @param {*} pid Player ID
 */
function pushCell(cell, pid) {
  cell.pop();
  cell.unshift(pid);
}

/**
 * Return true if `cells` is in a winning configuration.
 * When true, also return the winning line for highlighting cells.
 * @param   {*} displayCells 
 * @returns {boolean} true: Current player wins / false: Not game over
 */
function IsVictory(displayCells) {
  const positions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  const isRowComplete = row => {
    const symbols = row.map(i => displayCells?.[i]);
    return symbols.every(i => i !== null && typeof i !== 'undefined' && i === symbols[0]);
  };

  const winningLine = positions.map(isRowComplete).findIndex(i => i === true);

  if (0 <= winningLine) {
    return { result: true, winningLine: positions[winningLine] };
  } else {
    return { result: false };
  }
}


/**
 * Return true if all `cells` are occupied.
 * But, draw never occures in this game.
 * @param {*} displayCells 
 * @returns true: draw / false: not draw
 */
function IsDraw(displayCells) {
  return displayCells.filter(c => c === null).length === 0;
}


