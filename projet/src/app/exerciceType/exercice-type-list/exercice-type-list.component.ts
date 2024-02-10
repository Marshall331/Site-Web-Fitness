import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EtatChargement } from 'src/app/models/chargement';
import Swal from 'sweetalert2';
import { ExerciceTypesService } from 'src/app/services/exercice-types.service';
import { ExerciceTypes } from 'src/app/models/exercice-types';

@Component({
  selector: 'app-exercice-type-list',
  templateUrl: './exercice-type-list.component.html',
  styleUrls: ['./exercice-type-list.component.css']
})
export class ExerciceTypeListComponent implements OnInit {

  public selectAllChecked: boolean = false;
  public selectedExercicesStates: Map<number, boolean> = new Map<number, boolean>();
  public selectedExercicesTypesIds: number[] = [];
  public recherche: string = "";
  public exercicesTypes!: Observable<ExerciceTypes[]>;
  public exerciceTypesList: ExerciceTypes[] = [];
  public exerciceTypesBySearch: ExerciceTypes[] = [];
  public etatChargement: EtatChargement = EtatChargement.ENCOURS;
  public valBarreChargement!: number;

  constructor(
    private exerciceTypeService: ExerciceTypesService,
    private router: Router,
  ) {
    this.recherche = sessionStorage['rechercheExerciceType'] || "";
  }

  ngOnInit(): void {
    this.startLoadingAnimation();
    let observable;
    observable = this.exerciceTypeService.getExercicesTypes();
    observable.subscribe({
      next: exercicesType => {
        this.exerciceTypesList = exercicesType;
        this.subscribeToExercicesTypes();
        this.playEndProgressBar(EtatChargement.FAIT);
      },
      error: err => {
        this.playEndProgressBar(EtatChargement.ERREUR).then(() => {
          Swal.fire('Erreur', 'Une erreur est survenue lors de la récupération des types d\'exercices.', 'error')
        });
      }
    });
    this.exerciceTypesBySearch = this.exerciceTypesList;
  }

  /**
   * Met à jour la recherche lorsqu'un utilisateur effectue une recherche.
   * @param $event L'événement de recherche.
   */
  updateRecherche($event: Event) {
    this.recherche = $event.toString();
    sessionStorage['rechercheExerciceType'] = this.recherche;
    this.subscribeToExercicesTypes();
  }

  /**
   * Souscrit aux types d'exercices en fonction de la recherche et filtre les résultats.
   */
  private subscribeToExercicesTypes() {
    this.exerciceTypesBySearch = this.filtrerExercices(this.exerciceTypesList);
  }

  /**
   * Vérifie si un type d'exercice est sélectionné.
   * @param exerciceId L'identifiant du type d'exercice.
   * @returns True si le type d'exercice est sélectionné, sinon False.
   */
  isTaskSelected(exerciceId: number): boolean {
    return this.selectedExercicesTypesIds.includes(exerciceId);
  }

  /**
   * Filtre les types d'exercices en fonction de la recherche.
   * @param exerciceList La liste des types d'exercices à filtrer.
   * @returns La liste des types d'exercices filtrés.
   */
  private filtrerExercices(exerciceList: ExerciceTypes[]): ExerciceTypes[] {
    return exerciceList.filter(exercice => this.isRechercheMatch(exercice));
  }

  /**
   * Vérifie si un type d'exercice correspond à la recherche.
   * @param exercice Le type d'exercice à vérifier.
   * @returns True si le type d'exercice correspond à la recherche, sinon False.
   */
  private isRechercheMatch(exercice: ExerciceTypes): boolean {
    const rechercheLower = this.recherche.toLowerCase().replace(/\s/g, '');
    const exerciceNomSansEspaces = exercice.name.toLowerCase().replace(/\s/g, '');

    return (
      exerciceNomSansEspaces.includes(rechercheLower)
    );
  }

  /**
   * Bascule la sélection de tous les types d'exercices.
   */
  toggleSelectAll() {
    this.selectedExercicesTypesIds = [];

    for (const exo of this.exerciceTypesBySearch) {
      this.selectedExercicesStates.set(exo.id, this.selectAllChecked);
      if (this.selectAllChecked) {
        this.selectedExercicesTypesIds.push(exo.id);
      }
    }
  }

  /**
   * Gère le changement de sélection d'un type d'exercice.
   * @param isSelected Indique si le type d'exercice est sélectionné.
   * @param exerciceId L'identifiant du type d'exercice.
   */
  onTaskCheckboxChange(isSelected: boolean, exerciceId: number): void {
    if (isSelected) {
      this.selectedExercicesTypesIds.push(exerciceId);
    } else {
      const index = this.selectedExercicesTypesIds.indexOf(exerciceId);
      if (index !== -1) {
        this.selectedExercicesTypesIds.splice(index, 1);
      }
    }
  }

  /**
   * Supprime les types d'exercices sélectionnés.
   */
  onSupprime(): void {
    Swal.fire({
      title: 'Voulez-vous réellement supprimer ces types d\'exercices ?',
      showDenyButton: true,
      confirmButtonText: 'Supprimer',
      denyButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.startLoadingAnimation();
        this.deletePlusieursExerciceType();
      } else if (result.isDenied) {
        Swal.fire('Suppression annulée', '', 'info');
      }
    });
  }

  private deletePlusieursExerciceType(): void {
    const id = this.selectedExercicesTypesIds[0];
    this.selectedExercicesTypesIds.splice(0, 1);
    if (id) {
      const deleteObservable = this.exerciceTypeService.deleteExerciceTypes(id);
      deleteObservable.subscribe({
        error: (err) => {
          this.playEndProgressBar(EtatChargement.ERREUR);
        },
        complete: () => {
          if (this.selectedExercicesTypesIds.length == 0) {
            this.playEndProgressBar(EtatChargement.FAIT).then(() => {
              Swal.fire('Types d\'exercices supprimés !', '', 'success');
              this.redirectToExercicesTypes();
            });
          } else {
            this.deletePlusieursExerciceType();
          }
        }
      });
    }
  }

  /**
   * Redirige vers la page des types d'exercices après la suppression.
   */
  private redirectToExercicesTypes(): void {
    this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('exercicestypes'));
  }

  /**
   * Affiche la barre de progression de chargement.
   * @param loadingState L'état de chargement.
   * @returns Une promesse résolue lorsque la barre de progression est complète.
   */
  private playEndProgressBar(loadingState: EtatChargement): Promise<void> {
    return new Promise((resolve) => {
      this.valBarreChargement = 100;
      setTimeout(() => {
        this.etatChargement = loadingState;
        resolve();
      }, 50);
    });
  }

  /**
   * Initialise l'animation de chargement.
   */
  private startLoadingAnimation() {
    this.valBarreChargement = Math.random() * 100;
    this.etatChargement = EtatChargement.ENCOURS;
  }
}