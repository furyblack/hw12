import {UsersService} from "../domain/users-service";
import {RequestWithBody, RequestWithQuery} from "../types/common";
import {CreateNewUserType, userQuerySortData} from "../types/users/inputUsersType";
import {Request, Response} from "express";
import {PaginationOutputType} from "../types/blogs/output";
import {UserOutputType} from "../types/users/outputUserType";
import {userPaginator} from "../types/paginator/pagination";
import {queryUserRepo} from "../repositories/query-user-repository";

export class UserController {
    constructor(protected userService: UsersService) {
    }

    async getUsers(req: RequestWithQuery<userQuerySortData>, res: Response<PaginationOutputType<UserOutputType[]>>) {
        const paginationData = userPaginator(req.query)
        const userPromise = await queryUserRepo.getAll(paginationData)
        res.send(userPromise)
    }

    async createUser(req: RequestWithBody<CreateNewUserType>, res: Response) {
        const userId: string = await this.userService.createUser(req.body.login, req.body.email, req.body.password)
        const user = await queryUserRepo.getById(userId)
        return res.status(201).send(user)
    }

    async deleteUser(req: Request, res: Response) {
        const isDeleteUser = await this.userService.deleteUser(req.params.id)
        if (isDeleteUser) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    }
}