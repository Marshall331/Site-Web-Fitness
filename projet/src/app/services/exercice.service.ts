import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { Observable, forkJoin, last, map } from 'rxjs';
import { Exercice } from '../models/exercice';

@Injectable({
  providedIn: 'root'
})
export class ExerciceService {

  readonly ExerciceAPI = environment.apiUrl + "/exercises"

  constructor(
    private http: HttpClient
  ) { }

  getExercices(): Observable<Exercice[]> {
    return this.http.get<Exercice[]>(this.ExerciceAPI);
  }

  getExercice(id: number): Observable<Exercice> {
    return this.http.get<Exercice>(this.ExerciceAPI + "/" + id);
  }

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

  getExercicesByRoutineId(routineId: number): Observable<Exercice[]> {
    return this.http.get<Exercice[]>(this.ExerciceAPI + '?routineId=' + routineId);
  }

  addExercice(nouvelleExercice: Exercice): Observable<Exercice> {
    return this.http.post<Exercice>(this.ExerciceAPI, nouvelleExercice);
  }

  updateExercice(Exercice: Exercice): Observable<Exercice> {
    return this.http.put<Exercice>(this.ExerciceAPI + '/' + Exercice.id, Exercice)
  }

  deleteExercice(ExerciceId: number): Observable<Exercice> {
    return this.http.delete<Exercice>(this.ExerciceAPI + '/' + ExerciceId)
  }

  deleteExercicesByRoutine(routineId: number): Observable<Exercice[]> {
    return this.http.delete<Exercice[]>(this.ExerciceAPI + '?routineId=' + routineId);
  }

  // deleteMultipleExercices(ExercicesIds: number[]): Observable<Exercice[]> {
  //   const deleteRequests: Observable<Exercice>[] = [];

  //   ExercicesIds.forEach(ExercicesIds => {
  //     return this.deleteExercice(ExercicesIds);
  //   });

  //   console.log(deleteRequests)
  //   return forkJoin(deleteRequests);
  // }
}
