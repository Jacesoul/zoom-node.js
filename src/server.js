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

io.on("connection", (socket) => {
  socket.on("room", (roomName, done) => {
    console.log(roomName);
    setTimeout(() => {
      done("hello from the backend");
    }, 5000);
  });
});

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

httpServer.listen(PORT, handleListen); // localhost는 동일한 포트에서 http, ws 요청 두개를 다 처리할수 있다.
