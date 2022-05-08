const fs = require("fs");
const { screen, getByText } = require("@testing-library/dom");
const nock = require("nock");

let initialHtml = (window.document.body.innerHTML =
  fs.readFileSync("./index.html"));

const {
  updateListItem,
  handleUndone,
  handlePopState,
  handleAddItem,
  checkFormValues,
} = require("./domController");
const { data, API_ADDR } = require("./inventoryController");
const {
  clearHistoryHook,
  removePopStateListeners,
} = require("./testUtilities");

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
    clearHistoryHook(done);
  });

  //spy on the listener
  beforeEach(() => {
    jest.spyOn(window, "addEventListener");
  });
  // remove all events listeners added to window created after each test
  afterEach(() => {
    removePopStateListeners();
    if (!nock.isDone()) {
      nock.cleanAll();
      throw new Error("not all endpoints received request");
    }
  });

  test("handleUndone function", (done) => {
    window.addEventListener("popstate", () => {
      expect(history.state).toEqual(null);
      done();
    });
    history.pushState({ inventory: { cheesecake: 1 } }, "");
    handleUndone();
  });

  test("going back from initial state handleUndone", () => {
    const mockBackHistory = jest.spyOn(history, "back");
    handleUndone();
    expect(mockBackHistory).not.toHaveBeenCalled();
  });

  test("handlePopStateFunction with current state items", () => {
    const inventory = { cheesecake: 3, croissant: 5 };
    history.pushState({ inventory: { ...inventory } }, "");

    handlePopState();

    const listItems = document.getElementById("list_items");
    expect(getByText(listItems, "cheesecake, quantity: 3")).toBeInTheDocument();
    expect(getByText(listItems, "croissant, quantity: 5")).toBeInTheDocument();
    expect(listItems.childNodes).toHaveLength(2);
  });

  test("add items to the page handleAddItem", async () => {
    const submitEvent = {
      preventDefault: jest.fn(),
      target: {
        elements: {
          itemName: { value: "cheesecake" },
          quantity: { value: "2" },
        },
      },
    };
    nock(API_ADDR)
      .post(
        /inventory\/.*$/,
        JSON.stringify({ itemName: "cheesecake", quantity: 2 })
      )
      .reply(200);
    await handleAddItem(submitEvent);
    const list = document.querySelector("#list_items");

    expect(submitEvent.preventDefault.mock.calls).toHaveLength(1);

    expect(getByText(list, "cheesecake, quantity: 2"));
  });

  test("checking history through handleAddItem", async () => {
    const submitEvent = {
      preventDefault: jest.fn(),
      target: {
        elements: {
          itemName: { value: "cheesecake" },
          quantity: { value: "2" },
        },
      },
    };
    nock(API_ADDR)
      .post(/inventory\/.*$/)
      .reply(200);
    await handleAddItem(submitEvent);

    const getHistory = history.state.inventory;
    expect(getHistory).toEqual({ cheesecake: 2 });
  });
});

describe("check form values", () => {
  test("provide valid item name", () => {
    const itemName = screen.getByPlaceholderText("item name");
    itemName.value = "cheesecake";

    checkFormValues();
    const paragraphError = document.getElementById("error-msg");
    expect(getByText(paragraphError, `${itemName.value} is valid`));
  });

  test("provide invalid item name", () => {
    const itemName = screen.getByPlaceholderText("item name");
    itemName.value = "chocolate";
    checkFormValues();
    expect(
      getByText(
        document.getElementById("error-msg"),
        `${itemName.value} is not valid`
      )
    );
  });
});
