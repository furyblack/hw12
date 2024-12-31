import {NextFunction, Request, Response} from "express";
import {jwtService} from "../../application/jwt-service";
import {UsersRepository} from "../../repositories/users-repository";

const userRepo = new UsersRepository()


export const extractUserIdFromToken = async  (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        next()
        return;
    }
    // Извлекаем токен из заголовка
    const token = req.headers.authorization.split(' ')[1];
    // Получаем ID пользователя по токену
    const userId = await jwtService.getUserIdByToken(token);
    console.log('user if from token', userId)
    // Ищем пользователя в базе данных
    const user = await userRepo.findUserById(userId);
    if (user) {
        req.userDto = user; // Добавляем пользователя в объект запроса
        next(); // Передаем управление следующему middleware
        return;
    }
    return next()
};