import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { Observable, forkJoin, map } from 'rxjs';
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

  addExercice(nouvelleExercice: Exercice): Observable<Exercice> {
    return this.http.post<Exercice>(this.ExerciceAPI, nouvelleExercice);
  }

  updateExercice(Exercice: Exercice): Observable<Exercice> {
    return this.http.put<Exercice>(this.ExerciceAPI + '/' + Exercice.id, Exercice)
  }

  deleteExercice(Exercice: Exercice): Observable<Exercice> {
    return this.http.delete<Exercice>(this.ExerciceAPI + '/' + Exercice.id)
  }

  deleteMultipleExercices(ExercicesIds: number[]): Observable<void[]> {
    const deleteRequests: Observable<void>[] = [];

    ExercicesIds.forEach(ExercicesIds => {
      const deleteRequest = this.http.delete<void>(`${this.ExerciceAPI}/${ExercicesIds}`);
      deleteRequests.push(deleteRequest);
    });

    return forkJoin(deleteRequests);
  }
}
