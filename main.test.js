const fs = require("fs");
const { screen, getByText, fireEvent } = require("@testing-library/dom");
const {
  clearHistoryHook,
  removePopStateListeners,
} = require("./testUtilities");

const initialHtml = fs.readFileSync("./index.html");

beforeEach(() => {
  document.body.innerHTML = initialHtml;
  jest.resetModules(); // make jest not using cache version of main.js
  require("./main"); // attach event to the form everytime body changes
});

beforeEach(() => {
  localStorage.clear();
});
test("add item with form", () => {
  //replace input values with following
  screen.getByPlaceholderText("item name").value = "croissant";
  screen.getByPlaceholderText("item quantity").value = "2";

  const addItemForm = document.querySelector("#add-item-form");
  fireEvent.submit(addItemForm);
  const itemList = document.getElementById("list_items");
  expect(getByText(itemList, `croissant, quantity: 2`)).toBeInTheDocument();
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
  });
  test("checking localStorage persistence", () => {
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
    expect(
      getByText(listBefore, `cheesecake, quantity: 3`)
    ).toBeInTheDocument();

    expect(listBefore.childNodes).toHaveLength(1);

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

  test("undo to one item", (done) => {
    const itemName = screen.getByPlaceholderText("item name");
    const itemQty = screen.getByPlaceholderText("item quantity");
    const submitBtn = screen.getByText("Add item to inventory");
    const undobtn = screen.getByText("Undo");

    //insert croissant
    fireEvent.input(itemName, { target: { value: "croissant" } });
    fireEvent.input(itemQty, { target: { value: "3" } });

    fireEvent.click(submitBtn);

    // insert cheesecake
    fireEvent.input(itemName, { target: { value: "cheesecake" } });
    fireEvent.input(itemQty, { target: { value: "1" } });

    fireEvent.click(submitBtn);

    expect(history.state.inventory).toEqual({ croissant: 3, cheesecake: 1 });

    window.addEventListener("popstate", () => {
      const list = document.querySelector("#list_items");
      expect(history.state.inventory).toEqual({ croissant: 3 });
      expect(getByText(list, "croissant, quantity: 3")).toBeInTheDocument();

      done();
    });

    fireEvent.click(undobtn);
  });

  // this test should fail because of first one because the popstate listener in previous test
  // solution will be to remove the listener in the beforeEach hook
  test("checking undo to empty list", (done) => {
    let productName = screen.getByPlaceholderText("item name");
    fireEvent.input(productName, { target: { value: "croissant" } });

    let qtyName = screen.getByPlaceholderText("item quantity");
    fireEvent.input(qtyName, { target: { value: "5" } });

    const submitBtn = screen.getByText("Add item to inventory");
    fireEvent.click(submitBtn);

    const undoBtn = screen.getByText("Undo");

    expect(history.state.inventory).toEqual({ croissant: 5 });
    window.addEventListener("popstate", () => {
      expect(history.state).toBe(null);
      done();
    });

    fireEvent.click(undoBtn);
  });
});
