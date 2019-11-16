const express = require("express");
const app = express();

app.use(express.static("wasm"));
app.listen(3011, () => console.log("listening on 3011"));
