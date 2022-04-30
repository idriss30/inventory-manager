const fs = require("fs");
const { getByText } = require("@testing-library/dom");

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
      getByText(unorderedList, `cheesecake, quantity: ${inventory.cheesecake}`)
    ).toBeTruthy();

    expect(getByText(unorderedList, `danish, quantity: ${inventory.danish}`));

    expect(
      getByText(
        unorderedList,
        `chocolate_croissant, quantity: ${inventory.chocolate_croissant}`
      )
    );
  });
});
