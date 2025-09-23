import { useState } from "react";
import "./App.css";
import { Header } from "./components/Header";
import { AuthModal } from "./components/AuthModal";
import { PasteManager } from "./components/PasteManager";

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="App">
      <Header onLoginClick={() => setIsAuthModalOpen(true)} />
      <main
        style={{
          padding: "20px",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <PasteManager />
      </main>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default App;
