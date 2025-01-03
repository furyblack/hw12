import { BlogOutputType, blogSortData, PaginationOutputType} from "../types/blogs/output";
import {ObjectId, SortDirection, WithId} from "mongodb";
import {BlogMapper} from "./blog-repository";
import {PostOutputType} from "../types/posts/output";
import {BlogDb, BlogModel} from "../db/blogs-model";
import {PostModel} from "../db/posts-model";
import {LikeModelPosts, LikeStatusEnum} from "../db/likes-model";
import {injectable} from "inversify";
@injectable()
export class QueryBlogRepository {

     async getById(id: string): Promise<BlogOutputType | null> {
        const blog: WithId<BlogDb> | null = await BlogModel.findOne({_id: new ObjectId(id)})
        if (!blog) {
            return null
        }
        return BlogMapper.toDto(blog)
    }

     async getAllPostsForBlog(blogId: string,sortData: blogSortData, userId: string | null): Promise<PaginationOutputType<PostOutputType[]>> {
        const {pageSize, pageNumber, sortBy, sortDirection} = sortData
        const search = {blogId: blogId}
        const blog = await PostModel
            .find(search)
            .sort({ [sortBy]: sortDirection as SortDirection }) //был вариант(sortBy as keyof BlogOutputType, sortDirection as SortDirection))
            .limit(pageSize)
            .skip((pageNumber - 1) * pageSize)
            .lean()
        // подсчёт элементов (может быть вынесено во вспомогательный метод)
        const totalCount = await PostModel.countDocuments(search)

         if (!userId){
             return {
                 pagesCount: Math.ceil(totalCount / pageSize),
                 page: pageNumber,
                 pageSize: pageSize,
                 totalCount,
                 items: blog.map(p => ({
                     id: p._id.toString(),
                     title: p.title,
                     shortDescription: p.shortDescription,
                     content: p.content,
                     blogId: p.blogId,
                     blogName: p.blogName,
                     createdAt: p.createdAt.toISOString(), // Преобразование в строку
                     extendedLikesInfo: {
                         likesCount: p.extendedLikesInfo.likesCount,
                         dislikesCount: p.extendedLikesInfo.dislikesCount,
                         myStatus: LikeStatusEnum.NONE, // По умолчанию
                         newestLikes: p.extendedLikesInfo.newestLikes.map(n=> {
                             return {
                                 addedAt:n.addedAt,
                                 userId:n.userId,
                                 login:n.login
                             }
                         })
                     }
                 }))
             };
         }

         // Получаем статус реакции пользователя для каждого коммента
         const userLikes = await LikeModelPosts.find({ postId: { $in: blog.map(p => p._id.toString()) }, userId });
         const userLikesMap = new Map(userLikes.map(like => [like.postId.toString(), like.status]));

         // Формируем ответ с учётом myStatus
         const responsePosts = blog.map(p => {
             const myStatus = userLikesMap.get(p._id.toString()) || LikeStatusEnum.NONE; // Значение из LikeStatusEnum
             return {
                 id: p._id.toString(),
                 title: p.title,
                 shortDescription: p.shortDescription,
                 content: p.content,
                 blogId: p.blogId,
                 blogName: p.blogName,
                 createdAt: p.createdAt.toISOString(), // Преобразование в строку
                 extendedLikesInfo: {
                     likesCount: p.extendedLikesInfo.likesCount,
                     dislikesCount: p.extendedLikesInfo.dislikesCount,
                     myStatus: myStatus, // По умолчанию
                     newestLikes: p.extendedLikesInfo.newestLikes.map(n=> {
                         return {
                             addedAt:n.addedAt,
                             userId:n.userId,
                             login:n.login
                         }
                     })
                 }
             };
         });

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount,
            items: responsePosts
        }
    }

     async getAll(sortData: blogSortData): Promise<PaginationOutputType<BlogOutputType[]>> {
        const {pageSize, pageNumber, sortBy, sortDirection, searchNameTerm} = sortData
        const search = searchNameTerm
            ? {name: {$regex: searchNameTerm, $options: 'i'}}
            : {}
        const blog = await BlogModel
            .find(search)
            .sort({ [sortBy]: sortDirection as SortDirection }) //был вариант(sortBy as keyof BlogOutputType, sortDirection as SortDirection))
            .limit(pageSize)
            .skip((pageNumber - 1) * pageSize)
            .lean()

        const totalCount = await BlogModel.countDocuments(search)

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount,
            items: blog.map(b => BlogMapper.toDto(b))
        }
    }
}
export const queryBlogRepo = new QueryBlogRepository()


