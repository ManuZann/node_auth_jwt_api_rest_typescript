import { Request, Response } from "express"
import prisma from "../models/user.model"
import { hashPassword, passwordComparator } from "../services/password.service"

export const createUser = async (req: Request, res: Response): Promise<void> => {
    const {email, password} = req.body
    if(!email) {
        res.status(400).json({message: "El email es obligatorio"})
        return
    }
    if(!password) {
        res.status(400).json({message: "La contraseña es obligatoria"})
        return
    }
    try {
        const passwordHashed = await hashPassword(password)        
        const user = await prisma.create(
            {
                data:{
                    email,
                    password: passwordHashed
                }
            }
        )
        res.status(201).json(user)
    } catch (error:any) {
        if(error?.code === "P2002" && error?.meta?.target.includes("email")){
            res.status(400).json({message: "El email ingresado ya eiste"})
        }
        console.log(error);
        res.status(500).json({error: "Hubo un error en el registro"})
    }
}

export const getAllUsers = async(req: Request, res: Response): Promise<void> => {
    try {
        const users = await prisma.findMany()
        if(!users){
            res.status(404).json({error: "No usuarios registrados"})
            return
        }
        res.status(200).json(users)
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Internal Error"})
    }
}

export const getUserById = async(req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.params.id)
    try {
        const user = await prisma.findUnique({
            where: {
                id: userId
            }
        })

        if(!user){
            res.status(404).json({error: "Usuario no encontrado"})
            return
        }
        res.status(200).json(user)
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Internal Error"})
    }
}

export const updateUser = async(req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.params.id)
    const { email, password } = req.body
    try {
        let dataToUpdate: any = {...req.body}
        if(password){
            const hashedPassword = await hashPassword(password)
            console.log(hashedPassword);
            
            dataToUpdate.password = hashedPassword
        }
        if(email){
            dataToUpdate.email = email
        }

        const user = await prisma.update({
            where: {
                id: userId
            },
            data: dataToUpdate
        })

        res.status(200).json(user)
    } catch (error: any) {
        if(error?.code === "P2002" && error?.meta?.target.includes("email")){
            res.status(400).json({message: "El email ingresado ya eiste"})
            return
        }
        if(error?.code === "P2025"){
            res.status(404).json({error: "Usuario no encontrado"})
            return
        }
        console.log(error);
        res.status(500).json({error: "Internal Error"})
    }
}

export const deleteUser = async(req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.params.id)
    try {
        await prisma.delete({
            where: {
                id: userId
            }
        })
        res.status(200).json({ message: `El usuario ${userId} fue eliminado.`}).end()
    } catch (error: any) {
        if(error?.code === "P2025"){
            res.status(404).json({error: "Usuario no encontrado"})
            return
        }
        console.log(error);
        res.status(500).json({error: "Internal Error"})
    }
}