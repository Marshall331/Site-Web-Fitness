import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Routine, EtatRoutine } from 'src/app/models/routine';
import { RoutineService } from 'src/app/services/routine.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-routines-item',
  templateUrl: './routines-item.component.html',
  styleUrls: ['./routines-item.component.css']
})
export class RoutineItemComponent implements OnInit {

  /**
   * Indique si la routine est sélectionnée.
   */
  @Input() isSelected: boolean = false;

  /**
   * Émetteur d'événements pour le changement de la case à cocher.
   */
  @Output() checkboxChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * La routine à afficher.
   */
  @Input() public routine: Routine = new Routine();

  /**
   * Le nombre d'exercices dans la routine.
   */
  @Input() exercicesCount: number = 0;

  /**
   * Énumération des états de routine.
   */
  readonly etatRoutine = EtatRoutine;

  /**
   * Indique si la routine est terminée.
   */
  public isRoutineDone!: boolean;

  constructor(
    private routineService: RoutineService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.initializeRoutine();
  }

  /**
   * Initialise l'état de la routine.
   */
  private initializeRoutine(): void {
    const routinesDoneIds = JSON.parse(localStorage.getItem('routinesDoneIds') || '[]') as number[];
    const index = routinesDoneIds.indexOf(this.routine.id);
    if (index !== -1) {
      this.isRoutineDone = true;
    }
  }

  /**
   * Met à jour l'état de la routine.
   */
  updateRoutineDoneStatus() {
    if (this.routine.id) {
      const routinesDoneIds = JSON.parse(localStorage.getItem('routinesDoneIds') || '[]') as number[];
      const index = routinesDoneIds.indexOf(this.routine.id);
      if (index === -1) {
        routinesDoneIds.push(this.routine.id);
        localStorage.setItem('routinesDoneIds', JSON.stringify(routinesDoneIds));
        this.isRoutineDone = true;
      } else {
        routinesDoneIds.splice(index, 1);
        localStorage.setItem('routinesDoneIds', JSON.stringify(routinesDoneIds));
        this.isRoutineDone = false;
      }
    }
  }

  /**
   * Gère le changement de la case à cocher.
   */
  onCheckboxChange(event: any): void {
    this.checkboxChange.emit(event.target.checked);
  }

  /**
   * Met à jour l'état de la routine.
   */
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
        Swal.fire("Erreur lors de la sauvegarde.\nCode d'erreur : " + err, '', 'error');
      }
    });
    this.redirectToRoutines();
  }

  /**
   * Supprime la routine.
   */
  onSupprime(): void {
    Swal.fire({
      title: "Voulez-vous réellement supprimer cette routine ?",
      showDenyButton: true,
      confirmButtonText: "Supprimer",
      denyButtonText: `Annuler`
    }).then((result) => {
      if (result.isConfirmed) {
        let Observable = this.routineService.deleteRoutine(this.routine.id);
        Observable.subscribe({
          next: routine => {
            Swal.fire("Routine supprimée !", "", "success");
          },
          error: err => {
            Swal.fire("Erreur lors de la sauvegarde.", '', 'error');
          }
        });
        this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/routines'));
      } else if (result.isDenied) {
        Swal.fire('Suppression annulée.', '', 'info');
      }
    });
  }

  // Nouvelle méthode pour rediriger vers la page '/routines'
  private redirectToRoutines(): void {
    this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/routines'));
  }
}