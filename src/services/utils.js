export const formatMoney = (amount) => {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(2) + "M €";
  } else if (amount >= 1000) {
    return Math.round(amount / 1000) + "K €";
  } else {
    return amount + " €";
  }
};
