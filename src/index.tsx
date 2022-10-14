import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "./panes.css";
import reportWebVitals from "./reportWebVitals";
import {GardenPlannerApp} from "./components/GardenPlannerApp/GardenPlannerApp";
import {crawlFfxivGardening} from "./tools/crawlFfxivGardening"
import {crawlXivdb} from "./tools/crawlXivdb"

// @ts-ignore
window.crawlFfxivGardening = crawlFfxivGardening;
// @ts-ignore
window.crawlXivdb = crawlXivdb;

ReactDOM.render(
  <React.StrictMode>
      <GardenPlannerApp />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
