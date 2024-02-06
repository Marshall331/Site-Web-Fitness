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

  constructor(
    private exerciceTypeService: ExerciceTypesService,
    private router: Router,
  ) {
    this.recherche = sessionStorage['rechercheExerciceType'] || "";
  }

  ngOnInit(): void {
    let observable;
    observable = this.exerciceTypeService.getExercicesTypes();
    observable.subscribe({
      next: exercicesType => {
        this.exerciceTypesList = exercicesType;
        this.subscribeToExercicesTypes();
        this.etatChargement = EtatChargement.FAIT;
      },
      error: err => {
        Swal.fire('Erreur', 'Une erreur est survenue lors de la récupération des types d\'exercices.', 'error')
        this.navigateBack();
      }
    });
    this.exerciceTypesBySearch = this.exerciceTypesList;
  }


  updateRecherche($event: Event) {
    this.recherche = $event.toString();
    sessionStorage['rechercheExerciceType'] = this.recherche;
    this.subscribeToExercicesTypes();
    console.log(this.selectedExercicesTypesIds)

  }

  private subscribeToExercicesTypes() {
    this.exerciceTypesBySearch = this.filtrerExercices(this.exerciceTypesList);
  }

  isTaskSelected(exerciceId: number): boolean {
    return this.selectedExercicesTypesIds.includes(exerciceId);
  }

  private filtrerExercices(exerciceList: ExerciceTypes[]): ExerciceTypes[] {
    return exerciceList.filter(exercice => this.isRechercheMatch(exercice));
  }

  private isRechercheMatch(exercice: ExerciceTypes): boolean {
    const rechercheLower = this.recherche.toLowerCase().replace(/\s/g, '');
    const exerciceNomSansEspaces = exercice.name.toLowerCase().replace(/\s/g, '');

    return (
      exerciceNomSansEspaces.includes(rechercheLower)
    );
  }

  toggleSelectAll() {
    this.selectedExercicesTypesIds = [];

    for (const exo of this.exerciceTypesBySearch) {
      this.selectedExercicesStates.set(exo.id, this.selectAllChecked);
      if (this.selectAllChecked) {
        this.selectedExercicesTypesIds.push(exo.id);
      }
    }
  }

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

  onSupprime(): void {
    Swal.fire({
      title: 'Voulez-vous réellement supprimer ces types d\'exercices ? ?',
      showDenyButton: true,
      confirmButtonText: 'Supprimer',
      denyButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.etatChargement = EtatChargement.ENCOURS;
        this.deleteExerciceTypeRecursively();
      } else if (result.isDenied) {
        Swal.fire('Suppression annulée', '', 'info');
      }
    });
  }

  private deleteExerciceTypeRecursively(): void {

    const id = this.selectedExercicesTypesIds[0];
    this.selectedExercicesTypesIds.splice(0, 1);

    if (id) {
      const deleteObservable = this.exerciceTypeService.deleteExerciceTypes(id);
      deleteObservable.subscribe({
        error: (err) => {
          Swal.fire("Erreur lors de la suppression.\nCode d'erreur : " + err, '', 'error');
        },
        complete: () => {
          if (this.selectedExercicesTypesIds.length == 0) {
            this.etatChargement = EtatChargement.FAIT;
            Swal.fire('Tous les types d\'exercices ont été supprimés avec succès !', '', 'success');
            this.navigateBack();
          } else {
            this.deleteExerciceTypeRecursively();
          }
        }
      })
    };
  }
  private navigateBack(): void {
    this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('exercicestypes'));
  }
}