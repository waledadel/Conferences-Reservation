import { BookingType } from '@app/models';
import { RoomType } from 'app/shared/models/ticket';

export class ReservationModel {
  readonly bookingType = BookingType;
  readonly roomType = RoomType;
  isIndividual = true;
  isDouble = false;
  isTriple = false;
  isQuad = false;
}
