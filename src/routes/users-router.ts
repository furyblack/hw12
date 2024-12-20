import {Router} from "express";
import {authMiddleware} from "../middlewares/auth/auth-middleware";
import {userValidation} from "../validators/user-validators";
import {userController} from "../composition-root";

export const usersRouter = Router({})

usersRouter.get('/', userController.getUsers.bind(userController))

usersRouter.post('/', authMiddleware, userValidation(), userController.createUser.bind(userController))

usersRouter.delete('/:id', authMiddleware, userController.deleteUser.bind(userController))

