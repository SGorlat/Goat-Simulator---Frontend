import { useNavigate } from "react-router-dom";
import "../style/HomePage.css";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <span className="home-icon">⚽</span>
      <h1 className="home-title">THE GOAT</h1>
      <p className="home-subtitle">Football Career Simulator</p>
      <div className="home-buttons">
        <button className="btn-primary" onClick={() => navigate("/create")}>
          Nueva Carrera
        </button>
        <button className="btn-secondary" onClick={() => navigate("/rankings")}>
          Hall of Fame
        </button>
      </div>
    </div>
  );
}

export default HomePage;
