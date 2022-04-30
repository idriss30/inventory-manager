const { handleAddItem } = require("./domController");

const addItemForm = document.getElementById("add-item-form");
addItemForm.addEventListener("submit", handleAddItem);
