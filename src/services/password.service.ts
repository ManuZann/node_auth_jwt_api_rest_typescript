import bcrypt from "bcrypt"

const saltos: number = 10

//Hash de password
export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, saltos)
}

export const passwordComparator = async (password: string, passwordHashed: string): Promise<boolean> => {
    return await bcrypt.compare(password, passwordHashed)
}