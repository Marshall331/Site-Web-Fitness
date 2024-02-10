export enum EtatRoutine {
    ACTIVE = "active", // État de la routine actif
    INACTIVE = "inactive" // État de la routine inactif
}

export class Routine {
    constructor(
        public id: number = 0, // L'identifiant de la routine
        public name: string = "", // Le nom de la routine
        public description: string = "", // La description de la routine
        public creationDate: Date = new Date(), // La date de création de la routine, par défaut à la date actuelle
        public status: EtatRoutine = EtatRoutine.ACTIVE // L'état de la routine, par défaut à "active"
    ) { }
}