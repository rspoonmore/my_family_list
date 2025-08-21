const { Router } = require("express");
const groupController = require("../controllers/groupController");
const groupRouter = Router();

groupRouter.post('/', groupController.groupCreate);
groupRouter.get('/', groupController.groupGetAll);
groupRouter.put('/:groupid', groupController.groupEdit);
groupRouter.get('/:groupid', groupController.groupGet);
groupRouter.delete('/:groupid', groupController.groupDelete);

module.exports = groupRouter;