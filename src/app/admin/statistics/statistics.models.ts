import { KeyValue } from '@angular/common';
import { signal } from '@angular/core';

import { RoomType } from 'app/shared/models/ticket';

export class StatisticsModel {
    items: IStatistics[] = [];
    readonly roomType = RoomType;
    costList: ICost[] = [];
    busStatistics = signal<BusStatistics[]>([]);
}

export interface IStatistics {
    key: string;
    count: number;
    room?: number;
    members: string[];
    roomType?: RoomType;
}

export interface ICost {
    key: string;
    amount: number;
    members: KeyValue<string, string>[];
}

export interface BusStatistics {
    readonly key: string;
    readonly count: number;
    readonly members: BusMemberStatistics[];
}

export interface BusMemberStatistics {
    readonly name: string;
    readonly mobile: string;
    readonly remaining: number;
}