import { Injectable } from '@angular/core';
import { Tache } from '../models/tache';
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

  getRoutines(): Observable<Routine[]> {
    return this.http.get<Routine[]>(this.routineAPI);
  }

  getRoutine(id: number): Observable<Routine> {
    return this.http.get<Routine>(this.routineAPI + "/" + id);
  }

  addRoutine(nouvelleRoutine: Routine): Observable<Routine> {
    return this.http.post<Routine>(this.routineAPI, nouvelleRoutine);
  }

  updateRoutine(routine: Routine): Observable<Routine> {
    return this.http.put<Routine>(this.routineAPI + '/' + routine.id, routine)
  }

  deleteRoutine(routine: Routine): Observable<Routine> {
    return this.http.delete<Routine>(this.routineAPI + '/' + routine.id)
  }

  deleteMultipleRoutines(routinesIds: number[]): Observable<void[]> {
    const deleteRequests: Observable<void>[] = [];

    routinesIds.forEach(routinesIds => {
      const deleteRequest = this.http.delete<void>(`${this.routineAPI}/${routinesIds}`);
      deleteRequests.push(deleteRequest);
    });

    return forkJoin(deleteRequests);
  }
}
