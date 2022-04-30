const { addItem, data } = require("./inventoryController");
const { updateListItem } = require("./domController");

addItem("cheesecake", 3);
addItem("croissant", 2);
addItem("danish", 4);

updateListItem(data.inventory);
