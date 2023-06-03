import { MatTableDataSource } from '@angular/material/table';

import { IRoom } from '@app/models';

export class RoomsModel {
    readonly desktopColumn = ['displayedName', 'room', 'building', 'floor', 'sizeName', 'size', 'current', 'available', 'notUsed', 'actions'];
    displayedColumns: string[] = [];
    dataSource: MatTableDataSource<IRoom> = new MatTableDataSource<IRoom>([]);
    isMobileView = false;
    showLoading = false;
    showErrorMessage = false;
    isDataLocal = false;
}
