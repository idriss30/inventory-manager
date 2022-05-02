const fs = require("fs");
const { screen, getByText } = require("@testing-library/dom");

let initialHtml = (window.document.body.innerHTML =
  fs.readFileSync("./index.html"));

const { updateListItem, handleUndone } = require("./domController");
const { data } = require("./inventoryController");

beforeEach(() => (data.inventory = {}));

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

  test("highlight in red if < 5", () => {
    const inventory = { croissant: 4 };
    updateListItem(inventory);
    const listToCheck = document.getElementById("list_items");

    expect(
      getByText(listToCheck, `croissant, quantity: ${inventory.croissant}`)
    ).toHaveStyle("color:red");
  });
});

describe("testing updateListItems", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("testing localStorage features", () => {
    const inventoryMock = {
      croissant: 2,
      danish: 3,
      coffee_roll: 2,
    };
    updateListItem(inventoryMock);
    const localInventory = JSON.parse(localStorage.getItem("inventory"));
    expect(localInventory).toEqual(inventoryMock);
  });
});

describe("history items test", () => {
  //clear the history before each test
  beforeEach((done) => {
    const clearHistory = () => {
      if (history.state === null) {
        window.removeEventListener("popstate", clearHistory);
        return done();
      }

      history.back();
    };

    window.addEventListener("popstate", clearHistory);

    clearHistory();
  });

  //spy on the listener
  beforeEach(() => {
    jest.spyOn(window, "addEventListener");
  });
  // remove all events listeners added to window created after each test
  afterEach(() => {
    const popstateListeners = window.addEventListener.mock.calls.filter(
      ([eventName]) => eventName === "popstate"
    );

    popstateListeners.forEach(([eventName, handlerFn]) => {
      window.removeEventListener(eventName, handlerFn);
    });
    jest.restoreAllMocks();
  });

  test("handleUndone function", (done) => {
    window.addEventListener("popstate", () => {
      expect(history.state).toEqual(null);
      done();
    });
    history.pushState({ inventory: { cheesecake: 1 } }, "");
    handleUndone();
  });

  test("going back from initial state", () => {
    const mockBackHistory = jest.spyOn(history, "back");
    handleUndone();
    expect(mockBackHistory).not.toHaveBeenCalled();
  });
});
