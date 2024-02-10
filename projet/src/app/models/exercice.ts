export class Exercice {
    constructor(
        public id: number = 0, // L'identifiant de l'exercice
        public routineId: number = 0, // L'identifiant de la routine à laquelle l'exercice est associé
        public name: string = "", // Le nom de l'exercice
        public repetitions: number = 0, // Le nombre de répétitions de l'exercice
        public weight: number = 0 // Le poids de l'exercice
    ) { }
}