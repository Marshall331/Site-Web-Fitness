import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { EtatTache, Tache } from '../models/tache';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TacheService {

  readonly tacheAPI = environment.apiUrl+"/taches"

  constructor(
    private http:HttpClient
  ) { }

  getTaches() : Observable<Tache[]> {
    return this.http.get<Tache[]>(this.tacheAPI)
  }
  getTache( id:number ) : Observable<Tache> {
    return this.http.get<Tache>(this.tacheAPI+"/"+id)
  }
  getFilteredTaches(
    etat:EtatTache|undefined,
    info:string|undefined) : Observable<Tache[]>
  {
    const tabQueries:string[] = []
    if (etat) {
      tabQueries.push( 'etat='+etat )
    }
    if (info) {
      tabQueries.push( 'q='+info)
    }
    return this.http.get<Tache[]>(this.tacheAPI+'?'+tabQueries.join('&'))
  }
  addTache( nouvelleTache:Tache ) : Observable<Tache> {
    return this.http.post<Tache>(this.tacheAPI, nouvelleTache)
  }
  updateTache(tache: Tache) : Observable<Tache> {
    return this.http.put<Tache>(this.tacheAPI+'/'+tache.id, tache)
  }
  deleteTache(tache: Tache)  : Observable<Tache> {
    return this.http.delete<Tache>(this.tacheAPI+'/'+tache.id)
  }

}
