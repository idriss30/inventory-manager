const fs = require("fs");
const { screen, getByText } = require("@testing-library/dom");

let initialHtml = (window.document.body.innerHTML =
  fs.readFileSync("./index.html"));

const { updateListItem } = require("./domController");

describe("testing Dom functionnalities for updateList", () => {
  beforeEach(() => {
    window.document.body.innerHTML = initialHtml;
  });
  test("updateList dom function", () => {
    const inventory = {
      cheesecake: 1,
      danish: 2,
      chocolate_croissant: 5,
    };

    updateListItem(inventory);
    const unorderedList = document.querySelector("#list_items");
    expect(unorderedList.childNodes).toHaveLength(3);

    expect(
      getByText(
        unorderedList,
        `cheesecake, quantity: ${inventory.cheesecake}`,
        { selector: "li" } // tell dom-testing to only look in list items
      )
    ).toBeInTheDocument();

    expect(
      getByText(unorderedList, `danish, quantity: ${inventory.danish}`)
    ).toBeInTheDocument();

    expect(
      getByText(
        unorderedList,
        `chocolate_croissant, quantity: ${inventory.chocolate_croissant}`
      )
    ).toBeInTheDocument();
  });

  test("checking if paragraph is inserted", () => {
    const inventory = { cheesecake: 1, danish: 2 };
    updateListItem(inventory);

    expect(
      screen.getByText(
        `the inventory has been updated - ${JSON.stringify(inventory)}`
      )
    ).toBeInTheDocument();
  });
});
