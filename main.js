const { handleAddItem, checkFormValues } = require("./domController");

const addItemForm = document.getElementById("add-item-form");
addItemForm.addEventListener("submit", handleAddItem);
addItemForm.addEventListener("input", checkFormValues);
