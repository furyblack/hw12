import {UpdateBlogType} from "../types/blogs/input";
import {BlogOutputType} from "../types/blogs/output";
import {ObjectId, WithId} from "mongodb";
import {BlogDb, BlogModel} from "../db/blogs-model";

export class BlogMapper {
    static toDto(blog: WithId<BlogDb>): BlogOutputType {
        console.log(blog)
        return {
            id: blog._id.toString(),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            isMembership: false,
            createdAt: blog.createdAt.toISOString()
        }
    }
}

export class BlogRepository {

     async createBlog(blog: BlogDb): Promise<string> {
        const newBlogToDb = new BlogModel(blog)
        await newBlogToDb.save()
        return newBlogToDb._id.toString()
    }

     async updateBlog(blogId: string, updateData: UpdateBlogType): Promise<boolean> {
        const updateResult = await BlogModel.updateOne({_id: new ObjectId(blogId)}, {$set: {...updateData}})
        const updatedCount = updateResult.modifiedCount
        return !!updatedCount;

    }

     async deleteBlog(id: string): Promise<boolean> {
        try {
            const result = await BlogModel.deleteOne({_id: new ObjectId(id)});
            return result.deletedCount === 1;
        } catch (error) {
            console.error("Error deleting blog:", error);
            return false;
        }
    }
}


