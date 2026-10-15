import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  acceptOffer,
  choose,
  getCareer,
  getOffers,
  nextTurn,
  simulateSeason,
  saveRankings,
  getItems,
  buyItem,
  getPhase,
  sendOption,
  getRenewal,
  getRoundCup,
  sendCupResult,
} from "../services/api";
import { formatMoney } from "../services/utils";
import { useNavigate } from "react-router-dom";
import PenaltyGame from "../components/PenaltyGame";
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
  const [showShop, setShowShop] = useState(false); // Mostrar tienda
  const [shopItems, setShopItems] = useState([]); // Item que compramos
  const [showPreseason, setShowPreseason] = useState(false);
  const [preseasonPhases, setPreseasonPhases] = useState([]);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [error, setError] = useState(null);
  const [renewalOffer, setRenewalOffer] = useState(null);
  const [infoCup, setInfoCup] = useState(null);
  const [isCup, setIsCup] = useState(false);

  const navigate = useNavigate();

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
    try {
      setError(null);
      const result = await choose(id, eventId, optionId); // id del useParams corresp a careerId
      setOutcomeText(result); // guarda el texto resultado
      setNextEvent(() => nextEvent + 1); // mostramos sigueinte evento de la lista

      // Como recibimos nuevos stats segun la decision tomada..actualizamos
      const updateStats = await getCareer(id);
      setCareer(updateStats);
    } catch (err) {
      console.error(err);
      setError("Error al procesar la elección");
    }
  };

  const handleEndSeason = async () => {
    try {
      setError(null);

      setOutcomeText(null);
      setNextEvent(0);
      setEvents([]); // limpia los eventos

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
    } catch (err) {
      console.error(err);
      setError("Error al cargar final de temporada");
    }
  };

  const nextSeason = async () => {
    try {
      setError(null);

      setSeasonResult(null);
      setOutcomeText(null);
      setNextEvent(0);
      const newEvents = await nextTurn(id);
      setEvents(newEvents);

      const updateCareer = await getCareer(id);
      setCareer(updateCareer);
    } catch (err) {
      console.error(err);
      setError("Error al iniciar temporada");
    }
  };

  const handleAcceptOffer = async (offer) => {
    try {
      setError(null);

      setOutcomeText(null);
      setEvents([]);

      await acceptOffer(id, offer); // no necesitamos guardar lo que vuelve porque se actualiza solo en career
      setOffers([]);
      setRenewalOffer(null);

      // Actualizamos career
      const updateCareer = await getCareer(id);
      setCareer(updateCareer);

      setJustSigned(true); // recien fichado accede a pantalla de celebracion
    } catch (err) {
      console.error(err);
      setError("Error al aceptar la oferta");
    }
  };

  // Mostrar tienda
  const handleOpenPreseason = async () => {
    try {
      setError(null);

      setOutcomeText(null);
      setEvents([]);
      setSeasonResult(null);
      setOffers([]);
      setJustSigned(false);
      setShowShop(false);

      const phases = await getPhase(id);
      setShowPreseason(true);
      setPreseasonPhases(phases);
      setCurrentPhase(0);
    } catch (err) {
      console.error(err);
      setError("Error al cargar fases de pretemporada");
    }
  };

  // Elegir opcion

  const handlePreseasonChoice = async (phaseId, optionId) => {
    try {
      setError(null);

      await sendOption(id, phaseId, optionId);

      const updateCareer = await getCareer(id);
      setCareer(updateCareer);

      if (currentPhase < 2) {
        setCurrentPhase(currentPhase + 1);
      } else {
        handleOpenShop();
      }
    } catch (err) {
      console.error(err);
      setError("Error al enviar la opcion elegida");
    }
  };

  const handleOpenShop = async () => {
    try {
      setError(null);

      setShowPreseason(false);
      const items = await getItems(id);
      setShopItems(items);
      setShowShop(true);
    } catch (err) {
      console.error(err);
      setError("Error al mostrar tienda");
    }
  };

  // Ocultar tienda
  const handleCloseShop = async () => {
    try {
      setError(null);
      setShowShop(false);
      nextSeason();
    } catch (err) {
      console.error(err);
      setError("Error al cerrar tienda");
    }
  };

  // Item comprados
  const handleBuyItem = async (itemId) => {
    try {
      setError(null);
      await buyItem(id, itemId); // no necesito asignarle const porque no se va a usar

      // ACTRUALIZAMOS CAREER
      const myCareer = await getCareer(id);
      setCareer(myCareer);

      // Actualizamos items
      const updatedItems = await getItems(id);
      setShopItems(updatedItems);
    } catch (err) {
      console.error(err);
      setError("Error comnprar item");
    }
  };

  // VER OFERTAS
  const handleShowOffers = async () => {
    try {
      setError(null);
      setOutcomeText(null);
      setEvents([]);
      setSeasonResult(null);

      const myOffers = await getOffers(id);
      setOffers(myOffers);
    } catch (err) {
      console.error(err);
      setError("Error mostrar ofertas disponibles");
    }
  };

  // OPCIÓN DE RETIRADA
  const handleRetire = async () => {
    try {
      setError(null);
      await saveRankings(id);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Error al intentar retirar al jugador");
    }
  };

  // VER OFERTRAS RENOVACIÓN
  const handleOnRenewal = async () => {
    try {
      setError(null);
      setOutcomeText(null);
      setEvents([]);
      setSeasonResult(null);

      const myRenewal = await getRenewal(id);
      setRenewalOffer(myRenewal);
    } catch (err) {
      console.error(err);
      setError("Error al obtener la oferta de renovación");
    }
  };

  // INICIO COPA

  const handleStartCup = async () => {
    try {
      setError(null);
      setOutcomeText(null);

      const dataCup = await getRoundCup(id);

      if (dataCup !== null) {
        setInfoCup(dataCup);
        setIsCup(true);
      }
    } catch (err) {
      console.error(err);
      setError("No se ha podido cargar la Copa");
    }
  };

  // RESULTADO COPA

  const handleCupResult = async (won) => {
    try {
      await sendCupResult(id, won);
      const dataCup = await getRoundCup(id);

      if (dataCup !== null) {
        setInfoCup(dataCup);
      } else {
        setIsCup(false);
        setInfoCup(null);
      }
    } catch (err) {
      console.error(err);
      setError("No se ha podido cargar el resultado de ronda de Copa");
    }
  };

  return (
    <div>
      <button
        className="btn-secondary back-button"
        onClick={() => navigate("/")}
      >
        Volver a inicio
      </button>
      <h1 className="career-title">Carrera de {career.playerName}</h1>
      <div className="player-card">
        {error && (
          <div className="outcome-card">
            <p style={{ color: "red" }}>{error}</p>
            <button onClick={() => setError(null)}>Cerrar</button>
          </div>
        )}
        <div className="player-info">
          <p className="player-name">{career.playerName}</p>
          <p>
            <span className="info-card">Posición: </span>
            {career.position?.name}
          </p>
          <p>
            <span className="info-card">Edad: </span>
            {career.currentAge}
          </p>
          <p>
            <span className="info-card">Nacionalidad: </span>
            {career.nationality}
          </p>
          <p>
            <span className="info-card">Equipo actual: </span>
            {career.currentTeam?.name || "Sin equipo"}
          </p>
          <p>
            <span className="info-card">Rol actual: </span>
            {career.currentRole || "Sin rol definido"}
          </p>
          <p>
            <span className="info-card">Contrato: </span>
            {career.contractYearsLeft < 1
              ? "Sin equipo"
              : `${career.contractYearsLeft}
            ${career.contractYearsLeft === 1 ? "año" : "años"}`}
          </p>
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
        <div className="stats-grid-two" style={{ marginTop: "12px" }}>
          <div className="stat-item">
            <span className="stat-label">Reputación</span>
            <span className="stat-value">{career.reputation}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Dinero</span>
            <span className="stat-value">{formatMoney(career.savings)}</span>
          </div>
        </div>
      </div>

      {currentEvent && !outcomeText && !isCup && (
        <div className="event-card">
          <p className="event-title">{currentEvent.title}</p>
          <p className="event-description">{currentEvent.description}</p>
          {currentEvent.minigame ? (
            <PenaltyGame
              onResult={(result) => {
                const option = currentEvent.options.find((opt) =>
                  opt.text.toLowerCase().includes(result),
                );
                handleChoose(career.id, currentEvent.id, option.id);
              }}
            />
          ) : (
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
          )}
        </div>
      )}

      {outcomeText && nextEvent < events.length && (
        <div className="outcome-card">
          <p className="outcome-text">{outcomeText}</p>
          <button
            onClick={() =>
              nextEvent === 3 ? handleStartCup() : setOutcomeText(null)
            }
          >
            Continuar
          </button>
        </div>
      )}

      {isCup && (
        <div>
          <p>Ronda: {infoCup.roundName}</p>
          <p>Rival: {infoCup.rivalName}</p>
          <PenaltyGame
            onResult={(rdo) => {
              if (rdo === "gol") {
                handleCupResult(true);
              } else {
                handleCupResult(false);
              }
            }}
          />
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
          <h3
            style={{
              color: "#fffff",
              marginTop: "16px",
              marginBottom: "4px",
            }}
          >
            💰 Economía
          </h3>
          <div className="season-stats">
            <div className="season-stat economy-income">
              <span className="stat-label">Salario bruto</span>
              <span className="stat-value">
                {formatMoney(seasonResult.salaryGross)}
              </span>
            </div>
            <div className="season-stat economy-expense">
              <span className="stat-label">Impuestos</span>
              <span className="stat-value">
                -{formatMoney(seasonResult.taxesPaid)}
              </span>
            </div>
            <div className="season-stat economy-expense">
              <span className="stat-label">Alquiler</span>
              <span className="stat-value">
                -{formatMoney(seasonResult.rentPaid)}
              </span>
            </div>
            <div className="season-stat economy-expense">
              <span className="stat-label">Estilo de vida</span>
              <span className="stat-value">
                -{formatMoney(seasonResult.lifestylePaid)}
              </span>
            </div>
            <div className="season-stat economy-expense">
              <span className="stat-label">Agente</span>
              <span className="stat-value">
                -{formatMoney(seasonResult.agentPaid)}
              </span>
            </div>
            <div className="season-stat economy-income">
              <span className="stat-label">Salario neto</span>
              <span className="stat-value">
                {formatMoney(seasonResult.salaryNet)}
              </span>
            </div>
          </div>
          {career.contractYearsLeft > 1 && (
            <button onClick={handleOpenPreseason}>
              Seguir en el {career.currentTeam?.name}
            </button>
          )}
          <button className="btn-secondary" onClick={handleShowOffers}>
            Ver ofertas del mercado
          </button>
          {career.currentAge >= 32 && (
            <button className="btn-danger" onClick={handleRetire}>
              Retirarse
            </button>
          )}
          {career.contractYearsLeft === 1 && (
            <button onClick={() => handleOnRenewal()}>
              Ver oferta de renovación
            </button>
          )}
        </div>
      )}
      {renewalOffer && (
        <div>
          <div className="offer-card" key={renewalOffer.teamId}>
            <div className="offer-info">
              <p className="offer-team">{renewalOffer.teamName}</p>
              <p className="offer-details">
                {renewalOffer.leagueName} · {renewalOffer.role} ·{" "}
                {renewalOffer.contractYears}{" "}
                {renewalOffer.contractYears === 1 ? "año" : "años"}
              </p>
            </div>
            <span className="offer-salary">
              {formatMoney(renewalOffer.offeredSalary)}
            </span>
            <button onClick={() => handleAcceptOffer(renewalOffer)}>
              Renovar
            </button>
            <button
              onClick={() => {
                setRenewalOffer(null);
                handleShowOffers();
              }}
            >
              Rechazar y ver ofertas
            </button>
          </div>
        </div>
      )}

      {offers.length > 0 && (
        <div>
          {offers.map((o, index) => (
            <div className="offer-card" key={o.teamId || index}>
              <div className="offer-info">
                <p className="offer-team">{o.teamName}</p>
                <p className="offer-details">
                  {o.leagueName} · {o.role} · {o.contractYears}{" "}
                  {o.contractYears === 1 ? "año" : "años"}
                </p>
              </div>
              <span className="offer-salary">
                {formatMoney(o.offeredSalary)}
              </span>
              <button onClick={() => handleAcceptOffer(o)}>Fichar</button>
            </div>
          ))}
          {career.contractYearsLeft > 1 && (
            <button
              className="btn-secondary"
              onClick={() => {
                // nextSeason();
                handleOpenPreseason();
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
              // nextSeason();
              handleOpenPreseason();
            }}
          >
            Iniciar temporada
          </button>
        </div>
      )}
      {showPreseason && preseasonPhases[currentPhase] && (
        <div className="event-card">
          <p className="event-title">{preseasonPhases[currentPhase].title}</p>
          <p
            style={{
              color: "var(--text-secondary)",
              textAlign: "center",
              marginBottom: "16px",
            }}
          >
            Fase {currentPhase + 1} de 3
          </p>
          <p className="event-description">
            {preseasonPhases[currentPhase].description}
          </p>
          <div className="event-options">
            {preseasonPhases[currentPhase].options.map((op) => (
              <button
                key={op.id}
                className="option-btn"
                onClick={() =>
                  handlePreseasonChoice(preseasonPhases[currentPhase].id, op.id)
                }
              >
                {op.text}
                <span
                  style={{
                    color: "var(--accent)",
                    fontSize: "0.85rem",
                    display: "block",
                    marginTop: "4px",
                  }}
                >
                  {op.effect}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      {showShop && (
        <div className="shop-container">
          <h2>Equipo Personal</h2>
          <p className="shop-budget">
            Presupuesto disponible: <span>{formatMoney(career.savings)}</span>
          </p>
          <div className="shop-grid">
            {shopItems.map((item) => (
              <div
                key={item.id}
                className={`shop-item ${item.active ? "owned" : ""}`}
              >
                <span className="shop-item-name">{item.name}</span>
                <span className="shop-item-desc">{item.description}</span>
                <span className="shop-item-price">
                  {formatMoney(item.price)}
                </span>
                {item.active ? (
                  <button className="btn-owned">Contratado</button>
                ) : career.savings < item.price ? (
                  <button disabled>No tienes suficiente dinero</button>
                ) : (
                  <button onClick={() => handleBuyItem(item.id)}>
                    Adquirir
                  </button>
                )}
              </div>
            ))}
          </div>
          <button onClick={handleCloseShop} className="btn-start-season">
            Iniciar temporada
          </button>
        </div>
      )}
    </div>
  );
}

export default GameScreen;
