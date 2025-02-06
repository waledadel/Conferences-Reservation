import { IBus } from '@app/models';

export class StatisticsModel {
    buses: IBus[] = [];
    items: Itatistics[] = [];
}

export interface Itatistics {
    key: string;
    count: number;
    members: string[];
}