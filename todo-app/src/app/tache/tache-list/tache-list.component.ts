import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { EtatChargement } from 'src/app/models/loader';
import { EtatTache, Tache } from 'src/app/models/tache';
import { TacheService } from 'src/app/services/tache.service';

@Component({
  selector: 'app-tache-list',
  templateUrl: './tache-list.component.html',
  styleUrls: ['./tache-list.component.css']
})
export class TacheListComponent {

  public taches! : Observable<Tache[]>
  public etat    : EtatChargement = EtatChargement.LOADING
  public etatTache = EtatTache

  public etatFiltrage: EtatTache|undefined
  public queryFiltrage: string = ""

  readonly etatChargement = EtatChargement

  constructor(
    private tacheService : TacheService
  ) { }

  ngOnInit() : void {
    console.log("init liste")
    const memoEtat = sessionStorage.getItem('appTodo.etat')
    const memoQuery = sessionStorage.getItem('appTodo.query')
    this.etatFiltrage  = memoEtat ? memoEtat as EtatTache : undefined
    this.queryFiltrage = memoQuery ? memoQuery : ""

    //this.taches = this.tacheService.getTaches()
    this.taches = this.tacheService.getFilteredTaches( this.etatFiltrage, this.queryFiltrage )
    this.taches.subscribe({
      next:  tab => this.etat = EtatChargement.LOADED,
      error: err => this.etat = EtatChargement.ERROR
    })
  }

  onRecherche(frm: NgForm) {
    const etatSouhaite : EtatTache|undefined = (frm.value.etat ? frm.value.etat : undefined)
    const query = frm.value.txt

    if (etatSouhaite) {
      sessionStorage['appTodo.etat'] = etatSouhaite
    } else {
      sessionStorage.removeItem('appTodo.etat')
    }
    sessionStorage['appTodo.query'] = query


    this.taches = this.tacheService.getFilteredTaches( etatSouhaite, query )
  }
  onRAZ(frm: NgForm) {
    sessionStorage.removeItem('appTodo.etat')
    sessionStorage.removeItem('appTodo.query')

    frm.controls['txt' ].setValue( this.queryFiltrage = "" )
    frm.controls['etat'].setValue( this.etatFiltrage  = undefined )

    this.taches = this.tacheService.getFilteredTaches( this.etatFiltrage, this.queryFiltrage )
  }

}
