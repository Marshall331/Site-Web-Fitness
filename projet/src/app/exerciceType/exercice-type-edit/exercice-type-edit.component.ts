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
  selector: 'app-exercice-type-edit',
  templateUrl: './exercice-type-edit.component.html',
  styleUrls: ['./exercice-type-edit.component.css']
})
export class ExerciceTypeEditComponent {

  @Input()
  public routineId: number = 0;
  @Input()
  public ajoutDansRoutine: boolean = false;
  public exerciceType: ExerciceTypes = new ExerciceTypes();
  public etatChargement = EtatChargement.ENCOURS;

  constructor(
    private exerciceTypeService: ExerciceTypesService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
  }

  public onSubmit(leFormulaire: NgForm): void {
    if (leFormulaire.valid) {
      let ObservableAction;
      if (this.exerciceType.id) {
        ObservableAction = this.exerciceTypeService.updateExerciceTypes(this.exerciceType);
      } else {
        ObservableAction = this.exerciceTypeService.addExerciceTypes(this.exerciceType);
      }
      ObservableAction.subscribe({
        next: (exercice: any) => {
          Swal.fire(this.exerciceType.id ? "Type d'exercice modifié !" : "Type d'exercice ajouté !", '', 'success');
          this.navigateBack();
        },
        error: (err: string) => {
          Swal.fire("Erreur lors de la sauvegarde.\nCode d'erreur : " + err)
        }
      })
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.exerciceType = new ExerciceTypes()
    if (id) {
      this.exerciceTypeService.getExerciceType(id).subscribe(
        {
          next: (exo: ExerciceTypes) => {
            this.exerciceType = exo
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
      this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/exercicetypes/' + this.routineId));
    } else {
      this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/exercicestypes'))
    }
  }
}