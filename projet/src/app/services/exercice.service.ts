import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { Observable } from 'rxjs';
import { Exercice } from '../models/exercice';

@Injectable({
  providedIn: 'root'
})
export class ExerciceService {

  readonly ExerciceAPI = environment.apiUrl + "/exercises";

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Récupère tous les exercices.
   * @returns Un Observable émettant un tableau d'exercices.
   */
  getExercices(): Observable<Exercice[]> {
    return this.http.get<Exercice[]>(this.ExerciceAPI);
  }

  /**
   * Récupère un exercice par son ID.
   * @param id L'identifiant de l'exercice à récupérer.
   * @returns Un Observable émettant l'exercice correspondant à l'ID fourni.
   */
  getExercice(id: number): Observable<Exercice> {
    return this.http.get<Exercice>(`${this.ExerciceAPI}/${id}`);
  }

  /**
   * Récupère le dernier ID des d'exercices.
   * @returns Un number qui est le dernier ID des d'exercices.
   */
  getLastId(): number {
    let lastId = 0;
    let ObservableAction;
    ObservableAction = this.getExercices();
    ObservableAction.subscribe({
      next: (exerciceList: any) => {
        lastId = exerciceList.lenght;
      },
      error: (err: string) => {
      }
    })
    return lastId;
  }

  /**
   * Récupère les exercices par ID de routine.
   * @param routineId L'identifiant de la routine.
   * @returns Un Observable émettant un tableau d'exercices correspondant à l'ID de la routine fournie.
   */
  getExercicesByRoutineId(routineId: number): Observable<Exercice[]> {
    return this.http.get<Exercice[]>(`${this.ExerciceAPI}?routineId=${routineId}`);
  }

  /**
   * Ajoute un nouvel exercice.
   * @param nouvelleExercice Le nouvel exercice à ajouter.
   * @returns Un Observable émettant l'exercice ajouté.
   */
  addExercice(nouvelleExercice: Exercice): Observable<Exercice> {
    return this.http.post<Exercice>(this.ExerciceAPI, nouvelleExercice);
  }

  /**
   * Met à jour un exercice.
   * @param exercice L'exercice à mettre à jour.
   * @returns Un Observable émettant l'exercice mis à jour.
   */
  updateExercice(exercice: Exercice): Observable<Exercice> {
    return this.http.put<Exercice>(`${this.ExerciceAPI}/${exercice.id}`, exercice);
  }

  /**
   * Supprime un exercice.
   * @param exerciceId L'identifiant de l'exercice à supprimer.
   * @returns Un Observable émettant l'exercice supprimé.
   */
  deleteExercice(exerciceId: number): Observable<Exercice> {
    return this.http.delete<Exercice>(`${this.ExerciceAPI}/${exerciceId}`);
  }

  /**
   * Supprime les exercices par ID de routine.
   * @param routineId L'identifiant de la routine.
   * @returns Un Observable émettant un tableau d'exercices supprimés.
   */
  deleteExercicesByRoutine(routineId: number): Observable<Exercice[]> {
    return this.http.delete<Exercice[]>(`${this.ExerciceAPI}?routineId=${routineId}`);
  }
}