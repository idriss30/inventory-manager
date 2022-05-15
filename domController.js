const { addItem, data, API_ADDR } = require("./inventoryController");
const fetch = require("isomorphic-fetch");

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

const handleAddItem = async (event) => {
  event.preventDefault();
  const { itemName, quantity } = event.target.elements;
  let item = itemName.value;
  let qty = quantity.value;
  await addItem(itemName.value, parseInt(quantity.value, 10));

  history.pushState({ inventory: { ...data.inventory } }, "");
  data.lastAddedItem.push({ name: item, quantity: qty });
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

const handleUndone = async () => {
  if (history.state === null) return;
  const lastAdded = data.lastAddedItem[data.lastAddedItem.length - 1];
  if (lastAdded !== undefined) {
    const { name, quantity } = lastAdded;
    await deleteItem(name, quantity);
  }
  history.back();
};

const deleteItem = async (item, quantity) => {
  try {
    await fetch(`${API_ADDR}/inventory/${item}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
  } catch (error) {
    throw error;
  }
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
