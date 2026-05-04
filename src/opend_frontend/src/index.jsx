import React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import { HttpAgent } from "@dfinity/agent";


async function init() {
  // ✅ Create agent
  const agent = new HttpAgent({
    host: "http://127.0.0.1:4943",
  });

  // ✅ TRUST LOCAL ICP CERTIFICATE (VERY IMPORTANT)
  await agent.fetchRootKey();

  // 🔹 Optional: make agent globally available
  window.icAgent = agent;

  // ✅ Render React app AFTER trust is set
  const container = document.getElementById("root");
  const root = createRoot(container);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// 🔥 Start app
init();

