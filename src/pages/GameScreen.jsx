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
      <h1>Pantalla de juego - Carrera de {career.playerName}</h1>
      <div className="player_card">
        <div>
          <p>{career.playerName}</p>
          <p>{career.position?.name}</p>
          <p>{career.nationality}</p>
          <p>{career.currentTeam?.name || "Sin equipo"}</p>
          <p>{career.currentRole || "Sin rol definido"}</p>
          <p>{career.currentAge}</p>
        </div>
        <div>
          <div>
            <h3>Stats iniciales</h3>
          </div>
          <p>Definición: {career.finishing}</p>
          <p>Velocidad: {career.speed}</p>
          <p>Técnica: {career.technique}</p>
          <p>Visión: {career.vision}</p>
          <p>Forma física: {career.physical}</p>
          <p>Mentalidad: {career.mental}</p>
        </div>
        <p>Reputación: {career.reputation}</p>
        <p>Dinero: {career.savings}</p>
      </div>
      <div>
        {currentEvent && !outcomeText && (
          <div>
            <p>{currentEvent.title}</p>
            <p>{currentEvent.description}</p>
            {currentEvent.options.map((eventOpt) => (
              <div key={eventOpt.id}>
                <p>{eventOpt.text}</p>
                <button
                  onClick={() =>
                    handleChoose(career.id, currentEvent.id, eventOpt.id)
                  }
                >
                  Elegir
                </button>
              </div>
            ))}
          </div>
        )}
        {outcomeText && nextEvent < events.length && (
          <div>
            <p>{outcomeText}</p>
            <button onClick={() => setOutcomeText(null)}>Continuar</button>
          </div>
        )}
        {outcomeText && nextEvent >= events.length && (
          <div>
            <p>{outcomeText}</p>
            <button onClick={handleEndSeason}>Finalizar temporada</button>
          </div>
        )}
      </div>
      <div>
        {seasonResult && (
          <div>
            <p>Goles: {seasonResult.goals}</p>
            <p>Asistencias: {seasonResult.assists}</p>
            <p>Equipo actual:{seasonResult.team?.name}</p>
            <p>Posición de equipo en Liga: {seasonResult.leaguePosition}</p>
            <p>Titulos ganados: {seasonResult.titlesWon}</p>
            <p>Valoración: {seasonResult.seasonRating}</p>
            <p>Temporada nº: {seasonResult.seasonNumber}</p>
            {career.contractYearsLeft > 1 && (
              <button onClick={nextSeason}>
                Seguir en el {career.currentTeam?.name}
              </button>
            )}
            <button onClick={handleShowOffers}>Ver ofertas del mercado</button>
          </div>
        )}
      </div>
      {offers.length > 0 &&
        offers.map((o, index) => (
          <div key={o.teamId || index}>
            <p>Equipo: {o.teamName}</p>
            <p>Liga: {o.leagueName}</p>
            <p>Salario: {o.offeredSalary}</p>
            <p>Estatus: {o.role}</p>
            <p>Años de contrato: {o.contractYears}</p>
            <button onClick={() => handleAcceptOffer(o)}>Aceptar oferta</button>
          </div>
        ))}

      {justSigned && (
        <div>
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
