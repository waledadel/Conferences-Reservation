export function convertSnaps<T>(snaps: any) {
    return <T[]>snaps.map((snap: any) => {
        return {
            id: snap.payload.doc.id,
            ...snap.payload.doc.data()
        };

    });
}