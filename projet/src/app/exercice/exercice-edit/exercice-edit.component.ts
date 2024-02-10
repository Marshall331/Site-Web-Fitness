/**
 * Composant pour l'édition et l'ajout d'un exercice.
 */
import { Component, Input, OnInit } from '@angular/core';
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
export class ExerciceEditComponent implements OnInit {

  @Input()
  public isAddingInRoutine: boolean = false; // Indique si l'exercice est en cours d'ajout dans une routine
  @Input()
  public routineId: number = -1; // ID de la routine associée à l'exercice (par défaut à -1)

  public exercice: Exercice = new Exercice(); // Exercice en cours d'édition ou d'ajout
  public exerciceList!: Exercice[]; // Liste des exercices
  public exerciceTypesList!: ExerciceTypes[]; // Liste des types d'exercices
  public routinesList: Routine[] = []; // Liste des routines
  public etatChargement = EtatChargement.ENCOURS; // État de chargement de la page

  /**
   * Constructeur de ExerciceEditComponent.
   * @param routineService Le service pour la gestion des routines
   * @param exerciceService Le service pour la gestion des exercices
   * @param exerciceTypesService Le service pour la gestion des types d'exercices
   * @param router Le routeur pour la navigation
   * @param route La route pour récupérer les paramètres de la route
   */
  constructor(
    private routineService: RoutineService,
    private exerciceService: ExerciceService,
    private exerciceTypesService: ExerciceTypesService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  /**
   * Méthode appelée lors de la soumission du formulaire d'édition/ajout d'exercice.
   * @param leFormulaire Le formulaire NgForm contenant les données de l'exercice
   */
  public onSubmit(leFormulaire: NgForm): void {
    if (leFormulaire.valid) {
      let observableAction;
      if (this.routineId != -1) {
        this.exercice.routineId = this.routineId;
      }
      if (this.exercice.id) {
        observableAction = this.exerciceService.updateExercice(this.exercice);
      } else {
        observableAction = this.exerciceService.addExercice(this.exercice);
      }
      observableAction.subscribe({
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

  /**
   * Hook de cycle de vie appelé après que Angular ait initialisé toutes les propriétés liées aux données d'une directive.
   */
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

  /**
   * Méthode privée pour naviguer en arrière après l'édition ou l'ajout de l'exercice.
   */
  private navigateBack(): void {
    if (this.routineId > 0) {
      this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/routine/' + this.routineId));
    } else {
      this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/exercices'))
    }
  }
}