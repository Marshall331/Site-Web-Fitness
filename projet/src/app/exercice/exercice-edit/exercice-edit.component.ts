import { Component, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EtatChargement } from 'src/app/models/chargement';
import { Exercice } from 'src/app/models/exercice';
import { ExerciceTypes } from 'src/app/models/exercice-types';
import { Routine } from 'src/app/models/routine';
import { ExerciceTypesService } from 'src/app/services/exercice-types.service';
import { ExerciceService } from 'src/app/services/exercice.service';
import { RoutineService } from 'src/app/services/routine.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-exercice-edit',
  templateUrl: './exercice-edit.component.html',
  styleUrls: ['./exercice-edit.component.css']
})
export class ExerciceEditComponent {

  @Input()
  public isAddingInRoutine: boolean = false;
  @Input()
  public routineId: number = -1;
  public exercice: Exercice = new Exercice();
  public exerciceList!: Exercice[];
  public exerciceTypesList!: ExerciceTypes[];
  public routinesList: Routine[] = [];
  public etatChargement = EtatChargement.ENCOURS;

  constructor(
    private routineService: RoutineService,
    private exerciceService: ExerciceService,
    private exerciceTypesService: ExerciceTypesService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  public onSubmit(leFormulaire: NgForm): void {
    if (leFormulaire.valid) {
      let ObservableAction;
      if (this.routineId != -1) {
        this.exercice.routineId = this.routineId;
      }
      if (this.exercice.id) {
        ObservableAction = this.exerciceService.updateExercice(this.exercice);
      } else {
        ObservableAction = this.exerciceService.addExercice(this.exercice);
      }
      ObservableAction.subscribe({
        next: (exercice: any) => {
          Swal.fire(this.exercice.id ? "Exercice modifié !" : "Exercice ajouté !", '', 'success');
          this.navigateBack();
        },
        error: (err: string) => {
          Swal.fire("Erreur lors de la sauvegarde.\nCode d'erreur : " + err)
        }
      })
    }
  }

  ngOnInit(): void {
    let observableAction = this.exerciceTypesService.getExercicesTypes();
    observableAction.subscribe({
      next: exercicesTypes => {
        this.exerciceTypesList = exercicesTypes;
      },
      error: err => {
        Swal.fire('Erreur', 'Une erreur est survenue lors de la récupération des types d\'exercices.', 'error')
        this.navigateBack();
      }
    });
    const routine = this.route.snapshot.params['routineId'];
    if (this.routineId == -1 && routine) {
      this.routineId = routine;
    }
    console.log(this.routineId)
    let observable = this.routineService.getRoutines();
    observable.subscribe({
      next: routine => {
        this.routinesList = routine;
      },
      error: err => {
        Swal.fire('Erreur', 'Une erreur est survenue lors de la récupération des routines.', 'error')
        this.router.navigateByUrl('/routines');
      }
    });
    const id = this.route.snapshot.params['idExo'];
    this.exercice = new Exercice()
    if (id && this.routineId) {
      this.exerciceService.getExercice(id).subscribe(
        {
          next: (exo: Exercice) => {
            this.exercice = exo
            this.etatChargement = EtatChargement.FAIT
          },
          error: (err: any) => {
            this.navigateBack();
          }
        }
      )
    }
    else { this.etatChargement = EtatChargement.FAIT }
  }

  private navigateBack(): void {
    if (this.routineId > 0) {
      this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/routine/' + this.routineId));
    } else {
      this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/exercices'))
    }
  }
}