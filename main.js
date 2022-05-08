const {
  handleAddItem,
  checkFormValues,
  updateListItem,
  handleUndone,
  handlePopState,
} = require("./domController");
const { data } = require("./inventoryController");

const addItemForm = document.getElementById("add-item-form");
addItemForm.addEventListener("submit", async (e) => {
  await handleAddItem(e);
});
addItemForm.addEventListener("input", checkFormValues);

const undoBtn = document.getElementById("undo-btn");
undoBtn.addEventListener("click", handleUndone);

window.addEventListener("popstate", handlePopState);
const myStoredInventory = JSON.parse(localStorage.getItem("inventory"));
if (myStoredInventory) {
  data.inventory = myStoredInventory;
  updateListItem(data.inventory);
}
