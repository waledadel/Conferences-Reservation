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
