//emit matlab bhejna frontend se churan bhejega backend pe sabko
// socket.emit("churan")

//iska matalb jab bhi kisi bhi socket se churan paadi event aaye toh yeh function chala dena
// socket.on("churan paapdi" , function(){
//     //yeh browser pe print hoga
//     console.log("churan paapdi recevied");
// })

const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";
  board.forEach((row, rowindex) => {
    row.forEach((square, squareindex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add(
        "square",
        (rowindex + squareindex) % 2 === 0 ? "light" : "dark"
      );

      squareElement.dataset.row = rowindex;
      squareElement.dataset.col = squareindex;

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );
        pieceElement.innerHTML = getPieceUnicode(square); // Changed from innerText to innerHTML
        pieceElement.draggable = playerRole === square.color;

        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement;
            sourceSquare = { row: rowindex, col: squareindex };

            // Draggable event setup
            e.dataTransfer.setData("text/plain", "");
          }
        });

        pieceElement.addEventListener("dragend", (e) => {
          draggedPiece = null;
          sourceSquare = null;
        });

        squareElement.appendChild(pieceElement);
      }

      squareElement.addEventListener("dragover", function (e) {
        e.preventDefault();
      });

      squareElement.addEventListener("drop", function (e) {
        e.preventDefault();
        if (draggedPiece) {
          const targetSource = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col),
          };

          handleMove(sourceSquare, targetSource);
        }
      });
      boardElement.appendChild(squareElement);
    });
  });

  if (playerRole === "b") {
    boardElement.classList.add("flipped");
  } else {
    boardElement.classList.remove("flipped");
  }
};


const handleMove = (source, target) => {
  const move = {
    from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
    to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
    promotion: "q",
  };

  socket.emit("move", move);
};
const getPieceUnicode = (piece) => {
  const unicodePieces = {
      // Black Pieces
      p: '♟', // Black Pawn
      r: '♜', // Black Rook
      n: '♞', // Black Knight
      b: '♝', // Black Bishop
      q: '♛', // Black Queen
      k: '♚', // Black King
      // White Pieces
      P: '♙', // White Pawn
      R: '♖', // White Rook
      N: '♘', // White Knight
      B: '♗', // White Bishop
      Q: '♕', // White Queen
      K: '♔', // White King
  };

  const unicode = unicodePieces[piece.type] || "";

  // Apply unique color to white pawns
  if (piece.color === "w" && piece.type === "P") {
      return `<span style="color: gold;">${unicode}</span>`; // Change "gold" to your desired color
  }

  return unicode;
};


socket.on("playerRole", function (role) {
  playerRole = role;
  renderBoard();
});

socket.on("spectatorRole", function () {
  playerRole = null;
  renderBoard();
});

socket.on("boardState", function (fen) {
  chess.load(fen);
  renderBoard();
});

socket.on("move", function (move) {
  chess.move(move);
  renderBoard();
});

renderBoard();
