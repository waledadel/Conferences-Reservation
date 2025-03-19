import { Timestamp } from 'firebase/firestore';
export interface ISettings {
    id: string;
    title: string;
    imageUrl: string;
    imageName: string;
    generalAlerts: string;
    priceDetails: string;
    importantDates: string;
    startReservationDate: Timestamp;
    endReservationDate: Timestamp;
    waitingListCount: number;
    availableTicketsCount: number;
    waitingListMessage: string;
    welcomeMessage: string;
    enableWaitingList: boolean;
    startWaitingDate: Timestamp;
    endWaitingDate: Timestamp;
}
