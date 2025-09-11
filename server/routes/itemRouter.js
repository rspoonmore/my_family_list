const { Router } = require("express");
const itemController = require("../controllers/itemController");
const itemRouter = Router();

itemRouter.post('/', itemController.itemCreate);
itemRouter.get('/:itemid', itemController.itemGetByID);
itemRouter.put('/:itemid', itemController.itemUpdate);
itemRouter.put('/:itemid/purchased', itemController.itemUpdateQtyPurchased);
itemRouter.delete('/:itemid', itemController.itemDelete);

module.exports = itemRouter;