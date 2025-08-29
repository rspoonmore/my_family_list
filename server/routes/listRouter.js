const { Router } = require("express");
const listController = require("../controllers/listController");
const listRouter = Router();

listRouter.post('/', listController.listCreate);
listRouter.get('/', listController.listGetAll);

// listRouter.put('/:listid', listController.listEdit);
// listRouter.get('/:listid', listController.listGet);
// listRouter.delete('/:listid', listController.listDelete);

module.exports = listRouter;