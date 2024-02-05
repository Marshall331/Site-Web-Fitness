export enum EtatRoutine {
    ACTIVE = "active",
    INACTIVE = "inactive"
}

export class Routine {
    constructor(
        public id: number = 0,
        public name: string = "",
        public description: string = "",
        public creationDate:Date = new Date(),
        public status:EtatRoutine = EtatRoutine.ACTIVE
    ) { }
}
