import {body} from "express-validator"
import {inputValidationMiddleware} from "../middlewares/inputValidation/input-validation-middleware";


const loginValidator = body('login').isString().withMessage('Login must be a string').trim().matches( '^[a-zA-Z0-9_-]*$'
).isLength({
    min: 3,
    max: 10
}).withMessage('Incorrect login length')

const loginOrEmailValidator = body('loginOrEmail').isString().withMessage('loginOrEmail must be a string').trim().withMessage('Incorrect loginOrEmail length')

const passwordValidator = body('password').isString().withMessage('Password must be a string').trim().isLength({
    min: 6,
    max: 20
}).withMessage('Incorrect password')

const emailValidator = body('email').isString().withMessage('Email must be a string').trim().matches( '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$'
).withMessage('Incorrect websiteUrl')

export const userValidation = () =>[loginValidator, passwordValidator, emailValidator, inputValidationMiddleware]
//добавить валидатор логин и email смесь loginValidator loginValidator

export const loginzationValidation = () =>[loginOrEmailValidator, passwordValidator, inputValidationMiddleware]