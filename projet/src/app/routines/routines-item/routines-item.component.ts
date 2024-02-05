import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Routine, EtatRoutine } from 'src/app/models/routine';
import { RoutineService } from 'src/app/services/routine.service';
import Swal from 'sweetalert2';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-routines-item',
  templateUrl: './routines-item.component.html',
  styleUrls: ['./routines-item.component.css']
})
export class RoutineItemComponent {
  @Input()
  public routine: Routine = new Routine();
  readonly etatRoutine = EtatRoutine;
  
  @Input() isSelected: boolean = false;
  @Output() checkboxChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private routineService: RoutineService,
    private router: Router,
  ) { }

  onCheckboxChange(event: any): void {
    this.checkboxChange.emit(event.target.checked);
  }

  onProgress(): void {
    // switch (this.routine.status) {
    //   case EtatRoutine.INACTIVE:
    //     this.tache.etat = EtatRouti;
    //     break;
    //   case EtatRoutine.ACTIVE:
    //     this.tache.etat = EtatTache.TERMINEE;
    // }
    // this.updateTache();
  }

  updateStatus($event:Event): void {
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
    let Observable = this.routineService.updateTache(this.routine);
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
        let Observable = this.routineService.deleteTache(this.routine);
        Observable.subscribe({
          next: routine => {
            Swal.fire("Routine supprimée !", "", "success");
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