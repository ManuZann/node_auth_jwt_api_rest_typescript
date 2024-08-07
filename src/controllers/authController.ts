import { Request, Response } from "express"
import { hashPassword, passwordComparator } from "../services/password.service"
import prisma from "../models/user.model"
import { generateToken } from "../services/auth.service"

export const register = async (req: Request, res: Response): Promise<void> =>{
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
        const token = generateToken(user)
        res.status(201).json({ token })
    } catch (error:any) {
        if(error?.code === "P2002" && error?.meta?.target.includes("email")){
            res.status(400).json({message: "El email ingresado ya eiste"})
        }
        console.log(error);
        res.status(500).json({error: "Hubo un error en el registro"})
    }
}

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } =  req.body

    if(!email) {
        res.status(400).json({message: "El email es obligatorio"})
        return
    }
    if(!password) {
        res.status(400).json({message: "La contraseña es obligatoria"})
        return
    }

    try {
        const user = await prisma.findUnique({ where: { email } })
        if(!user) {
            res.status(404).json({message: "El Usuario y/o la contraseña no existe."})
            return
        }
        const passwordMatch = await passwordComparator(password, user.password)
        if(!passwordMatch){
            res.status(404).json({message: "El Usuario y/o la contraseña no existe."})
            return
        }

        const token = generateToken(user)
        res.status(200).json({ token })
    } catch (error) {
        console.log(error);
        
    }
} 