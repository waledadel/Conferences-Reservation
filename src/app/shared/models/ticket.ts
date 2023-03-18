import { Timestamp } from 'firebase/firestore';

export interface ITicket {
    id: string;
    adminNotes: string;
    userNotes: string;
    total: number;
    paid: number;
    remaining: number;
    status: TicketStatus;
    type: TicketType;
    roomId: string;
    children: Array<IChild>;
    adults: Array<IAdult>;
    bookingDate: Timestamp;
}

export interface IAdult {
    isMajor: boolean;
    name: string;
    address: string;
    birthDate: Date;
    gender: Gender;
    status: SocialStatus;
    mobile: string;
    transportation: string;
}

export interface IChild {
    name: string;
    birthDate: Date;
    gender: Gender;
    transportation: string;
    needBed: boolean;
}

export enum TicketStatus {
    new = 1,
    confirmed = 2,
    duplicated = 1,
    canceled = 4
}

export enum SocialStatus {
    single = 1,
    married = 2
}

export enum TicketType {
    individual = 1,
    group = 2
}

export enum Gender {
    male = 1,
    female = 2
}