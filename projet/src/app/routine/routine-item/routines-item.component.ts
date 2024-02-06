import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Routine, EtatRoutine } from 'src/app/models/routine';
import { RoutineService } from 'src/app/services/routine.service';
import Swal from 'sweetalert2';

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
  ) {console.log(this.routine.name) }

  onCheckboxChange(event: any): void {
    this.checkboxChange.emit(event.target.checked);
  }

  updateStatus(event: any): void {
    if (event.target.checked) {
      this.routine.status = EtatRoutine.ACTIVE;
    }
    else {
      this.routine.status = EtatRoutine.INACTIVE;
    }
    let Observable = this.routineService.updateRoutine(this.routine);
    Observable.subscribe({
      error: err => {
        Swal.fire("Erreur lors de la sauvegarde.\nCode d'erreur : " + err, '', 'error')
      }
    })
    this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/routines'));
  }

  onSupprime(): void {
    Swal.fire({
      title: "Voulez vous réellement supprimer cette routine ?",
      showDenyButton: true,
      confirmButtonText: "Supprimer",
      denyButtonText: `Annuler`
    }).then((result) => {
      if (result.isConfirmed) {
        let Observable = this.routineService.deleteRoutine(this.routine);
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