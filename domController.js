const { addItem, data } = require("./inventoryController");

const updateListItem = (inventory) => {
  if (!inventory) return;

  localStorage.setItem("inventory", JSON.stringify(inventory));
  const inventoryList = window.document.getElementById("list_items");

  inventoryList.innerHTML = "";
  Object.entries(inventory).forEach(([itemName, quantity]) => {
    let listItem = window.document.createElement("li");
    listItem.innerHTML = `${itemName}, quantity: ${quantity}`;

    if (quantity < 5) {
      listItem.style.color = "red";
    }
    inventoryList.appendChild(listItem);
  });
  const inventoryContent = JSON.stringify(inventory);
  const paragraph = document.getElementById("inventory-update");
  if (Object.entries(inventory).length > 0) {
    paragraph.innerHTML = `the inventory has been updated - ${inventoryContent}`;
  } else {
    paragraph.innerHTML = "";
  }
};

const handleAddItem = (event) => {
  event.preventDefault();
  const { itemName, quantity } = event.target.elements;

  addItem(itemName.value, parseInt(quantity.value, 10));
  history.pushState({ inventory: { ...data.inventory } }, "");
  updateListItem(data.inventory);
};

const checkFormValues = () => {
  const validItems = ["cheesecake", "danish", "croissant"];
  const itemName = document.querySelector('input[name="itemName"]');
  const quantity = document.querySelector('input[name="quantity"');
  const button = document.querySelector('button[type="submit"]');

  const isItemNameValid = validItems.includes(itemName.value);
  const isItemEmpty = itemName.value === "";
  const isQuantityEmpty = quantity.value === "";
  const errorMsg = window.document.getElementById("error-msg");
  if (isItemEmpty) {
    errorMsg.innerHTML = ``;
  } else if (!isItemNameValid) {
    errorMsg.innerHTML = `${itemName.value} is not valid`;
  } else {
    errorMsg.innerHTML = `${itemName.value} is valid`;
  }

  if (!isItemNameValid || isItemEmpty || isQuantityEmpty) {
    button.disabled = true;
  } else {
    button.disabled = false;
  }
};

const handleUndone = () => {
  if (history.state === null) return;
  history.back();
};

const handlePopState = () => {
  data.inventory = history.state ? history.state.inventory : {};
  updateListItem(data.inventory);
};

module.exports = {
  updateListItem,
  handleAddItem,
  checkFormValues,
  handleUndone,
  handlePopState,
};
