import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { Observable, forkJoin, last, map } from 'rxjs';
import { ExerciceTypes } from '../models/exercice-types';

@Injectable({
  providedIn: 'root'
})
export class ExerciceTypesService {

  readonly ExerciceTypesAPI = environment.apiUrl + "/exerciseTypes"

  constructor(
    private http: HttpClient
  ) { }

  getExercicesTypes(): Observable<ExerciceTypes[]> {
    return this.http.get<ExerciceTypes[]>(this.ExerciceTypesAPI);
  }

  getExerciceType(id: number): Observable<ExerciceTypes> {
    return this.http.get<ExerciceTypes>(this.ExerciceTypesAPI + "/" + id);
  }

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

  addExerciceTypes(nouvelleExerciceTypes: ExerciceTypes): Observable<ExerciceTypes> {
    return this.http.post<ExerciceTypes>(this.ExerciceTypesAPI, nouvelleExerciceTypes);
  }

  updateExerciceTypes(ExerciceTypes: ExerciceTypes): Observable<ExerciceTypes> {
    return this.http.put<ExerciceTypes>(this.ExerciceTypesAPI + '/' + ExerciceTypes.id, ExerciceTypes)
  }

  deleteExerciceTypes(ExerciceTypesId: number): Observable<ExerciceTypes> {
    return this.http.delete<ExerciceTypes>(this.ExerciceTypesAPI + '/' + ExerciceTypesId)
  }

  // deleteMultipleExerciceTypess(ExerciceTypessIds: number[]): Observable<ExerciceTypes[]> {
  //   const deleteRequests: Observable<ExerciceTypes>[] = [];

  //   ExerciceTypessIds.forEach(ExerciceTypessIds => {
  //     return this.deleteExerciceTypes(ExerciceTypessIds);
  //   });

  //   console.log(deleteRequests)
  //   return forkJoin(deleteRequests);
  // }
}
