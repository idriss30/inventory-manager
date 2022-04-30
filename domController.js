const updateListItem = (inventory) => {
  const inventoryList = window.document.getElementById("list_items");

  inventoryList.innerHTML = "";
  Object.entries(inventory).forEach(([itemName, quantity]) => {
    let listItem = window.document.createElement("li");
    listItem.innerHTML = `${itemName}, quantity: ${quantity}`;
    inventoryList.appendChild(listItem);
  });
  const inventoryContent = JSON.stringify(inventory);
  const paragraph = document.createElement("p");
  paragraph.innerHTML = `the inventory has been updated - ${inventoryContent}`;

  window.document.body.appendChild(paragraph);
};

module.exports = {
  updateListItem,
};
