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
        await prismaClient.user.create({
            data:{
            email: parsedData.data?.username,
            password: parsedData.data.password,
            name: parsedData.data.name
                } 
        })

        res.json({userId: "123"})
    } catch(e){
        res.status(411).json({ msg:"user already exists" })

    }

})


//sign in end point

app.post("/signin", (req, res)=>{

    const data = SignInSchema.safeParse(req.body)
    if(!data.success){
    res.json({
        msg:"incorrect input"
    })
    return;
    }

    const userId = 1;
    const token = jwt.sign({ userId },JWT_SECRET)
    res.json({token})

})

app.post("/create-room", middleware,(req, res)=>{
 //db call
 const data = CreateRoomSchema.safeParse(req.body)
 if(!data.success){
 res.json({
     msg:"incorrect input"
 })
 return;
 }


res.json({ roomId: 123 })
})



app.listen(3005);