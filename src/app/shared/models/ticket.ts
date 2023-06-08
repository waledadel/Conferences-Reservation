import { Timestamp } from 'firebase/firestore';

export interface ITicket {
    id: string;
    name: string;
    addressId: string;
    birthDate: Timestamp;
    gender: Gender;
    socialStatus: SocialStatus;
    mobile: string;
    transportationId: string;
    userNotes: string;
    bookingDate: Timestamp;
    adminNotes: string;
    paid: number;
    bookingStatus: BookingStatus;
    bookingType: BookingType;
    roomId: string;
    adultsCount: number;
    childrenCount: number;
    needsSeparateBed: boolean;
    isChild: boolean;
    isMain: boolean;
    primaryId: string;
    age?: number;
    lastUpdateDate?: Timestamp;
    lastUpdateUserId: string;
}

export interface IUserInfo {
    name: string;
    addressId: string;
    birthDate: Timestamp;
    gender: Gender;
    socialStatus: SocialStatus;
    mobile: string;
    transportationId: string;
    userNotes: string;
}

export interface IPrimary extends IUserInfo {
    id: string;
    bookingDate: Timestamp;
    adminNotes: string;
    total: number;
    paid: number;
    remaining: number;
    bookingStatus: BookingStatus;
    bookingType: BookingType;
    roomId: string;
    primaryId: string;
    isChild: boolean;
    isMain: boolean;
    needsSeparateBed: boolean;
}

export interface IParticipant extends IUserInfo {
    id: string;
    needsSeparateBed: boolean;
    isChild: boolean;
}

export interface ITicketForm extends IPrimary {
    participants: Array<IParticipant>;
}

export interface IPrimaryDataSourceVm {
    id: string;
    name: string;
    adultsCount: number;
    childrenCount: number;
    roomId: string;
    bookingType: BookingType;
    bookingStatus: BookingStatus;
    bookingDate: Timestamp;
    totalCost: number;
    paid: number;
    userNotes: string;
    transportationId: string;
    addressId: string;
    primaryId: string;
    mobile: string;
    transportationName: string;
    addressName: string;
    gender: Gender;
    birthDate: Timestamp;
    age: number;
    birthDateMonth: number;
    adminNotes: string;
    lastUpdateDate?: Timestamp;
    lastUpdateUserId: string;
    lastUpdatedBy: string;
}



export interface IAllSubscriptionDataSourceVm {
    id: string;
    age: number;
    birthDate: Timestamp;
    bookingStatus: BookingStatus;
    gender: Gender;
    isChild: boolean;
    isMain: boolean;
    mobile: string;
    name: string;
    roomId: string;
    addressId: string;
    address: string;
    transportationId: string;
    transportationName: string;
    birthDateMonth: number;
    mainMemberName: string;
    primaryId: string;
    displayedRoomName: string;
}

export interface ICostDetailsDataSourceVm {
    name: string;
    reservationPrice: number;
    bedPrice: number;
    transportPrice: number;
    needBed: boolean;
    privateTransport: boolean;
    isChild: boolean;
    isMain: boolean;
}

export interface IRelatedMemberViewModel {
    id: string;
    primaryId: string;
    name: string;
    birthDate: Timestamp;
    needsSeparateBed: boolean;
    transportationId: string;
    isChild: boolean;
}

export interface IMemberRoomDataSource {
    id: string;
    primaryId: string;
    name: string;
    isChild: boolean;
    isMain: boolean;
    roomId: string;
}

export interface IMemberRoomViewModel extends IMemberRoomDataSource {
    hasRoom: boolean;
    isChecked: boolean;
}

export enum BookingStatus {
    all = 0,
    new = 1,
    confirmed = 2,
    duplicated = 3,
    canceled = 4,
    waiting = 5
}

export enum SocialStatus {
    single = 1,
    married = 2,
    widower = 3
}

export enum BookingType {
    individual = 1,
    group = 2
}

export enum Gender {
    all = 0,
    male = 1,
    female = 2
}

