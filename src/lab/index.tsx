import React from "react";
import { createRoot } from "react-dom/client";
import { LabPage } from "./pages/LabPage";
import "./styles.css";

const mount =
  document.getElementById("lab-root") ?? document.getElementById("root");

if (mount) {
  createRoot(mount).render(<LabPage />);
}
