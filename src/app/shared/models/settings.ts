import { Timestamp } from 'firebase/firestore';
export interface ISettings {
    id: string;
    title: string;
    imageUrl: string;
    imageName: string;
    generalAlerts: string;
    priceDetails: string;
    importantDates: string;
    firstReservationDate: Timestamp;
    lastReservationDate: Timestamp;
}