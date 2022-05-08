const { addItem, data, API_ADDR } = require("./inventoryController");
const nock = require("nock");

describe("testing inventory features", () => {
  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll();
      throw new Error("Not all mocked endpoints received requests.");
    }
  });
  test("add Items function", async () => {
    nock(API_ADDR)
      .post(/inventory\/.*$/)
      .reply(201);

    await addItem("croissant", 5);
    expect(data.inventory.croissant).toBe(5);
  });

  test("sending request when adding items", async () => {
    nock(API_ADDR)
      .post(
        /inventory\/.*$/,
        JSON.stringify({ itemName: "croissant", quantity: 2 })
      )
      .reply(201);

    await addItem("croissant", 2);
  });
});
