export class Personne {
    constructor(
        public nom: string = "",
        public id: number = 0,
        public email?: string
    ) { }
    upperName(): string {
        return this.nom.toUpperCase()
    }
    codeName(string: string): string {

        if (string.length == 0) {

        }
        else if (string.length > 10) {
            return string.substring(0, 10)
        } else {
            while(string.length < 10){
                string+= "x";
            }
        }
        return string;
    }
}

