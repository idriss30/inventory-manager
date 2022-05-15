const fs = require("fs");
const initialHtml = fs.readFileSync("./index.html");
const { screen, getByText } = require("@testing-library/dom");
const nock = require("nock");
const {
  updateListItem,
  handleAddItem,
  checkFormValues,
  handleUndone,

  handlePopState,
} = require("./domController");
const { data, API_ADDR } = require("./inventoryController");
const { clearHistoryHook } = require("./testUtilities");

beforeEach(() => {
  window.document.body.innerHTML = initialHtml;
});

beforeEach(() => {
  data.inventory = {};
  data.lastAddedItem = [];
});

describe("testing update list items", () => {
  test("update items with update ListFunction", () => {
    data.inventory = { cheesecake: 5, croissant: 2 };
    updateListItem(data.inventory);

    const list = document.getElementById("list_items");
    const paragraph = document.getElementById("inventory-update");
    const inventory = localStorage.getItem("inventory");
    expect(list.childNodes).toHaveLength(2);
    expect(getByText(list, `cheesecake, quantity: 5`)).toBeInTheDocument();
    expect(getByText(list, "croissant, quantity: 2")).toBeInTheDocument();
    expect(
      getByText(paragraph, `the inventory has been updated - ${inventory}`)
    ).toBeInTheDocument();
  });

  test("check red color when quantity inferior to 5", () => {
    data.inventory = { cheesecake: 2 };
    updateListItem(data.inventory);

    const redElements = screen.getByText("cheesecake, quantity: 2");
    expect(redElements).toHaveStyle({ color: "red" });
  });
});

describe("handle Add items function", () => {
  test("add items to inventory handleAddItems function", async () => {
    nock(API_ADDR).post("/inventory/danish").reply(201);
    const eventMock = {
      preventDefault: jest.fn(),
      target: {
        elements: {
          itemName: { value: "danish" },
          quantity: { value: 2 },
        },
      },
    };
    const list = document.getElementById("list_items");

    await handleAddItem(eventMock);
    expect(list.childNodes).toHaveLength(1);
    expect(eventMock.preventDefault.mock.calls).toHaveLength(1);
    expect(history.state.inventory).toEqual({ danish: 2 });
    expect(data.lastAddedItem[0]).toEqual({ name: "danish", quantity: 2 });
  });

  if (!nock.isDone()) {
    nock.cleanAll();
    throw new Error("inventory post interceptor was not reached");
  }
});

describe("checkFormValues function", () => {
  test("give valid product information button is activated", () => {
    screen.getByPlaceholderText("item name").value = "cheesecake";
    screen.getByPlaceholderText("item quantity").value = 2;

    checkFormValues();
    const button = screen.getByText("Add item to inventory");
    expect(screen.getByText("cheesecake is valid")).toBeInTheDocument();
    expect(button).not.toHaveAttribute("disabled");
  });
  test("give invalid information button is not activated", () => {
    screen.getByPlaceholderText("item name").value = "bread";
    screen.getByPlaceholderText("item quantity").value = 2;

    checkFormValues();
    const button = screen.getByText("Add item to inventory");
    expect(screen.getByText("bread is not valid")).toBeInTheDocument();
    expect(button).toHaveAttribute("disabled");
  });
});

describe("testing history implementation", () => {
  beforeEach((done) => {
    clearHistoryHook(done);
  });

  test("provide null history", async () => {
    const mockRes = jest.spyOn(history, "back");

    await handleUndone();
    expect(mockRes).not.toHaveBeenCalled();
  });

  test("test handleundone function", (done) => {
    nock(API_ADDR).delete("/inventory/cheesecake").reply(200);
    const lastItem = { cheesecake: 2 };
    history.pushState({ inventory: { ...lastItem } }, "");

    window.addEventListener("popstate", () => {
      expect(history.state).toBeNull();
      done();
    });

    const list = document.getElementById("list_items");
    data.lastAddedItem.push({ name: "cheesecake", quantity: 2 });
    //call handleUndone
    expect(list.childNodes).toHaveLength(0);
    handleUndone().then("fullfiled");
  });
});

describe("handlePostateFunction", () => {
  test("handle pop state with valid history", () => {
    history.pushState({ inventory: { cheesecake: 2, croissant: 5 } }, "");
    const listItems = document.getElementById("list_items");

    handlePopState();

    expect(listItems.childNodes).toHaveLength(2);
    expect(getByText(listItems, "cheesecake, quantity: 2")).toBeInTheDocument();
    expect(getByText(listItems, "croissant, quantity: 5")).toBeInTheDocument();
  });
});
