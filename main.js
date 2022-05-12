const {
  handleAddItem,
  checkFormValues,
  updateListItem,
  handleUndone,
  handlePopState,
} = require("./domController");
const { data, API_ADDR } = require("./inventoryController");

const addItemForm = document.getElementById("add-item-form");
addItemForm.addEventListener("submit", async (e) => {
  await handleAddItem(e);
});
addItemForm.addEventListener("input", checkFormValues);

const undoBtn = document.getElementById("undo-btn");
undoBtn.addEventListener("click", handleUndone);

window.addEventListener("popstate", handlePopState);

const loadData = async () => {
  try {
    const inventoryFetch = await fetch(`${API_ADDR}/inventory/`);
    if (inventoryFetch.status === 500) {
      throw new Error();
    }
    const inventoryResponse = await inventoryFetch.json();
    inventoryResponse.forEach((item) => {
      data.inventory[item.productName] = item.productQty;
    });

    return updateListItem(data.inventory);
  } catch (error) {
    const storedInventory = JSON.parse(localStorage.getItem("inventory"));
    if (storedInventory) {
      data.inventory = storedInventory;
      updateListItem(storedInventory);
    }
  }
};

module.exports = loadData();
