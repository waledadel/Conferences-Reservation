import { signal } from '@angular/core';
import { KeyValue } from '@angular/common';

import { RoomType } from 'app/shared/models/ticket';
import { IRoom } from '@app/models';

export class StatisticsModel {
    items: IStatistics[] = [];
    readonly roomType = RoomType;
    costList: ICost[] = [];
    busStatistics = signal<BusStatistics[]>([]);
    roomStatistics = signal<RoomStatistics[]>([]);
    roomsList = signal<IRoomList[]>([]);
    buildingList = signal<IBuilding[]>([]);
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
    readonly floor?: number;
    readonly building?: string;
    readonly room?: number;
    readonly members: {name: string; isChild: boolean}[];
}

export interface IRoomList {
    key: string;
    rooms: IRoom[];
    isComplete: boolean;
}

export interface IBuilding {
    name: string;
    members: IBuildingMembers[];
}

export interface IBuildingMembers {
    memberId: string;
    name: string;
    room: string;
}