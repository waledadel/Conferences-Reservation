import { IExportMembers } from './export-members.component';

export const allOptions: Array<IExportMembers> = [
    {key: 'الاسم', columnName: 'name', isChecked: false, isCustomizableOption: false},
    {key: 'الموبايل', columnName: 'mobile', isChecked: false, isCustomizableOption: false},
    {key: 'عدد الأطفال', columnName: 'adultsCount', isChecked: false, isCustomizableOption: true},
    {key: 'عدد البالغين', columnName: 'childrenCount', isChecked: false, isCustomizableOption: true},
    {key: 'الغرفة', columnName: 'roomId', isChecked: false, isCustomizableOption: false},
    {key: 'المواصلات', columnName: 'transportationName', isChecked: false, isCustomizableOption: false},
    {key: 'العنوان', columnName: 'addressName', isChecked: false, isCustomizableOption: false},
    {key: 'نوع الحجز', columnName: 'bookingType', isChecked: false, isCustomizableOption: true},
    {key: 'تاريخ الميلاد', columnName: 'birthDate', isChecked: false, isCustomizableOption: false},
    {key: 'السن', columnName: 'age', isChecked: false, isCustomizableOption: false},
    {key: 'تاريخ الحجز', columnName: 'bookingDate', isChecked: false, isCustomizableOption: true},
    {key: 'النوع', columnName: 'gender', isChecked: false, isCustomizableOption: false},
    {key: 'التكلفة الكلية', columnName: 'totalCost', isChecked: false, isCustomizableOption: true},
    {key: 'المدفوع', columnName: 'paid', isChecked: false, isCustomizableOption: true},
    {key: 'ملاحظات الخدام', columnName: 'adminNotes', isChecked: false, isCustomizableOption: true},
    {key: 'ملاحظات المشترك', columnName: 'userNotes', isChecked: false, isCustomizableOption: true},
    {key: 'تاريخ آخر تحديث', columnName: 'lastUpdateDate', isChecked: false, isCustomizableOption: true},
    {key: 'آخر تحديث بواسطة', columnName: 'lastUpdatedBy', isChecked: false, isCustomizableOption: true},
    {key: 'حالة الحجز', columnName: 'bookingStatus', isChecked: false, isCustomizableOption: false},
];