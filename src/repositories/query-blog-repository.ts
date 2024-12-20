import { BlogOutputType, blogSortData, PaginationOutputType} from "../types/blogs/output";
import {ObjectId, SortDirection, WithId} from "mongodb";
import {BlogMapper} from "./blog-repository";
import {PostOutputType} from "../types/posts/output";
import {PostMapper} from "./post-repository";
import {BlogDb, BlogModel} from "../db/blogs-model";
import {PostModel} from "../db/posts-model";

export class QueryBlogRepository {

     async getById(id: string): Promise<BlogOutputType | null> {
        const blog: WithId<BlogDb> | null = await BlogModel.findOne({_id: new ObjectId(id)})
        if (!blog) {
            return null
        }
        return BlogMapper.toDto(blog)
    }


     async getAllPostsForBlog(blogId: string,sortData: blogSortData): Promise<PaginationOutputType<PostOutputType[]>> {
        const {pageSize, pageNumber, sortBy, sortDirection, searchNameTerm} = sortData
        const search = {blogId: blogId}
        const blog = await PostModel
            .find(search)
            .sort({ [sortBy]: sortDirection as SortDirection }) //был вариант(sortBy as keyof BlogOutputType, sortDirection as SortDirection))
            .limit(pageSize)
            .skip((pageNumber - 1) * pageSize)
            .lean()
        // подсчёт элементов (может быть вынесено во вспомогательный метод)
        const totalCount = await PostModel.countDocuments(search)

        return {

            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount,
            items: blog.map(b => PostMapper.toDto(b))
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


