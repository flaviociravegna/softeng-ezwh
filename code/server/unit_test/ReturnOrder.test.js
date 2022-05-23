const RO = require('../modules/ReturnOrder')

describe("Get Return Orders",()=>{
    test('no return orders in the list', async ()=>{
            
            expect(RO.getReturnOrders()).resolves.toEqual([]);

    });

    test('when an error occurs', async ()=>{
            
        

    });

    test('when there is at least 1 return order', async ()=>{
            
        

    });
})
