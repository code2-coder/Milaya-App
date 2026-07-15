/**
 * Formats a given price into Indian Rupee (INR) string representation.
 * @param {number} price Base price
 * @returns {string} Formatted price string (e.g. ₹1,500.00)
 */
export const formatPrice = (price) => {
  const numPrice = Number(price);
  if (isNaN(numPrice)) return "₹0.00";
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numPrice);
};
