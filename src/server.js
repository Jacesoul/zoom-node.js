import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/")); // 다른 URL을 사용하지 않고 오직 home URL만 사용

const PORT = 3000;
const handleListen = () => console.log(`Listening on http://localhost:${PORT}`);
app.listen(PORT, handleListen);
