import "./styles/main.css";
import { initLauncher } from "./launcher";

if (location.protocol === "file:") {
  alert("Run a local server: npm run dev");
} else {
  initLauncher();
}
