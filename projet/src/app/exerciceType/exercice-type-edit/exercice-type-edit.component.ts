import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EtatChargement } from 'src/app/models/chargement';
import { ExerciceTypes } from 'src/app/models/exercice-types';
import { ExerciceTypesService } from 'src/app/services/exercice-types.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-exercice-type-edit',
  templateUrl: './exercice-type-edit.component.html',
  styleUrls: ['./exercice-type-edit.component.css']
})
export class ExerciceTypeEditComponent implements OnInit {

  /**
   * Identifiant de la routine.
   */
  @Input()
  public routineId: number = 0;

  /**
   * Booléen indiquant si l'ajout se fait dans une routine.
   */
  @Input()
  public ajoutDansRoutine: boolean = false;

  /**
   * Objet représentant le type d'exercice.
   */
  public exerciceType: ExerciceTypes = new ExerciceTypes();

  /**
   * État de chargement de la page.
   */
  public etatChargement = EtatChargement.ENCOURS;

  /**
   * Constructeur du composant ExerciceTypeEditComponent.
   * @param exerciceTypeService Service permettant de gérer les types d'exercices.
   * @param router Service de routage pour la navigation dans l'application.
   * @param route Service qui permet de récupérer les informations de la route active.
   */
  constructor(
    private exerciceTypeService: ExerciceTypesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /**
   * Méthode appelée lors de la soumission du formulaire.
   * Valide le formulaire et effectue l'action appropriée (ajout ou mise à jour).
   * @param leFormulaire Formulaire NgForm
   */
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

  /**
   * Méthode appelée lors de l'initialisation du composant.
   * Récupère l'identifiant du type d'exercice depuis la route et charge ses détails si disponible.
   */
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

  /**
   * Navigue en arrière selon le contexte de l'ajout ou de la modification.
   */
  private navigateBack(): void {
    if (this.ajoutDansRoutine) {
      this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/exercicetypes/' + this.routineId));
    } else {
      this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/exercicestypes'))
    }
  }
}