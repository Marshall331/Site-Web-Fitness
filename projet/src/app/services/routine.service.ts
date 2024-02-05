import { Injectable } from '@angular/core';
import { Tache, EtatTache } from '../models/tache';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { Observable, forkJoin } from 'rxjs';
import { Routine } from '../models/routine';

@Injectable({
  providedIn: 'root'
})
export class RoutineService {

  readonly routineAPI = environment.apiUrl + "/routines"

  constructor(
    private http: HttpClient
  ) { }

  getTaches(): Observable<Routine[]> {
    return this.http.get<Routine[]>(this.routineAPI);
  }

  getTache(id: number): Observable<Routine> {
    return this.http.get<Routine>(this.routineAPI + "/" + id);
  }

  addTache(nouvelleRoutine: Tache): Observable<Tache> {
    return this.http.post<Tache>(this.routineAPI, nouvelleRoutine);
  }

  updateTache(routine: Routine): Observable<Routine> {
    return this.http.put<Routine>(this.routineAPI + '/' + routine.id, routine)
  }

  deleteTache(routine: Routine): Observable<Routine> {
    return this.http.delete<Routine>(this.routineAPI + '/' + routine.id)
  }

  deleteMultipleTaches(taskIds: number[]): Observable<void[]> {
    const deleteRequests: Observable<void>[] = [];

    taskIds.forEach(taskId => {
      const deleteRequest = this.http.delete<void>(`${this.routineAPI}/${taskId}`);
      deleteRequests.push(deleteRequest);
    });

    return forkJoin(deleteRequests);
  }
}
