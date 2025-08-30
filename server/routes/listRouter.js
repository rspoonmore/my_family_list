const { Router } = require("express");
const listController = require("../controllers/listController");
const listRouter = Router();

listRouter.post('/', listController.listCreate);
listRouter.get('/', listController.listGetAll);
listRouter.get('/:listid', listController.listGet);
listRouter.put('/:listid', listController.listUpdate);

// listRouter.delete('/:listid', listController.listDelete);

module.exports = listRouter;