import { RoomType } from 'app/shared/models/ticket';

export class StatisticsModel {
    items: Itatistics[] = [];
    readonly roomType = RoomType;
    costList: ICost[] = [];
}

export interface Itatistics {
    key: string;
    count: number;
    room?: number;
    members: string[];
    roomType?: RoomType;
}

export interface ICost {
    key: string;
    amount: number;
    members: string[];
}