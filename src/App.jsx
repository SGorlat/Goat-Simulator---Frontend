import { Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import CreateCareer from "./pages/CreateCareer";
import GameScreen from "./pages/GameScreen";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateCareer />} />
        <Route path="/game/:id" element={<GameScreen />} />
        {/* <Route path="/rankings" element={<TopRankings />} /> */}
      </Routes>
    </div>
  );
}

export default App;
