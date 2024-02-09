import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { EtatTache, Tache } from 'src/app/models/tache';
import { TacheService } from 'src/app/services/tache.service';

@Component({
  selector: 'app-tache-item',
  templateUrl: './tache-item.component.html',
  styleUrls: ['./tache-item.component.css']
})
export class TacheItemComponent {
  @Input()
  public tache:Tache = new Tache()
  readonly etatTache = EtatTache // transmettre l'enum au Template

  constructor(
    private tacheService : TacheService,
    private router       : Router
  ) {}

  onSupprime() : void {
    if ( confirm("Voulez-vous réellement supprimer cette tâche") ) {
      this.tacheService.deleteTache(this.tache).subscribe({
        next: t => {
          // this.router.navigateByUrl('/taches')
          this.router.navigateByUrl('/').then(()=>this.router.navigateByUrl('/taches'))
        }
      })
    }
  }
  onProgresse() : void {
    switch (this.tache.etat) {
      case EtatTache.AFAIRE:
        this.tache.etat = EtatTache.ENCOURS
        break;
        case EtatTache.ENCOURS:
          this.tache.etat = EtatTache.TERMINEE
          break;
    }
    this.tacheService.updateTache(this.tache).subscribe({
      next: t => this.tache = t
    })
  }
  onRegresse() : void {
    switch (this.tache.etat) {
      case EtatTache.TERMINEE:
        this.tache.etat = EtatTache.ENCOURS
        break;
        case EtatTache.ENCOURS:
          this.tache.etat = EtatTache.AFAIRE
          break;
    }
    this.tacheService.updateTache(this.tache).subscribe({
      next: t => this.tache = t
    })
   }

}
