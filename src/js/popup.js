import "../css/popup.css";
import App from "./popup/App.jsx";
import React from "react";
import { render } from "react-dom";

window.addEventListener("close", event => {
  console.log(event);
});
render(<App />, window.document.getElementById("app-container"));
