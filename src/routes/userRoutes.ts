import express, { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from "../controllers/usersController";

const userRoutes = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || "default-secret"

const autenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if(!token){
        return res.status(401).json({ error: "No autorizado" })
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if(err){
            console.log("Error en la autenticacion");
            return res.status(403).json({error: "No tiene acceso a este recurso"})
        }
    })

    next()
}

userRoutes.post("/",autenticateToken, createUser)
userRoutes.get("/", autenticateToken, getAllUsers)
userRoutes.get("/:id", autenticateToken, getUserById)
userRoutes.put("/:id", autenticateToken, updateUser)
userRoutes.delete("/:id", autenticateToken, deleteUser)

export default userRoutes