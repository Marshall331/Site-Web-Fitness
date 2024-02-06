import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EtatChargement } from 'src/app/models/chargement';
import { EtatRoutine, Routine } from 'src/app/models/routine';
import { RoutineService } from 'src/app/services/routine.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-routine-edit',
  templateUrl: './routine-edit.component.html',
  styleUrls: ['./routine-edit.component.css']
})
export class RoutineEditComponent {

  public routine: Routine = new Routine();
  readonly etatRoutine = EtatRoutine;
  public etatChargement = EtatChargement.ENCOURS;
  public showExerciceEdit: boolean = false;

  constructor(
    private routineService: RoutineService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  public onSubmit(leFormulaire: NgForm): void {
    if (leFormulaire.valid) {
      let ObservableAction;
      if (this.routine.id) {
        ObservableAction = this.routineService.updateRoutine(this.routine);
      } else {
        ObservableAction = this.routineService.addRoutine(this.routine);
      }
      ObservableAction.subscribe({
        next: (routine: any) => {
          Swal.fire(this.routine.id != 0 ? "Routine modifiée !" : "Routine ajoutée !", '', 'success');
          this.router.navigateByUrl('/').then(() => this.router.navigateByUrl("/routine/edit/" + this.routine.id));
        },
        error: (err: string) => {
          Swal.fire("Erreur lors de la sauvegarde.\nCode d'erreur : " + err)
          this.router.navigateByUrl('/').then(() => this.router.navigateByUrl("/routines"));
        }
      })
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.routine = new Routine()
    if (id) {
      this.routineService.getRoutine(id).subscribe(
        {
          next: (routine: Routine) => {
            this.routine = routine
            this.etatChargement = EtatChargement.FAIT
          },
          error: (err: any) => this.router.navigateByUrl('/routines')
        }
      )
    }
    else { this.etatChargement = EtatChargement.FAIT }
  }

  showExerciceAddForm() {
    this.showExerciceEdit = !this.showExerciceEdit;
  }
}