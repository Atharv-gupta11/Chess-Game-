const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");

//socket helps for real time connection

const app = express();
//http ka server banaya and usse express ke app se link kardiya and yeh server ab socket chalayega
const server = http.createServer(app);
const io = socket(server);
//io is the socket object which is used to send and receive data in real time

//chess ke jitne bhi rules hote hai and jitni bhi cheez hum chess js se kr sakte woh chess const mein aagayi
const chess = new Chess();
let players = {};
let currPlayer = "w";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index.ejs", { title: "Chess Game" });
});

io.on("connection", function (uniqueSocket) {
  console.log("a new user connected");

  //socket theory

  //iska matalb jab bhi kisi bhi socket se churan event aaye toh yeh function chala dena
  // uniqueSocket.on("churan" , function(){
  //     console.log("churan received");

  //     // abb backend sabko churan paapdi bheja frontend pe sb ke liye
  //     io.emit("churan paapdi");
  // })

  //jab bhi frontend and backend ka connection tutega tab yeh function execute hoga
  // uniqueSocket.on("disconnect" , function(){
  //     console.log("connection dissconnected")
  // });

  if (!players.white) {
    players.white = uniqueSocket.id;
    uniqueSocket.emit("playerRole", "w");
  } else if (!players.black) {
    players.black = uniqueSocket.id;
    uniqueSocket.emit("playerRole", "b");
  } else {
    uniqueSocket.emit("spectatorRole");
  }

  //if one of player leaves
  uniqueSocket.on("disconnect", function () {
    if (uniqueSocket.id === players.white) {
      delete players.white;
    } else if (uniqueSocket.id === players.black) {
      delete players.black;
    }
  });

  uniqueSocket.on("move", function (move) {
    try {
      if (chess.turn() === "w" && uniqueSocket.id != players.white) {
        return;
      }
      if (chess.turn() === "b" && uniqueSocket.id != players.black) {
        return;
      }

      const result = chess.move(move);
      if (result) {
        currPlayer = chess.turn();
        io.emit("move", move);
        io.emit("boardState", chess.fen());
      } else {
        console.log("Invalid move : ", move);
        uniqueSocket.emit("invalidMove", move);
      }
    } catch (err) {
      console.log(err);
      uniqueSocket.emit("Invalid move : ", move);
    }
  });
});

server.listen(3000, () => {
  console.log(`listening on port ${3000} server started!! `);
});
