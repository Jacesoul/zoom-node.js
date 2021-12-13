import http from "http"; // http는 이미 node.js에 설치되어 있기 때문에 설치할 필요가 없다.
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/")); // 다른 URL을 사용하지 않고 오직 home URL만 사용

const PORT = 4000;
const handleListen = () => console.log(`Listening on http://localhost:${PORT}`);

const httpServer = http.createServer(app); // webSocket을 사용하려면 express http 서버에 직접 접근할수 있도록 만들어야한다.
const io = SocketIO(httpServer);

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = io;
  /* 위처럼 한번에 가져올수 있다.
  const sids = io.sockets.adapter.sids;
  const rooms = io.sockets.adapter.rooms;
  */
  const publicRoom = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRoom.push(key);
    }
  });
  return publicRoom;
}

function countRoom(roomName) {
  return io.sockets.adapter.rooms.get(roomName)?.size; // 가끔 roomName을 찾지 못할수도 있기에 optional chaining을 넣는다.
}

io.on("connection", (socket) => {
  socket["nickname"] = "Anonymous";
  socket.onAny((event) => {
    // onAny는 미들웨어인데 어느 event든지 console.log를 할수 있다.
    console.log(io.sockets.adapter);
    console.log(`Socket Event : ${event}`);
  });

  socket.on("enter_room", (roomName, nickname, done) => {
    socket.join(roomName); // 같은 roomName이라면 같은 방에 있는 사람들에게 함께 socket.emit()을 보낸다.
    socket["nickname"] = nickname;
    done();
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    io.sockets.emit("room_change", publicRooms()); // 모든 방에 메세지 전달(전체 서버에서 모든 socket으로 보냄 - broadcast)
  });

  socket.on("disconnecting", () => {
    console.log(socket.rooms);
    socket.rooms.forEach(
      (room) =>
        socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1) // disconnecting은 아직 방을 떠나지 않아 여기 방까지 포함이 되서 계산이 되기 때문에 countRoom에 1을 뺀다.
    );
  });

  socket.on("disconnect", () => {
    io.sockets.emit("room_change", publicRooms());
  });

  socket.on("new_message", (message, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname} : ${message}`);
    done();
  });

  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

httpServer.listen(PORT, handleListen); // localhost는 동일한 포트에서 http, ws 요청 두개를 다 처리할수 있다.

/* WEBSOCKET CODE
const wss = new WebSocket.Server({ server }); // server를 굳이 넣지 않아도 되지만 이렇게 하면 http서버 위에 webSocket서버를 같은 PORT에서 만들수있다. http서버가 필요없을때는 webSocket서버만을 만들면된다.

const sockets = []; // 누군가 서버에 연결하면 그 connection을 여기에 넣는다.
wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anonymous";
  console.log("Conected to Browser ✅");
  socket.on("close", () => console.log("Disconnected from Browser ❌"));
  socket.on("message", (message) => {
    const parsedMessage = JSON.parse(message);
    switch (parsedMessage.type) {
      case "new_message":
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${parsedMessage.payload}`)
        );
        break;
      case "nickname":
        socket["nickname"] = parsedMessage.payload;
        break;
    }
  });
});
*/
