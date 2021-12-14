import http from "http"; // http는 이미 node.js에 설치되어 있기 때문에 설치할 필요가 없다.
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/")); // 다른 URL을 사용하지 않고 오직 home URL만 사용

const PORT = 4000;
const httpServer = http.createServer(app); // webSocket을 사용하려면 express http 서버에 직접 접근할수 있도록 만들어야한다.
const io = new Server(httpServer);

io.on("connection", (socket) => {
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("welcome");
  });
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
});

const handleListen = () => console.log(`Listening on http://localhost:${PORT}`);
httpServer.listen(PORT, handleListen); // localhost는 동일한 포트에서 http, ws 요청 두개를 다 처리할수 있다.
