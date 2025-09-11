const { Router } = require("express");
const membershipController = require("../controllers/membershipController");
const membershipRouter = Router();

membershipRouter.post('/', membershipController.membershipCreate);
membershipRouter.get('/', membershipController.membershipGetAll);
membershipRouter.get('/:membershipid', membershipController.membershipGet);
membershipRouter.delete('/:membershipid', membershipController.membershipDelete);

module.exports = membershipRouter;