const fs = require("fs");
const { screen, getByText } = require("@testing-library/dom");

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

  const event = new Event("submit");
  const addItemForm = document.querySelector("#add-item-form");
  //trigger the event
  addItemForm.dispatchEvent(event);
  const itemList = document.getElementById("list_items");
  expect(getByText(itemList, `croissant, quantity: 2`)).toBeInTheDocument();
});

describe("handle Item name function", () => {
  test("entering available items", () => {
    const inputField = screen.getByPlaceholderText("item name");
    inputField.value = "cheesecake";
    const event = new Event("input", { bubbles: true });
    inputField.dispatchEvent(event);

    expect(screen.getByText("cheesecake is valid")).toBeInTheDocument();
  });

  test("entering invalid item", () => {
    const input = screen.getByPlaceholderText("item name");
    input.value = "chocolate";
    const event = new Event("input", { bubbles: true });
    input.dispatchEvent(event);
    expect(screen.getByText("chocolate is not valid")).toBeInTheDocument();
  });
});
