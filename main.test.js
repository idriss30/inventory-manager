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

beforeEach(() => {
  document.body.innerHTML = initialHtml;
  jest.resetModules(); // make jest not using cache version of main.js
  require("./main"); // attach event to the form everytime body changes
});

beforeEach(() => {
  localStorage.clear();
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
  beforeEach((done) => {
    clearHistoryHook(done);
    jest.spyOn(window, "addEventListener");
  });

  afterEach(() => {
    removePopStateListeners();
    if (!nock.isDone()) {
      nock.cleanAll();
      throw new Error("some endpoints where not reached");
    }
  });
  test("checking localStorage persistence", async () => {
    nock(API_ADDR)
      .post(/inventory\/.*$/)
      .reply(200);

    const nameField = screen.getByPlaceholderText("item name");
    fireEvent.input(nameField, {
      target: { value: "cheesecake" },
      bubbles: true,
    });

    const qtyField = screen.getByPlaceholderText("item quantity");
    fireEvent.input(qtyField, { target: { value: "3" }, bubbles: true });

    const btnSubmit = screen.getByText("Add item to inventory");
    fireEvent.click(btnSubmit);

    const listBefore = document.querySelector("#list_items");

    await waitFor(() => {
      expect(
        getByText(listBefore, `cheesecake, quantity: 3`)
      ).toBeInTheDocument();
      expect(listBefore.childNodes).toHaveLength(1);
    });

    // equivalent to reload the page;
    window.document.body.innerHTML = initialHtml;
    jest.resetModules();
    require("./main.js"); // run main js again

    const listAfterReload = document.getElementById("list_items");

    expect(
      getByText(listAfterReload, `cheesecake, quantity: 3`)
    ).toBeInTheDocument();

    expect(listAfterReload.childNodes).toHaveLength(1);
  });

  test("undo to one item", async () => {
    const itemName = screen.getByPlaceholderText("item name");
    const itemQty = screen.getByPlaceholderText("item quantity");
    const submitBtn = screen.getByText("Add item to inventory");
    const undobtn = screen.getByText("Undo");
    const listItems = document.getElementById("list_items");

    //insert croissant
    fireEvent.input(itemName, { target: { value: "croissant" } });
    fireEvent.input(itemQty, { target: { value: "3" } });

    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(listItems.childNodes).toHaveLength(1);
      expect(getByText(listItems, "croissant, quantity: 3"));
    });

    // insert cheesecake
    fireEvent.input(itemName, { target: { value: "cheesecake" } });
    fireEvent.input(itemQty, { target: { value: "1" } });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(history.state.inventory).toEqual({ croissant: 3, cheesecake: 1 });
    });

    window.addEventListener("popstate", () => {
      const list = document.querySelector("#list_items");
      expect(history.state.inventory).toEqual({ croissant: 3 });
      expect(getByText(list, "croissant, quantity: 3")).toBeInTheDocument();

      return;
    });

    fireEvent.click(undobtn);
  });

  // this test should fail because of first one because the popstate listener in previous test
  // solution will be to remove the listener in the beforeEach hook
  test("checking undo to empty list", async () => {
    let productName = screen.getByPlaceholderText("item name");
    fireEvent.input(productName, { target: { value: "croissant" } });

    let qtyName = screen.getByPlaceholderText("item quantity");
    fireEvent.input(qtyName, { target: { value: "5" } });

    const submitBtn = screen.getByText("Add item to inventory");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(history.state.inventory).toEqual({ croissant: 5 });
    });

    const undoBtn = screen.getByText("Undo");
    window.addEventListener("popstate", () => {
      expect(history.state).toBe(null);
      return;
    });

    fireEvent.click(undoBtn);
  });
});
