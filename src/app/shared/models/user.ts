export interface IUser {
    id: string;
    email: string;
    password: string;
    fullName: string;
    createdOn: Date;
    role: Roles;
}


export enum Roles {
    admin = 1,
    servant = 2
}