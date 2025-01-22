import express, { Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import { CreateUserSchema, SignInSchema, CreateRoomSchema } from "@repo/common/types"; 
import { prismaClient } from "@repo/db/client";

const app = express();

app.use(express.json());

app.post("/signup", async (req, res)=> {
    // use zod login
    const parsedData = CreateUserSchema.safeParse(req.body)
    if(!parsedData.success){
        res.json({ msg:"incorrect input" })
    return;
    }

    try {
        const user = await prismaClient.user.create({
            data:{
            email: parsedData.data?.username,
            password: parsedData.data.password,
            name: parsedData.data.name
                } 
        })

        res.json({userId: user.id})
    } catch(e){
        res.status(411).json({ msg:"user already exists" })

    }

})


//sign in end point

app.post("/signin", async(req, res)=>{

    const parsedDatadata = SignInSchema.safeParse(req.body)

        if(!parsedDatadata.success) {
            res.json({ msg:"incorrect input"  })
            return;
            }
            const user = await prismaClient.user.findUnique({
                where:{
                    email:parsedDatadata.data.username,
                    //need to hash the password
                    password:parsedDatadata.data.password   
                }
            })
                if(!user){

                    res.status(403).json({msg:"Not authorized"})
                    return;               
                }    

                const token = jwt.sign({ userId:user?.id },JWT_SECRET)
                res.json({token})

})

app.post("/create-room", middleware, async(req, res)=>{
 //db call
    const parsedDatadata = CreateRoomSchema.safeParse(req.body)
    if(!parsedDatadata.success){
    res.json({  msg:"incorrect input" })
    return;
    }
    //@ts-ignore
    const userId = req.userId;
try{
        const room = await prismaClient.room.create({
            data:{
            slug:parsedDatadata.data.name,
            adminId: userId
            }
        })

    res.json({ roomId: room.id })
    
}catch(e){
    res.status(403).json({msg:"already exits"})
}

})


app.listen(3006);