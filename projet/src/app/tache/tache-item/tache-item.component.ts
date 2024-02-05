import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { EtatTache, Tache } from 'src/app/models/tache';
import { TacheService } from 'src/app/services/tache.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tache-item',
  templateUrl: './tache-item.component.html',
  styleUrls: ['./tache-item.component.css']
})
export class TacheItemComponent {
  @Input()
  public tache: Tache = new Tache();
  readonly etatTache = EtatTache;

  @Input() isSelected: boolean = false;
  @Output() checkboxChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private tacheService: TacheService,
    private router: Router,
  ) { }

  onCheckboxChange(event: any): void {
    this.checkboxChange.emit(event.target.checked);
  }

  onProgress(): void {
    switch (this.tache.etat) {
      case EtatTache.AFAIRE:
        this.tache.etat = EtatTache.ENCOURS;
        break;
      case EtatTache.ENCOURS:
        this.tache.etat = EtatTache.TERMINEE;
    }
    this.updateTache();
  }

  onRegresse(): void {
    switch (this.tache.etat) {
      case EtatTache.TERMINEE:
        this.tache.etat = EtatTache.ENCOURS;
        break;
      case EtatTache.ENCOURS:
        this.tache.etat = EtatTache.AFAIRE;
        break;
    }
    this.updateTache();
  }

  private updateTache(): void {
    let Observable = this.tacheService.updateTache(this.tache);
    Observable.subscribe({
      error: err => {
        window.alert("Erreur lors de la sauvegarde.\nCode d'erreur : " + err)
      }
    })
    // this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/taches')); Inutile car s'il y avait de nombreuses taches, le fait que la page se recharge ne serait pas l'idéal
  }

  onSupprime(): void {
    Swal.fire({
      title: "Voulez vous réellement supprimer cette tâche ?",
      showDenyButton: true,
      confirmButtonText: "Supprimer",
      denyButtonText: `Annuler`
    }).then((result) => {
      if (result.isConfirmed) {
        let Observable = this.tacheService.deleteTache(this.tache);
        Observable.subscribe({
          next: tache => {
            Swal.fire("Tâche supprimée !", "", "success");
          },
          error: err => {
            window.alert("Erreur lors de la sauvegarde.\nCode d'erreur : " + err)
          }
        })
        this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/taches'));
      } else if (result.isDenied) {
        Swal.fire('Ok, on ne supprime pas', '', 'info');
      }
    });
  }
}