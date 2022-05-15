const fs = require("fs");
const {
  screen,
  getByText,
  fireEvent,
  waitFor,
} = require("@testing-library/dom");
const {
  clearHistoryHook,
  removePopStateListeners,
} = require("./testUtilities");
const nock = require("nock");
const { API_ADDR } = require("./inventoryController");

const initialHtml = fs.readFileSync("./index.html");

beforeEach(async () => {
  document.body.innerHTML = initialHtml;
  jest.resetModules(); // make jest not using cache version of main.js
  await require("./main"); // attach event to the form everytime body changes
  jest.spyOn(window, "addEventListener");
});

beforeEach((done) => {
  localStorage.clear();
  clearHistoryHook(done);
});

test("add item with form", async () => {
  nock(API_ADDR)
    .post(
      /inventory\/.*$/,
      JSON.stringify({ itemName: "croissant", quantity: 2 })
    )
    .reply(200);
  //replace input values with following
  screen.getByPlaceholderText("item name").value = "croissant";
  screen.getByPlaceholderText("item quantity").value = "2";

  const addItemForm = document.querySelector("#add-item-form");

  fireEvent.submit(addItemForm);
  const listItems = document.getElementById("list_items");

  await waitFor(() => {
    expect(getByText(listItems, "croissant, quantity: 2"));
    expect(listItems.childNodes).toHaveLength(1);
  });

  if (!nock.isDone()) {
    throw new Error("inventory post itemname was not reached");
  }
});

describe("handle Add items function", () => {
  test("entering available items", () => {
    const inputField = screen.getByPlaceholderText("item name");
    inputField.value = "cheesecake";
    fireEvent.input(inputField, { bubbles: true });

    expect(screen.getByText("cheesecake is valid")).toBeInTheDocument();
  });

  test("entering invalid item", () => {
    const input = screen.getByPlaceholderText("item name");
    fireEvent.input(input, { target: { value: "chocolate" }, bubbles: true });
    expect(screen.getByText("chocolate is not valid")).toBeInTheDocument();
  });
});

describe("sessions persistence", () => {
  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll();
      throw new Error("some endpoints were not reached");
    }
  });
  afterEach(() => {
    localStorage.clear();
    removePopStateListeners();
  });

  test("checking localStorage persistence no server error loadData", async () => {
    nock(API_ADDR)
      .get("/inventory/")
      .reply(200, [{ productName: "cheesecake", productQty: 2 }]);

    jest.resetModules();
    await require("./main");

    const checkLocalStorage = JSON.parse(localStorage.getItem("inventory"));

    const listItems = document.getElementById("list_items");
    await waitFor(() => {
      expect(listItems.childNodes).toHaveLength(1);
      expect(
        getByText(listItems, "cheesecake, quantity: 2")
      ).toBeInTheDocument();
    });

    expect(checkLocalStorage).toEqual({ cheesecake: 2 });
  });

  test("checking localStorage persistence load Data from localStorage (server error)", async () => {
    localStorage.setItem("inventory", JSON.stringify({ croissant: 2 }));
    nock(API_ADDR).get("/inventory/").replyWithError(500);

    jest.resetModules();
    await require("./main");

    const listItems = document.getElementById("list_items");
    await waitFor(() => {
      expect(
        getByText(listItems, "croissant, quantity: 2")
      ).toBeInTheDocument();
    });
  });

  test("check undo to empty list", async () => {
    nock(API_ADDR)
      .post(/inventory\/.*$/)
      .reply(201);

    nock(API_ADDR)
      .delete(/inventory\/.*$/)
      .reply(201);

    const itemName = screen.getByPlaceholderText("item name");
    const itemQty = screen.getByPlaceholderText("item quantity");
    const submitBtn = screen.getByText("Add item to inventory");

    fireEvent.input(itemName, {
      target: { value: "cheesecake" },
      bubbles: true,
    });
    fireEvent.input(itemQty, { target: { value: "10" }, bubbles: true });
    fireEvent.click(submitBtn);
    const listItems = document.getElementById("list_items");
    await waitFor(() => {
      expect(history.state.inventory).toEqual({ cheesecake: 10 });
      expect(listItems.childNodes).toHaveLength(1);
    });

    const undoBtn = screen.getByText("Undo");

    window.addEventListener("popstate", () => {
      expect(history.state).toEqual(null);
    });

    fireEvent.click(undoBtn);

    await waitFor(() => {
      expect(listItems.childNodes).toHaveLength(0);
    });
  });

  test("undo to one item with history", async () => {
    nock(API_ADDR)
      .post(/inventory\/.*$/)
      .reply(201);

    nock(API_ADDR)
      .delete(/inventory\/.*$/)
      .reply(201);

    const prodName = screen.getByPlaceholderText("item name");
    const prodQty = screen.getByPlaceholderText("item quantity");
    const undoBtn = screen.getByText("Undo");
    const submitBtn = screen.getByText("Add item to inventory");

    fireEvent.input(prodName, {
      target: { value: "croissant" },
      bubbles: true,
    });
    fireEvent.input(prodQty, { target: { value: "2" }, bubbles: true });

    fireEvent.click(submitBtn);

    const listItems = document.getElementById("list_items");

    await waitFor(() => {
      expect(history.state.inventory).toEqual({ croissant: 2 });
      expect(
        getByText(listItems, "croissant, quantity: 2")
      ).toBeInTheDocument();
    });

    //adding second item
    fireEvent.input(prodName, { target: { value: "danish" }, bubbles: true });
    fireEvent.input(prodQty, { target: { value: "1" }, bubbles: true });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(history.state.inventory).toEqual({ croissant: 2, danish: 1 });
      expect(listItems.childNodes).toHaveLength(2);
    });
    window.addEventListener("popstate", () => {
      expect(history.state.inventory).toEqual({ croissant: 2 });
    });
    fireEvent.click(undoBtn);
    await waitFor(() => {
      expect(listItems.childNodes).toHaveLength(1);
    });
  });
});
