import { PostMongoDbType, PostOutputType, postSortData } from "../types/posts/output";
import { PaginationOutputType } from "../types/blogs/output";
import { ObjectId, SortDirection } from "mongodb";
import { CommentOutputType } from "../types/comment/output-comment-type";
import {PostModel} from "../db/posts-model";
import {CommentModel} from "../db/comment-model";
import {LikeModel, LikeModelPosts, LikeStatusEnum} from "../db/likes-model";
import {PostMapper} from "./post-repository";


export class QueryPostRepository {

     async getAll(sortData: postSortData, userId: string | null): Promise<PaginationOutputType<PostOutputType[]>> {
        const { pageSize, pageNumber, sortBy, sortDirection, searchNameTerm } = sortData;
        const search = searchNameTerm
            ? { title: { $regex: searchNameTerm, $options: 'i' } }
            : {};
        const post = await PostModel
            .find(search)
            .sort({ [sortBy]: sortDirection as SortDirection })
            .limit(pageSize)
            .skip((pageNumber - 1) * pageSize)
            .lean();

        const totalCount = await PostModel.countDocuments(search);

        if (!userId){
            return {
                pagesCount: Math.ceil(totalCount / pageSize),
                page: pageNumber,
                pageSize: pageSize,
                totalCount,
                items: post.map(p => ({
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
         const userLikes = await LikeModelPosts.find({ postId: { $in: post.map(p => p._id.toString()) }, userId });
         const userLikesMap = new Map(userLikes.map(like => [like.postId.toString(), like.status]));

         // Формируем ответ с учётом myStatus
         const responsePosts = post.map(p => {
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
            items:responsePosts
            //items: post.map((p) => PostMapper.toDto(p))
        };
    }


     async getAllCommentsForPost(postId: string, sortData: postSortData, userId: string | null): Promise<PaginationOutputType<CommentOutputType[]>> {
        const { pageSize, pageNumber, sortBy, sortDirection } = sortData;
        const search = { postId: postId };

        // Получаем все комменты к посту с сортировкой и пагинацией
        const comments = await CommentModel
            .find(search)
            .sort({ [sortBy]: sortDirection as SortDirection })
            .limit(pageSize)
            .skip((pageNumber - 1) * pageSize)
            .lean();

        // Подсчёт общего количества комментов
        const totalCount = await CommentModel.countDocuments(search);

        // Если userId не передан, возвращаем комменты без myStatus
        if (!userId) {
            return {
                pagesCount: Math.ceil(totalCount / pageSize),
                page: pageNumber,
                pageSize: pageSize,
                totalCount,
                items: comments.map(c => ({
                    id: c._id.toString(),
                    content: c.content,
                    commentatorInfo: c.commentatorInfo,
                    createdAt: c.createdAt.toISOString(), // Преобразование в строку
                    likesInfo: {
                        likesCount: c.likesInfo.likesCount,
                        dislikesCount: c.likesInfo.dislikesCount,
                        myStatus: LikeStatusEnum.NONE // По умолчанию
                    }
                }))
            };
        }

        // Получаем статус реакции пользователя для каждого коммента
        const userLikes = await LikeModel.find({ commentId: { $in: comments.map(c => c._id.toString()) }, userId });
        const userLikesMap = new Map(userLikes.map(like => [like.commentId.toString(), like.status]));

        // Формируем ответ с учётом myStatus
        const responseComments = comments.map(c => {
            const myStatus = userLikesMap.get(c._id.toString()) || LikeStatusEnum.NONE; // Значение из LikeStatusEnum
            return {
                id: c._id.toString(),
                content: c.content,
                commentatorInfo: c.commentatorInfo,
                createdAt: c.createdAt.toISOString(), // Преобразование в строку
                likesInfo: {
                    likesCount: c.likesInfo.likesCount,
                    dislikesCount: c.likesInfo.dislikesCount,
                    myStatus: myStatus
                }
            };
        });

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount,
            items: responseComments
        };
    }


    //get post by id
     async getById(id: string, userId?:string): Promise<PostOutputType | null> {
         console.log('id',id)
         console.log('userId from query repo',userId)
        const post: PostMongoDbType | null = await PostModel.findOne({ _id: new ObjectId(id) }); //, userId вырезал
        if (!post) {
            return null;
        }
         let likeStatus = LikeStatusEnum.NONE

         if(userId){
             const  status  = await LikeModelPosts.findOne({postId:id, userId:userId})
             if(status){
                 likeStatus = status.status
             }
         }





        return PostMapper.toDto(post, likeStatus);
    }
}

export const queryPostRepo = new QueryPostRepository()
