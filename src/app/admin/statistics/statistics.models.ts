import { IBus } from '@app/models';
import { RoomType } from 'app/shared/models/ticket';

export class StatisticsModel {
    buses: IBus[] = [];
    items: Itatistics[] = [];
    readonly roomType = RoomType;
}

export interface Itatistics {
    key: string;
    count: number;
    room?: number;
    members: string[];
    roomType?: RoomType;
}