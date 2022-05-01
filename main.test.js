const fs = require("fs");
const { screen, getByText, fireEvent } = require("@testing-library/dom");

const initialHtml = fs.readFileSync("./index.html");

beforeEach(() => {
  document.body.innerHTML = initialHtml;
  jest.resetModules(); // make jest not using cache version of main.js
  require("./main"); // attach event to the form everytime body changes
});

beforeEach(() => {
  localStorage.clear();
});

describe("testing form", () => {
  test("add item with form", () => {
    //replace input values with following
    screen.getByPlaceholderText("item name").value = "croissant";
    screen.getByPlaceholderText("item quantity").value = "2";

    const addItemForm = document.querySelector("#add-item-form");
    fireEvent.submit(addItemForm);
    const itemList = document.getElementById("list_items");
    expect(getByText(itemList, `croissant, quantity: 2`)).toBeInTheDocument();
  });
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
  beforeEach(() => {
    localStorage.clear();
  });
  test("checking persistence after form submit", () => {
    const itemNameField = screen.getByPlaceholderText("item name");
    fireEvent.input(itemNameField, {
      target: { value: "cheesecake" },
      bubbles: true,
    });

    const itemQtyField = screen.getByPlaceholderText("item quantity");
    fireEvent.input(itemQtyField, { target: { value: "6" }, bubbles: true });

    const submitBtn = screen.getByText("Add item to inventory");
    fireEvent.click(submitBtn);

    const itemListBefore = document.getElementById("list_items");
    expect(itemListBefore.childNodes).toHaveLength(1);
    expect(
      getByText(itemListBefore, "cheesecake, quantity: 6")
    ).toBeInTheDocument();

    // This is equivalent to reloading the page
    document.body.innerHTML = initialHtml;
    jest.resetModules();
    require("./main");

    const itemListAfter = document.getElementById("list_items");
    expect(itemListAfter.childNodes).toHaveLength(1);
    expect(
      getByText(itemListAfter, "cheesecake, quantity: 6")
    ).toBeInTheDocument();
  });
});
