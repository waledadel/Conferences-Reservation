import { signal } from '@angular/core';
import { KeyValue } from '@angular/common';

import { RoomType } from 'app/shared/models/ticket';

export class StatisticsModel {
    items: IStatistics[] = [];
    readonly roomType = RoomType;
    costList: ICost[] = [];
    busStatistics = signal<BusStatistics[]>([]);
    roomStatistics = signal<RoomStatistics[]>([]);
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

export interface RoomStatistics {
    readonly key: string;
    readonly membersCount: number;
    readonly roomCount: number;
    readonly roomType: RoomType;
    readonly groups: RoomGroupStatistics[];
}

export interface RoomGroupStatistics {
    readonly primaryName: string;
    readonly members: {name: string; isChild: boolean}[];
}