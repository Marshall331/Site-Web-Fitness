import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { Observable } from 'rxjs';
import { ExerciceTypes } from '../models/exercice-types';

@Injectable({
  providedIn: 'root'
})
export class ExerciceTypesService {

  readonly ExerciceTypesAPI = environment.apiUrl + "/exerciseTypes";

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Récupère tous les types d'exercices.
   */
  getExercicesTypes(): Observable<ExerciceTypes[]> {
    return this.http.get<ExerciceTypes[]>(this.ExerciceTypesAPI);
  }

  /**
   * Récupère un type d'exercice par son ID.
   * @param id L'identifiant du type d'exercice à récupérer.
   * @returns Un Observable émettant le type d'exercice correspondant à l'ID fourni.
   */
  getExerciceType(id: number): Observable<ExerciceTypes> {
    return this.http.get<ExerciceTypes>(`${this.ExerciceTypesAPI}/${id}`);
  }

  /**
   * Récupère le dernier ID des types d'exercices.
   * @returns Un number qui est le dernier ID des types d'exercices.
   */
  getLastId(): number {
    let lastId = 0;
    let ObservableAction;
    ObservableAction = this.getExercicesTypes();
    ObservableAction.subscribe({
      next: (ExerciceTypesList: any) => {
        lastId = ExerciceTypesList.lenght;
      },
      error: (err: string) => {
      }
    })
    return lastId;
  }

  /**
   * Ajoute un nouveau type d'exercice.
   * @param nouvelleExerciceTypes Le nouveau type d'exercice à ajouter.
   * @returns Un Observable émettant le type d'exercice ajouté.
   */
  addExerciceTypes(nouvelleExerciceTypes: ExerciceTypes): Observable<ExerciceTypes> {
    return this.http.post<ExerciceTypes>(this.ExerciceTypesAPI, nouvelleExerciceTypes);
  }

  /**
   * Met à jour un type d'exercice.
   * @param exerciceType Le type d'exercice à mettre à jour.
   * @returns Un Observable émettant le type d'exercice mis à jour.
   */
  updateExerciceTypes(exerciceType: ExerciceTypes): Observable<ExerciceTypes> {
    return this.http.put<ExerciceTypes>(`${this.ExerciceTypesAPI}/${exerciceType.id}`, exerciceType);
  }

  /**
   * Supprime un type d'exercice.
   * @param exerciceTypeId L'identifiant du type d'exercice à supprimer.
   * @returns Un Observable émettant le type d'exercice supprimé.
   */
  deleteExerciceTypes(exerciceTypeId: number): Observable<ExerciceTypes> {
    return this.http.delete<ExerciceTypes>(`${this.ExerciceTypesAPI}/${exerciceTypeId}`);
  }
}
