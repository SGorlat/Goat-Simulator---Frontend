import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div>
      <div>
        <h1>THE GOAT</h1>
        <h2>Football Career Simulator</h2>
        <button onClick={() => navigate("/create")}>Nueva Carrera</button>
        <button onClick={() => navigate("/rankings")}>Hall of Fame</button>
      </div>
    </div>
  );
}

export default HomePage;
