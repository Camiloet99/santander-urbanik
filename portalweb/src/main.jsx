import React from "react";
import ReactDOM from "react-dom/client";
// 🔽 comenta App y usa Mapa
// import App from "./App";
import "./index.css";
import { AuthProvider } from "@/context/AuthContext";
import Mapa from "./pages/Mapa"; // <-- si Mapa.jsx está en src/pages
// o: import Mapa from "./components/Mapa";  si está en src/components

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <Mapa />
    </AuthProvider>
  </React.StrictMode>
);
