import {inputValidationMiddleware} from "../middlewares/inputValidation/input-validation-middleware";
import {body} from "express-validator";
import {queryBlogRepo} from "../repositories/query-blog-repository";

const titleValidator = body('title').isString().trim().isLength({
    min: 1,
    max: 30
}).withMessage('Incorrect title')

const shortDescriptionValidator = body('shortDescription').isString().withMessage('shortDescription must be a string').trim().isLength({
    min: 1,
    max: 100
}).withMessage('Incorrect Shortdescription')

const contentValidator = body('content').isString().withMessage('content must be a string').trim().isLength({
    min: 1,
    max: 1000
}).withMessage('Incorrect Content')

const commentValidator = body('content').isString().withMessage('content must be a string').trim().isLength({
    min: 20,
    max: 300
})

export const postIdValidator = body('blogId').isString().custom  (async (value:string) => {
    const blog = await queryBlogRepo.getById(value);
    console.log(blog)
    if (!blog){
        throw Error ('Incorrect postId')
    }
    return true
}
).withMessage('Incorrect PostId')

export const postValidation = () =>[titleValidator, shortDescriptionValidator, contentValidator, postIdValidator, inputValidationMiddleware]
export const postForBlogValidation = () =>[titleValidator, shortDescriptionValidator, contentValidator, inputValidationMiddleware]
export const commentForPostValidation = ()=>[commentValidator, inputValidationMiddleware]
