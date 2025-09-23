import "./App.css";
import { AuthDemo } from "./components/AuthDemo";
import { PasteManager } from "./components/PasteManager";

function App() {
  return (
    <div className="App">
      <AuthDemo />
      <hr style={{ margin: "20px 0" }} />
      <PasteManager />
    </div>
  );
}

export default App;
