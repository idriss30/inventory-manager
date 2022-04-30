
const { addItem, data } = require("./inventoryController");

describe('testing inventory features', ()=>{
   test('add Items function', ()=>{
       addItem('croissant', 5);
       expect(data.inventory.croissant).toBe(5)
   })
})