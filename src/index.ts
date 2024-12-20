import {app} from "./settings";
import {connectMongo} from "./db/db";
import dotenv from 'dotenv'



dotenv.config()
const port= process.env.PORT as string

    app.listen(port, async ()=>{
        await connectMongo()
        console.log(`example app listening on port ${port}`)
    })




