import { IPrimaryDataSourceVm } from '@app/models';

export enum ExportPages {
    All = 1,
    Primary = 2
}

export interface IExportMembers { 
    key: string;
    columnName: keyof IPrimaryDataSourceVm;
    isChecked: boolean;
    visibility: Array<ExportPages>;
}

export const allOptions: Array<IExportMembers> = [
    {key: 'اسم المشترك', columnName: 'name', isChecked: false, visibility: [ExportPages.All, ExportPages.Primary]},
    {key: 'المشتترك الرئيسي', columnName: 'mainMemberName', isChecked: false, visibility: [ExportPages.All]},
    {key: 'الموبايل', columnName: 'mobile', isChecked: false, visibility: [ExportPages.All, ExportPages.Primary]},
    {key: 'عدد الأطفال', columnName: 'adultsCount', isChecked: false, visibility: [ExportPages.Primary]},
    {key: 'عدد البالغين', columnName: 'childrenCount', isChecked: false, visibility: [ExportPages.Primary]},
    {key: 'الغرفة', columnName: 'roomId', isChecked: false, visibility: [ExportPages.All, ExportPages.Primary]},
    {key: 'المواصلات', columnName: 'transportationName', isChecked: false, visibility: [ExportPages.All, ExportPages.Primary]},
    {key: 'العنوان', columnName: 'addressName', isChecked: false, visibility: [ExportPages.All, ExportPages.Primary]},
    {key: 'نوع الحجز', columnName: 'bookingType', isChecked: false, visibility: [ExportPages.Primary]},
    {key: 'تاريخ الميلاد', columnName: 'birthDate', isChecked: false, visibility: [ExportPages.All, ExportPages.Primary]},
    {key: 'السن', columnName: 'age', isChecked: false, visibility: [ExportPages.All, ExportPages.Primary]},
    {key: 'تاريخ الحجز', columnName: 'bookingDate', isChecked: false, visibility: [ExportPages.Primary]},
    {key: 'النوع', columnName: 'gender', isChecked: false, visibility: [ExportPages.All, ExportPages.Primary]},
    {key: 'التكلفة الكلية', columnName: 'totalCost', isChecked: false, visibility: [ExportPages.All, ExportPages.Primary]},
    {key: 'المدفوع', columnName: 'paid', isChecked: false, visibility: [ExportPages.All, ExportPages.Primary]},
    {key: 'الباقي', columnName: 'remaining', isChecked: false, visibility: [ExportPages.All, ExportPages.Primary]},
    {key: 'ملاحظات الخدام', columnName: 'adminNotes', isChecked: false, visibility: [ExportPages.Primary]},
    {key: 'ملاحظات المشترك', columnName: 'userNotes', isChecked: false, visibility: [ExportPages.Primary]},
    {key: 'تاريخ آخر تحديث', columnName: 'lastUpdateDate', isChecked: false, visibility: [ExportPages.Primary]},
    {key: 'آخر تحديث بواسطة', columnName: 'lastUpdatedBy', isChecked: false, visibility: [ExportPages.Primary]},
    {key: 'حالة الحجز', columnName: 'bookingStatus', isChecked: false, visibility: [ExportPages.All, ExportPages.Primary]},
];