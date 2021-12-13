const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

const addMessage = (message) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
};

const handleMessageSubmit = (event) => {
  event.preventDefault();
  const input = room.querySelector("#message input");
  const value = input.value;
  socket.emit("new_message", value, roomName, () => {
    addMessage(`You : ${value}`);
  });
  input.value = "";
};

const handleNicknameSubmit = (event) => {
  event.preventDefault();
  const input = nicknameForm.querySelector("input");
  socket.emit("nickname", input.value);
};

const showRoom = () => {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const messageForm = room.querySelector("#message");
  messageForm.addEventListener("submit", handleMessageSubmit);
};

const handleRoomSubmit = (event) => {
  event.preventDefault();
  const roomnameInput = form.querySelector("#roomname");
  const nicknameInput = form.querySelector("#nickname");
  socket.emit("enter_room", roomnameInput.value, nicknameInput.value, showRoom);
  roomName = roomnameInput.value;
};

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (name, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${name} joined!`);
});

socket.on("bye", (name, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${name} left :(`);
});

/* 아래의 코드와 동일한 의미이다. 
socket.on("new_message", (message) => {
  addMessage(message);
});
*/
socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});

/* WEBSOCKET CODE  
const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nickForm = document.querySelector("#nick");
const socket = new WebSocket(`ws://${window.location.host}`);

const makeMessage = (type, payload) => {
  const msg = { type, payload };
  return JSON.stringify(msg);
};

socket.addEventListener("open", () => {
  console.log("Connected to Server ✅");
});

socket.addEventListener("message", (message) => {
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
});

socket.addEventListener("close", () => {
  console.log("Disconnected from Server ❌");
});

const handleSubmit = (event) => {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(makeMessage("new_message", input.value));
  const li = document.createElement("li");
  li.innerText = `You: ${input.value}`;
  messageList.append(li);
  input.value = "";
};

const handleNickSubmit = (event) => {
  event.preventDefault();
  const input = nickForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value));
  input.value = "";
};

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);
*/
