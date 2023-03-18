import { FieldPath, WhereFilterOp } from 'firebase/firestore';

export interface ICollectionData {
    collectionName: string; 
    fieldPath: string | FieldPath;
    opStr: WhereFilterOp; 
    value: unknown; 
    idField: string;
}
