export interface IRoom {
    id: string;
    room: number;
    building: number;
    floor: number;
    sizeName: string;
    size: number;
    displayedName: string;
    current: number;
    available: number;
    notUsed: number;
}


export interface IRoomDataSource {
    id: string;
    room: number;
    building: number;
    floor: number;
    sizeName: string;
    current: number;
    available: number;
    notUsed: number;
}

export enum RoomErrorsModal {
    emptySelection = 1,
    exceededAvailability = 2
}

export enum MemberRoom {
    all = 0,
    hasRoom = 1,
    notHaveRoom = 2
}