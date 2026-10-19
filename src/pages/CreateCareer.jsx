import { useState, useEffect } from "react";
import { createCareer } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../style/createCareer.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

function CreateCareer() {
  const [playerName, setPlayerName] = useState("");
  const [positions, setPositions] = useState([]);
  const [position, setPosition] = useState("");
  const [nationality, setNationality] = useState("España");

  const navigate = useNavigate();

  // Carga las posiciones del backend al montar el componente
  useEffect(() => {
    fetch(`${API_URL}/positions`)
      .then((res) => res.json())
      .then((data) => {
        setPositions(data);
        if (data.length > 0) {
          setPosition(data[0].id); // Primera posición como valor por defecto
        }
      });
  }, []);

  const handlesubmit = async () => {
    const career = await createCareer(playerName, position, nationality);
    navigate(`/game/${career.id}`);
  };

  return (
    <div className="form-container">
      <div className="form-group">
        <label htmlFor="name">Nombre:</label>
        <input
          type="text"
          name="name"
          id="name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <label htmlFor="position">Posición:</label>
      </div>
      <div className="form-group">
        <select
          name="position"
          id="position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        >
          {positions.map((pos) => (
            <option key={pos.id} value={pos.id}>
              {pos.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <select
          name="nationality"
          id="nationality"
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
        >
          <option value="España">España</option>
          <option value="Argentina">Argentina</option>
          <option value="Brasil">Brasil</option>
          <option value="Francia">Francia</option>
          <option value="Inglaterra">Inglaterra</option>
          <option value="Alemania">Alemania</option>
          <option value="Portugal">Portugal</option>
          <option value="Italia">Italia</option>
          <option value="México">México</option>
          <option value="Colombia">Colombia</option>
          <option value="Países Bajos">Países Bajos</option>
          <option value="Bélgica">Bélgica</option>
          <option value="Turquía">Turquía</option>
          <option value="Estados Unidos">Estados Unidos</option>
          <option value="Uruguay">Uruguay</option>
          <option value="Chile">Chile</option>
          <option value="Croacia">Croacia</option>
          <option value="Serbia">Serbia</option>
          <option value="Dinamarca">Dinamarca</option>
          <option value="Suiza">Suiza</option>
          <option value="Austria">Austria</option>
          <option value="Escocia">Escocia</option>
          <option value="Grecia">Grecia</option>
          <option value="Polonia">Polonia</option>
          <option value="Noruega">Noruega</option>
          <option value="Suecia">Suecia</option>
          <option value="Nigeria">Nigeria</option>
          <option value="Senegal">Senegal</option>
          <option value="Camerún">Camerún</option>
          <option value="Ghana">Ghana</option>
          <option value="Costa de Marfil">Costa de Marfil</option>
          <option value="Marruecos">Marruecos</option>
          <option value="Egipto">Egipto</option>
          <option value="Japón">Japón</option>
          <option value="Corea del Sur">Corea del Sur</option>
          <option value="Paraguay">Paraguay</option>
          <option value="Perú">Perú</option>
          <option value="Ecuador">Ecuador</option>
          <option value="Venezuela">Venezuela</option>
        </select>
      </div>
      <button onClick={handlesubmit}>Empezar Carrera</button>
    </div>
  );
}

export default CreateCareer;
