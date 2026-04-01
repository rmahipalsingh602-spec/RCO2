import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "rgba(6, 15, 12, 0.96)",
          color: "#f3fff8",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 18px 40px rgba(0, 0, 0, 0.35)",
          borderRadius: "18px"
        },
        success: {
          iconTheme: {
            primary: "#39d382",
            secondary: "#04110b"
          }
        }
      }}
    />
  </BrowserRouter>
);
