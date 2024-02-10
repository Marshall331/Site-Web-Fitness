import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { Observable, forkJoin } from 'rxjs';
import { Routine } from '../models/routine';
import { ExerciceService } from './exercice.service';

@Injectable({
  providedIn: 'root'
})
export class RoutineService {

  readonly routineAPI = environment.apiUrl + "/routines";

  constructor(
    private http: HttpClient,
    private exerciceService: ExerciceService
  ) { }

  /**
   * Récupère toutes les routines.
   * @returns Un Observable émettant un tableau de routines.
   */
  getRoutines(): Observable<Routine[]> {
    return this.http.get<Routine[]>(this.routineAPI);
  }

  /**
   * Récupère une routine par son ID.
   * @param id L'identifiant de la routine à récupérer.
   * @returns Un Observable émettant la routine correspondant à l'ID fourni.
   */
  getRoutine(id: number): Observable<Routine> {
    return this.http.get<Routine>(`${this.routineAPI}/${id}`);
  }

  /**
   * Ajoute une nouvelle routine.
   * @param nouvelleRoutine La nouvelle routine à ajouter.
   * @returns Un Observable émettant la routine ajoutée.
   */
  addRoutine(nouvelleRoutine: Routine): Observable<Routine> {
    return this.http.post<Routine>(this.routineAPI, nouvelleRoutine);
  }

  /**
   * Met à jour une routine.
   * @param routine La routine à mettre à jour.
   * @returns Un Observable émettant la routine mise à jour.
   */
  updateRoutine(routine: Routine): Observable<Routine> {
    return this.http.put<Routine>(`${this.routineAPI}/${routine.id}`, routine);
  }

  /**
   * Supprime une routine.
   * @param id L'identifiant de la routine à supprimer.
   * @returns Un Observable émettant la routine supprimée.
   */
  deleteRoutine(id: number): Observable<Routine> {
    this.exerciceService.deleteExercicesByRoutine(id);
    return this.http.delete<Routine>(`${this.routineAPI}/${id}`);
  }
}
