import {body} from "express-validator"
import {inputValidationMiddleware} from "../middlewares/inputValidation/input-validation-middleware";


const nameValidator = body('name').isString().withMessage('Name must be a string').trim().isLength({
    min: 1,
    max: 15
}).withMessage('Incorrect name length')

const descriptionValidator = body('description').isString().withMessage('Description must be a string').trim().isLength({
    min: 1,
    max: 500
}).withMessage('Incorrect description')

const websiteUrlValidator = body('websiteUrl').isString().withMessage('WebsiteUrl must be a string').trim().isLength({
    min: 1,
    max: 100
}).matches( 'https:\\/\\/([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$'
).withMessage('Incorrect websiteUrl')

export const blogValidation = () =>[nameValidator, descriptionValidator, websiteUrlValidator, inputValidationMiddleware]


