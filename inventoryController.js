const data = {
  inventory: {},
  lastAddedItem: [],
};

const API_ADDR = "http://localhost:3000";
const addItem = async (itemName, quantity) => {
  const currentQty = data.inventory[itemName] || 0;
  data.inventory[itemName] = quantity + currentQty;
  try {
    await fetch(`${API_ADDR}/inventory/${itemName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemName, quantity }),
    });
  } catch (error) {
    return error;
  }

  return data.inventory;
};

module.exports = {
  addItem,
  data,
  API_ADDR,
};
