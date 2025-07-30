export interface User{
    nome: string;
    cognome: string;
    email: string;
    username: string;
    password: string;
    sex: Sex;
    dateofBirth: string;
    height: number;
    weight: number;
}
export type Sex = "Male" | "Female";