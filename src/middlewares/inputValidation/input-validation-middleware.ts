import {validationResult} from "express-validator";
import {NextFunction, Response, Request} from "express";

export const inputValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).formatWith(error => {
        switch (error.type) {
            case 'field' :
                return {
                    message: error.msg,
                    field: error.path,
                };
            default:
                return {
                    message: error.msg,
                    field: '-----'
                }
        }
    });

    if (!errors.isEmpty()) {
        const err = errors.array({onlyFirstError: true});

        return res.status(400).send({
            errorsMessages: err
        })
    }

    return next();
};

