import { Component, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EtatChargement } from 'src/app/models/chargement';
import { Exercice } from 'src/app/models/exercice';
import { ExerciceTypes } from 'src/app/models/exercice-types';
import { ExerciceTypesService } from 'src/app/services/exercice-types.service';
import { ExerciceService } from 'src/app/services/exercice.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-exercice-edit',
  templateUrl: './exercice-edit.component.html',
  styleUrls: ['./exercice-edit.component.css']
})
export class ExerciceEditComponent {

  @Input()
  public routineId: number = 0;
  @Input()
  public ajoutDansRoutine: boolean = false;
  public exercice: Exercice = new Exercice();
  public etatChargement = EtatChargement.ENCOURS;
  public exerciceList!: Exercice[];
  public exerciceTypesList!: ExerciceTypes[];

  constructor(
    private exerciceService: ExerciceService,
    private exerciceTypesService: ExerciceTypesService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  public onSubmit(leFormulaire: NgForm): void {
    if (leFormulaire.valid) {
      let ObservableAction;
      this.exercice.routineId = this.routineId;
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
    const id = this.route.snapshot.params['id'];
    this.exercice = new Exercice()
    if (id && !this.ajoutDansRoutine) {
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
    if (this.ajoutDansRoutine) {
      this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/routine/' + this.routineId));
    } else {
      this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/exercices'))
    }
  }
}