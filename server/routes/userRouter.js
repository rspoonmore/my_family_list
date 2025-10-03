const { Router } = require("express");
const userController = require("../controllers/userController");
const userRouter = Router();

userRouter.get('/session', userController.userSession);
userRouter.post('/login', userController.userLogin);
userRouter.post('/logout', userController.userLogout);
userRouter.post('/', userController.userCreate);
userRouter.get('/', userController.usersGetAll);
userRouter.put('/:userid', userController.userUpdate);
userRouter.put('/:userid/password', userController.userUpdatePassword);
userRouter.get('/:userid', userController.userGetByID);
userRouter.delete('/:userid', userController.userDelete);

module.exports = userRouter;