// PARA LAS LLAMADAS AL BACKEND
const API_URL = "http://localhost:8080/api";

// POST /api/careers -> crear carrera
export const createCareer = async (playerName, positionId, nationality) => {
  const response = await fetch(`${API_URL}/careers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerName, positionId, nationality }),
  });
  return response.json();
};

// GET /api/game/next-turn/{id} -> siguiente turno
export const nextTurn = async (careerId) => {
  const response = await fetch(`${API_URL}/game/next-turn/${careerId}`);
  return response.json();
};

// GET - Leer la carrera
export const getCareer = async (careerId) => {
  const response = await fetch(`${API_URL}/careers/${careerId}`);
  return response.json();
};

// POST /api/game/choose -> elegir opción
export const choose = async (careerId, eventId, optionId) => {
  const response = await fetch(`${API_URL}/game/choose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ careerId, eventId, optionId }),
  });
  return response.text(); // devuelve el outcomeText que es un string
};

// POST /api/game/simulate/{id} -> simular temporada
export const simulateSeason = async (careerId) => {
  const response = await fetch(`${API_URL}/game/simulate/${careerId}`, {
    method: "POST",
  });
  return response.json();
};

// GET /api/game/offers/{id} -> ver ofertas
export const getOffers = async (careerId) => {
  const response = await fetch(`${API_URL}/game/offers/${careerId}`);
  return response.json();
};

// POST /api/game/accept-offer/{id} -> aceptar oferta
export const acceptOffer = async (careerId, offer) => {
  const response = await fetch(`${API_URL}/game/accept-offer/${careerId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(offer),
  });
  return response.json();
};

// GET /api/rankings -> ver rankings
export const topRankings = async () => {
  const response = await fetch(`${API_URL}/rankings`);
  return response.json();
};

// POST /api/rankings/{id} -> guardar en ranking
export const saveRankings = async (careerId) => {
  const response = await fetch(`${API_URL}/rankings/${careerId}`, {
    method: "POST",
  });
  return response.json();
};

// GET /api/game/shop/id -> tienda de items
export const getItems = async (careerId) => {
  const response = await fetch(`${API_URL}/game/shop/${careerId}`);
  return response.json();
};

// POST /api/game/shop/careerId/buy/itemid
export const buyItem = async (careerId, itemid) => {
  const response = await fetch(
    `${API_URL}/game/shop/${careerId}/buy/${itemid}`,
    {
      method: "POST",
    },
  );
  return response.json();
};

// GET - FASE PRESEASON
export const getPhase = async (careerId) => {
  const response = await fetch(`${API_URL}/game/preseason/${careerId}`);
  return response.json();
};

// POST - ENVIAR OPCION ELEGIDA
export const sendOption = async (careerId, phaseId, optionId) => {
  const response = await fetch(
    `${API_URL}/game/preseason/${careerId}/${phaseId}/${optionId}`,
    {
      method: "POST",
    },
  );
  return response.json();
};
