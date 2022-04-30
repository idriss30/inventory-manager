const data = { inventory: {} };

const addItem = (itemName, quantity) => {
  const currentQty = data.inventory[itemName] || 0;
  data.inventory[itemName] = quantity + currentQty;
};

module.exports = {
  addItem,
  data,
};
