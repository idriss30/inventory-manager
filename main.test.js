const fs = require("fs");
const { screen, getByText, fireEvent } = require("@testing-library/dom");

const initialHtml = fs.readFileSync("./index.html");

beforeEach(() => {
  document.body.innerHTML = initialHtml;
  jest.resetModules(); // make jest not using cache version of main.js
  require("./main"); // attach event to the form everytime body changes
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

describe("handle Item name function", () => {
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
