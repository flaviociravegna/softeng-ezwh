'use strict';

class SKU {
    constructor(id, description, weight, volume, notes, positionID, availableQuantity, price) {
        this.id = id;
        this.description = description;
        this.weight = weight;
        this.volume = volume;
        this.notes = notes;
        this.position = positionID;
        this.availableQuantity = availableQuantity;
        this.price = price;
        this.testDescriptors = []; //Contains the IDs of the associated test descriptors
    }
}

module.exports = SKU;