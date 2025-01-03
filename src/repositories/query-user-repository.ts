import { PaginationOutputType} from "../types/blogs/output";
import {ObjectId, SortDirection, WithId} from "mongodb";
import {UserOutputType, userSortData} from "../types/users/outputUserType";
import {UserAccountDBType} from "../types/users/inputUsersType";
import {UserModel} from "../db/user-model";
import {injectable} from "inversify";

export class UserMapper {
    static toDto(user: WithId<UserAccountDBType>): UserOutputType {
        return {
            id: user._id.toString(),
            login: user.accountData.userName,
            email: user.accountData.email,
            createdAt: user.accountData.createdAt.toISOString()
        }
    }
}
@injectable()
export class UserQueryRepository {
     async getAll(sortData: userSortData): Promise<PaginationOutputType<UserOutputType[]>> {
        let {pageSize, pageNumber, sortBy, sortDirection } = sortData
        let filter:any = {
            $or:[]
        }
        if(sortBy==='login'){
            sortBy = 'userName'
        }
        if(sortData.searchEmailTerm){
            filter["$or"].push({email:{$regex: sortData.searchEmailTerm, $options:'i'}})
        }
        if(sortData.searchLoginTerm){
            filter["$or"].push({userName:{$regex: sortData.searchLoginTerm, $options:'i'}})
        }
        if(filter['$or']?.length === 0){
            filter["$or"].push({})
        }

        const user = await UserModel
            .find(filter)
            .sort({ [sortBy]: sortDirection as SortDirection })
            .limit(pageSize)
            .skip((pageNumber - 1) * pageSize)
            .lean()


        const totalCount = await UserModel.countDocuments(filter)

        return {

            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount,
            items: user.map(u => UserMapper.toDto(u))
        }
    }
     async getById(id:string  ):Promise<UserOutputType | null>{
        const currentUser= await UserModel.findOne({_id:new ObjectId(id)})
        return currentUser? UserMapper.toDto(currentUser): null
    }
}
export const queryUserRepo = new UserQueryRepository()