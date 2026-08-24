import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  acceptOffer,
  choose,
  getCareer,
  getOffers,
  nextTurn,
  simulateSeason,
} from "../services/api";
import "../style/GameScreen.css";

function GameScreen() {
  const { id } = useParams(); // Si la URL es /game/5, entonces id = "5", recoge parama de la URL

  const [career, setCareer] = useState(null);
  const [events, setEvents] = useState([]);
  const [outcomeText, setOutcomeText] = useState(null);
  const [nextEvent, setNextEvent] = useState(0);
  const [seasonResult, setSeasonResult] = useState(null); // Resultados temporada
  const [offers, setOffers] = useState([]);
  const [justSigned, setJustSigned] = useState(false);

  useEffect(() => {
    // fetch de los datos de la career
    const loadCareer = async () => {
      const data = await getCareer(id);
      setCareer(data);
    };
    // fetch de los eventos
    const loadEvents = async () => {
      const data = await nextTurn(id);
      setEvents(data);
    };
    //llamamos a ambos con los datos ya obtenidos
    loadCareer();
    loadEvents();
  }, [id]);

  // Si no hay datos aun..
  if (!career) {
    return <div>Cargando datos...</div>;
  }

  const currentEvent = events[nextEvent];

  const handleChoose = async (id, eventId, optionId) => {
    const result = await choose(id, eventId, optionId); // id del useParams corresp a careerId
    setOutcomeText(result); // guarda el texto resultado
    setNextEvent(() => nextEvent + 1); // mostramos sigueinte evento de la lista

    // Como recibimos nuevos stats segun la decision tomada..actualizamos
    const updateStats = await getCareer(id);
    setCareer(updateStats);
  };

  const handleEndSeason = async () => {
    setOutcomeText(null);
    setNextEvent(0);
    setEvents([]); // ← AÑADIR — limpia los eventos

    if (career.currentTeam === null) {
      const offers = await getOffers(id);
      setOffers(offers);

      // recargar career con los datos actualizados (edad, stats, etc.)
      const updateCareer = await getCareer(id);
      setCareer(updateCareer);
    } else {
      const simulateResult = await simulateSeason(id); // es el careerId que viene de use param(por URL)
      setSeasonResult(simulateResult);

      // recargar career con los datos actualizados (edad, stats, etc.)
      const updateCareer = await getCareer(id);
      setCareer(updateCareer);
    }
  };

  const nextSeason = async () => {
    setSeasonResult(null);
    setOutcomeText(null);
    setNextEvent(0);
    const newEvents = await nextTurn(id);
    setEvents(newEvents);

    const updateCareer = await getCareer(id);
    setCareer(updateCareer);
  };

  const handleAcceptOffer = async (offer) => {
    setOutcomeText(null);
    setEvents([]);

    await acceptOffer(id, offer); // no necesitamos guardar lo que vuelve porque se actualiza solo en career
    setOffers([]);

    // Actualizamos career
    const updateCareer = await getCareer(id);
    setCareer(updateCareer);

    setJustSigned(true); // recien fichado accede a pantalla de celebracion
  };

  // VER OFERTAS
  const handleShowOffers = async () => {
    setOutcomeText(null);
    setEvents([]);
    setSeasonResult(null);

    const myOffers = await getOffers(id);
    setOffers(myOffers);
  };

  return (
    <div>
      <h1>Carrera de {career.playerName}</h1>
      <div className="player-card">
        <div className="player-info">
          <p className="player-name">{career.playerName}</p>
          <p>{career.position?.name}</p>
          <p>{career.nationality}</p>
          <p>{career.currentTeam?.name || "Sin equipo"}</p>
          <p>{career.currentRole || "Sin rol definido"}</p>
          <p>Edad: {career.currentAge}</p>
        </div>
        <h3>Stats</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Definición</span>
            <span className="stat-value">{career.finishing}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Velocidad</span>
            <span className="stat-value">{career.speed}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Técnica</span>
            <span className="stat-value">{career.technique}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Visión</span>
            <span className="stat-value">{career.vision}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Física</span>
            <span className="stat-value">{career.physical}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Mental</span>
            <span className="stat-value">{career.mental}</span>
          </div>
        </div>
        <h3>Relaciones</h3>
        <div className="stats-grid" style={{ marginTop: "12px" }}>
          <div className="stat-item">
            <span className="stat-label">Afición</span>
            <span className="stat-value">{career.fansRelation}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Directiva</span>
            <span className="stat-value">{career.boardRelation}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Vestuario</span>
            <span className="stat-value">{career.teamRelation}</span>
          </div>
        </div>
        <h3>General</h3>
        <div className="stats-grid" style={{ marginTop: "12px" }}>
          <div className="stat-item">
            <span className="stat-label">Reputación</span>
            <span className="stat-value">{career.reputation}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Dinero</span>
            <span className="stat-value">{career.savings}</span>
          </div>
        </div>
      </div>

      {currentEvent && !outcomeText && (
        <div className="event-card">
          <p className="event-title">{currentEvent.title}</p>
          <p className="event-description">{currentEvent.description}</p>
          <div className="event-options">
            {currentEvent.options.map((eventOpt) => (
              <button
                className="option-btn"
                key={eventOpt.id}
                onClick={() =>
                  handleChoose(career.id, currentEvent.id, eventOpt.id)
                }
              >
                {eventOpt.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {outcomeText && nextEvent < events.length && (
        <div className="outcome-card">
          <p className="outcome-text">{outcomeText}</p>
          <button onClick={() => setOutcomeText(null)}>Continuar</button>
        </div>
      )}

      {outcomeText && nextEvent >= events.length && (
        <div className="outcome-card">
          <p className="outcome-text">{outcomeText}</p>
          <button onClick={handleEndSeason}>Finalizar temporada</button>
        </div>
      )}

      {seasonResult && (
        <div className="season-summary">
          <h2>Resumen de Temporada {seasonResult.seasonNumber}</h2>
          <div className="season-stats">
            <div className="season-stat">
              <span className="stat-label">Goles</span>
              <span className="stat-value">{seasonResult.goals}</span>
            </div>
            <div className="season-stat">
              <span className="stat-label">Asistencias</span>
              <span className="stat-value">{seasonResult.assists}</span>
            </div>
            <div className="season-stat">
              <span className="stat-label">Posición</span>
              <span className="stat-value">{seasonResult.leaguePosition}º</span>
            </div>
            <div className="season-stat">
              <span className="stat-label">Valoración</span>
              <span className="stat-value">{seasonResult.seasonRating}</span>
            </div>
            <div className="season-stat">
              <span className="stat-label">Equipo</span>
              <span className="stat-value">{seasonResult.team?.name}</span>
            </div>
            <div className="season-stat">
              <span className="stat-label">Premios</span>
              <span className="stat-value">
                {seasonResult.titlesWon || "Ninguno"}
              </span>
            </div>
          </div>
          {career.contractYearsLeft > 1 && (
            <button onClick={nextSeason}>
              Seguir en el {career.currentTeam?.name}
            </button>
          )}
          <button className="btn-secondary" onClick={handleShowOffers}>
            Ver ofertas del mercado
          </button>
        </div>
      )}

      {offers.length > 0 && (
        <div>
          {offers.map((o, index) => (
            <div className="offer-card" key={o.teamId || index}>
              <div className="offer-info">
                <p className="offer-team">{o.teamName}</p>
                <p className="offer-details">
                  {o.leagueName} · {o.role} · {o.contractYears} años
                </p>
              </div>
              <span className="offer-salary">
                {o.offeredSalary.toLocaleString()} €
              </span>
              <button onClick={() => handleAcceptOffer(o)}>Fichar</button>
            </div>
          ))}
          {career.contractYearsLeft > 1 && (
            <button
              className="btn-secondary"
              onClick={() => {
                setOffers([]);
                nextSeason();
              }}
            >
              Rechazar todas y seguir en el {career.currentTeam?.name}
            </button>
          )}
        </div>
      )}

      {justSigned && (
        <div className="celebration">
          <h2>¡Has fichado por el {career.currentTeam?.name}!</h2>
          <p>Los aficionados están deseando verte jugar.</p>
          <button
            onClick={() => {
              setJustSigned(false);
              nextSeason();
            }}
          >
            Iniciar temporada
          </button>
        </div>
      )}
    </div>
  );
}

export default GameScreen;
