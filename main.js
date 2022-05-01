const {
  handleAddItem,
  checkFormValues,
  updateListItem,
} = require("./domController");
const { data } = require("./inventoryController");

const addItemForm = document.getElementById("add-item-form");
addItemForm.addEventListener("submit", handleAddItem);
addItemForm.addEventListener("input", checkFormValues);

const myStoredInventory = JSON.parse(localStorage.getItem("inventory"));
if (myStoredInventory) {
  data.inventory = myStoredInventory;
  updateListItem(data.inventory);
}
