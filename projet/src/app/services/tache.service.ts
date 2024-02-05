import { Injectable } from '@angular/core';
import { Tache, EtatTache } from '../models/tache';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { Observable, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TacheService {

  readonly tacheAPI = environment.apiUrl + "/taches"

  constructor(
    private http: HttpClient
  ) { }

  getTaches(): Observable<Tache[]> {
    return this.http.get<Tache[]>(this.tacheAPI);
  }

  getTache(id: number): Observable<Tache> {
    return this.http.get<Tache>(this.tacheAPI + "/" + id);
  }

  addTache(nouvelleTache: Tache): Observable<Tache> {
    return this.http.post<Tache>(this.tacheAPI, nouvelleTache);
  }

  updateTache(tache: Tache): Observable<Tache> {
    return this.http.put<Tache>(this.tacheAPI + '/' + tache.id, tache)
  }

  deleteTache(tache: Tache): Observable<Tache> {
    return this.http.delete<Tache>(this.tacheAPI + '/' + tache.id)
  }

  deleteMultipleTaches(taskIds: number[]): Observable<void[]> {
    const deleteRequests: Observable<void>[] = [];

    // Iterate over the array of task IDs and create a delete request for each
    taskIds.forEach(taskId => {
      const deleteRequest = this.http.delete<void>(`${this.tacheAPI}/${taskId}`);
      deleteRequests.push(deleteRequest);
    });

    // Use forkJoin to execute all delete requests in parallel
    return forkJoin(deleteRequests);
  }
}
