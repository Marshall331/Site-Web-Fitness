/**
 * Composant pour afficher une liste d'exercices avec des fonctionnalités de filtrage et de gestion de la sélection.
 */
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EtatChargement } from 'src/app/models/chargement';
import Swal from 'sweetalert2';
import { Exercice } from 'src/app/models/exercice';
import { ExerciceService } from 'src/app/services/exercice.service';

@Component({
  selector: 'app-exercice-list',
  templateUrl: './exercice-list.component.html',
  styleUrls: ['./exercice-list.component.css']
})
export class ExerciceListComponent implements OnInit {

  @Input()
  public routineId: number = 0; // ID de la routine associée

  public selectAllChecked: boolean = false; // Indique si tous les exercices sont sélectionnés
  public selectedExercicesStates: Map<number, boolean> = new Map<number, boolean>(); // État de la sélection des exercices
  public selectedExercicesIds: number[] = []; // IDs des exercices sélectionnés
  public recherche: string = ""; // Terme de recherche pour filtrer les exercices
  public exercices!: Observable<Exercice[]>; // Liste des exercices récupérés depuis le service
  public exerciceList: Exercice[] = []; // Liste des exercices affichés
  public exerciceBySearch: Exercice[] = []; // Liste des exercices filtrés par recherche
  public etatChargement: EtatChargement = EtatChargement.ENCOURS; // État de chargement de la liste d'exercices
  public nbRepetitionsTotal: number = 0; // Nombre total de répétitions dans la liste d'exercices
  public nbPoidsTotal: number = 0; // Poids total dans la liste d'exercices
  public valBarreChargement!: number; // Valeur de la barre de progression
  public selectionChoice: String = ""; // Choix de la sélection des exercices
  public filterChoosen: string; // Filtre choisi pour afficher les exercices

  constructor(
    private exerciceService: ExerciceService,
    private router: Router,
  ) {
    this.filterChoosen = sessionStorage['filtreExercice'] || "tout";
    this.recherche = sessionStorage['rechercheExercice'] || "";
  }

  /**
   * Méthode appelée lors de l'initialisation du composant.
   */
  ngOnInit(): void {
    this.startLoadingAnimation();
    this.exercices = this.exerciceService.getExercices();
    this.getExercicesById(this.routineId);
  }

  /**
   * Récupère les exercices en fonction de l'ID de la routine.
   * @param id L'ID de la routine associée aux exercices
   */
  private getExercicesById(id: number): void {
    let observable;
    if (this.routineId == 0) {
      observable = this.exerciceService.getExercices();
    } else {
      observable = this.exerciceService.getExercicesByRoutineId(this.routineId);
    }
    observable.subscribe({
      next: exercices => {
        this.exerciceList = exercices;
        this.exerciceBySearch = this.exerciceList;
        this.calculerInfosSuppTotal();
        this.subscribeToExercices();
        this.playEndProgressBar(EtatChargement.FAIT);
      },
      error: err => {
        this.playEndProgressBar(EtatChargement.ERREUR).then(() => {
          Swal.fire('Erreur', 'Une erreur est survenue lors de la récupération des exercices.', 'error')
        });
      }
    });
  }

  /**
   * Met à jour l'état de la sélection des exercices.
   */
  updateEtatSelection(): void {
    Swal.fire({
      title: 'Passer le statut des exercices sélectionnés à l\'état : ' + this.selectionChoice + '?',
      showDenyButton: true,
      confirmButtonText: 'Confirmer',
      denyButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.startLoadingAnimation();
        if (this.selectionChoice === "fait") {
          this.updateExercicesDone(true);
        } else {
          this.updateExercicesDone(false);
        }
      }
      this.selectionChoice = "";
    });
  }

  /**
   * Met à jour le filtre choisi pour afficher les exercices.
   * @param $event L'événement déclenché lors du changement de filtre
   */
  updateFilter($event: Event) {
    this.filterChoosen = $event as unknown as string;
    sessionStorage['filtreExercice'] = this.filterChoosen;
    this.subscribeToExercices();
  }

  /**
   * Met à jour le statut des exercices sélectionnés.
   * @param shouldAdd Booléen indiquant si les exercices doivent être marqués comme faits ou non faits
   */
  private updateExercicesDone(shouldAdd: boolean) {
    this.selectedExercicesIds.forEach(id => {
      this.updateExerciceDoneStatus(shouldAdd, id);
    });
    this.playEndProgressBar(EtatChargement.FAIT);
  }

  /**
   * Vérifie le statut d'un exercice en fonction de son ID.
   * @param id L'ID de l'exercice à vérifier
   * @returns True si l'exercice est marqué comme fait, sinon False
   */
  private checkDoneStatus(id: number): boolean {
    let routinesDoneIds = JSON.parse(localStorage.getItem('exerciceDoneIds') || '[]') as number[];
    const index = routinesDoneIds.indexOf(id);
    return index == -1;
  }

  /**
     * Filtre une liste d'exercices en fonction de la recherche.
     * @param exercicesList La liste des exercices à filtrer
     * @returns La liste filtrée d'exercices
     */
  private filterByRecherche(exercicesList: Exercice[]): Exercice[] {
    return exercicesList.filter(exercice => this.isRechercheMatch(exercice));
  }

  /**
   * Met à jour le statut de l'exercice (fait/non fait) dans le stockage local.
   * @param shouldAdd Booléen indiquant si l'exercice doit être ajouté ou supprimé du statut "fait"
   * @param exerciceId L'ID de l'exercice à mettre à jour
   */
  private updateExerciceDoneStatus(shouldAdd: boolean, exerciceId: number): void {
    let exercicesDoneIds = JSON.parse(localStorage.getItem('exerciceDoneIds') || '[]') as number[];
    const index = exercicesDoneIds.indexOf(exerciceId);
    if (shouldAdd) {
      if (index === -1) {
        exercicesDoneIds.push(exerciceId);
      }
    } else {
      if (index !== -1) {
        exercicesDoneIds.splice(index, 1);
      }
    }
    localStorage.setItem('exerciceDoneIds', JSON.stringify(exercicesDoneIds));
  }

  /**
   * Calcule le nombre total de répétitions et de poids des exercices dans la liste.
   */
  private calculerInfosSuppTotal() {
    this.exerciceList.forEach(exercice => {
      this.nbRepetitionsTotal += exercice.repetitions;
      this.nbPoidsTotal += exercice.weight;
    })
  }

  /**
   * Met à jour le terme de recherche pour filtrer les exercices.
   * @param $event L'événement déclenché lors du changement du terme de recherche
   */
  updateRecherche($event: Event) {
    this.recherche = $event.toString();
    sessionStorage['rechercheExercice'] = this.recherche;
    this.subscribeToExercices();
  }

  /**
   * Souscrit à la liste des exercices filtrés.
   */
  private subscribeToExercices() {
    this.exerciceBySearch = this.filtrerExercices(this.exerciceList);
  }

  /**
   * Vérifie si un exercice est sélectionné.
   * @param exerciceId L'ID de l'exercice à vérifier
   * @returns True si l'exercice est sélectionné, sinon False
   */
  isTaskSelected(exerciceId: number): boolean {
    return this.selectedExercicesIds.includes(exerciceId);
  }

  /**
   * Filtre les exercices en fonction du choix de filtre.
   * @param exerciceList La liste des exercices à filtrer
   * @returns La liste filtrée d'exercices
   */
  private filtrerExercices(exerciceList: Exercice[]): Exercice[] {
    switch (this.filterChoosen) {
      case "tout":
        return this.filterByRecherche(exerciceList);
      case "fait":
        return exerciceList.filter(exercice => !this.checkDoneStatus(exercice.id) && this.isRechercheMatch(exercice));
      case "non fait":
        return exerciceList.filter(exercice => this.checkDoneStatus(exercice.id) && this.isRechercheMatch(exercice));
      default:
        return this.filterByRecherche(exerciceList);
    }
  }

  /**
   * Vérifie si un exercice correspond au terme de recherche.
   * @param exercice L'exercice à vérifier
   * @returns True si l'exercice correspond à la recherche, sinon False
   */
  private isRechercheMatch(exercice: Exercice): boolean {
    const rechercheLower = this.recherche.toLowerCase().replace(/\s/g, '');
    const exerciceNomSansEspaces = exercice.name.toLowerCase().replace(/\s/g, '');

    return (
      exerciceNomSansEspaces.includes(rechercheLower)
    );
  }

  /**
   * Bascule la sélection de tous les exercices.
   */
  toggleSelectAll() {
    this.selectedExercicesIds = [];

    for (const exo of this.exerciceBySearch) {
      this.selectedExercicesStates.set(exo.id, this.selectAllChecked);
      if (this.selectAllChecked) {
        this.selectedExercicesIds.push(exo.id);
      }
    }
  }

  /**
   * Gère le changement de la case à cocher d'un exercice.
   * @param isSelected Booléen indiquant si l'exercice est sélectionné ou non
   * @param exerciceId L'ID de l'exercice concerné
   */
  onTaskCheckboxChange(isSelected: boolean, exerciceId: number): void {
    if (isSelected) {
      this.selectedExercicesIds.push(exerciceId);
    } else {
      const index = this.selectedExercicesIds.indexOf(exerciceId);
      if (index !== -1) {
        this.selectedExercicesIds.splice(index, 1);
      }
    }
  }

  /**
   * Gère la suppression des exercices sélectionnés.
   */
  onSupprime(): void {
    Swal.fire({
      title: 'Voulez-vous réellement supprimer ces exercices ?',
      showDenyButton: true,
      confirmButtonText: 'Supprimer',
      denyButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.startLoadingAnimation();
        this.deleteExerciceRecursively();
      } else if (result.isDenied) {
        Swal.fire('Suppression annulée', '', 'info');
      }
    });
  }

  /**
   * Supprime les exercices sélectionnés récursivement.
   */
  private deleteExerciceRecursively(): void {
    const id = this.selectedExercicesIds[0];
    this.selectedExercicesIds.splice(0, 1);
    if (id) {
      const deleteObservable = this.exerciceService.deleteExercice(id);
      deleteObservable.subscribe({
        error: (err) => {
          this.playEndProgressBar(EtatChargement.ERREUR);
        },
        complete: () => {
          if (this.selectedExercicesIds.length == 0) {
            this.playEndProgressBar(EtatChargement.FAIT).then(() => {
              Swal.fire('Exercices supprimés !', '', 'success');
              this.redirectToRightPage();
            });
          } else {
            this.deleteExerciceRecursively();
          }
        }
      })
    };
  }

  /**
 * Redirige vers la page appropriée après la suppression des exercices.
 */
  private redirectToRightPage(): void {
    if (this.routineId) {
      this.redirectToRoutine();
    } else {
      this.redirectToExercices();
    }
  }

  /**
   * Redirige vers la page '/routine/:routineId' après la suppression des exercices.
   */
  private redirectToRoutine(): void {
    this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/routine/' + this.routineId));
  }

  /**
   * Redirige vers la page '/exercices' après la suppression des exercices.
   */
  private redirectToExercices(): void {
    this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/exercices'))
  }

  /**
   * Lance l'animation de chargement jusqu'à la fin.
   * @param loadingState L'état de chargement final
   * @returns Une promesse résolue lorsque l'animation est terminée
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
   * Démarre l'animation de chargement.
   */
  private startLoadingAnimation() {
    this.valBarreChargement = Math.random() * 100;
    this.etatChargement = EtatChargement.ENCOURS;
  }
}