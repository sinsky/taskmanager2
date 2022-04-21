import React from "react";
import { render } from "react-dom";
import { App } from "./client/App";
import "@babel/polyfill";

const root = document.querySelector("#app");

render(<App />, root);
