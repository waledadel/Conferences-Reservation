import { MatTableDataSource } from '@angular/material/table';

import { IRoomDataSource } from '@app/models';
import { RoomType } from 'app/shared/models/ticket';

export class RoomsModel {
    readonly desktopColumn = ['displayedName', 'members', 'roomType', 'room', 'building', 'floor', 'sizeName', 'available', 'actions'];
    displayedColumns: string[] = [];
    dataSource: MatTableDataSource<IRoomDataSource> = new MatTableDataSource<IRoomDataSource>([]);
    isMobileView = false;
    showLoading = false;
    showErrorMessage = false;
    isDataLocal = false;
    readonly roomType = RoomType;
}
