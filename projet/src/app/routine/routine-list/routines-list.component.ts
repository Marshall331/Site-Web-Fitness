import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EtatChargement } from 'src/app/models/chargement';
import { EtatRoutine, Routine } from 'src/app/models/routine';
import { RoutineService } from 'src/app/services/routine.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-routines-list',
  templateUrl: './routines-list.component.html',
  styleUrls: ['./routines-list.component.css']
})
export class RoutineListComponent implements OnInit {

  /**
   * Indique si toutes les routines sont sélectionnées.
   */
  public selectAllChecked: boolean = false;

  /**
   * Tableau des identifiants des routines sélectionnées.
   */
  public selectedRoutinesIds: number[] = [];

  /**
   * Filtre choisi pour afficher les routines.
   */
  public filterChoosen: string;

  /**
   * Chaîne de recherche pour filtrer les routines.
   */
  public recherche: string = "";

  /**
   * Observable contenant la liste des routines.
   */
  public routines!: Observable<Routine[]>;

  /**
   * Liste des routines récupérées.
   */
  public routinesList: Routine[] = [];

  /**
   * Liste des routines filtrées par recherche.
   */
  public routinesBySearch: Routine[] = [];

  /**
   * État de chargement des routines.
   */
  public etatChargement: EtatChargement = EtatChargement.ENCOURS;

  /**
   * Énumération des états de routine.
   */
  readonly etatRoutine = EtatRoutine;

  /**
   * Valeur de la barre de chargement.
   */
  public valBarreChargement!: number;

  /**
   * Choix de sélection pour les routines.
   */
  public selectionChoice: String = "";

  constructor(
    private routineService: RoutineService,
    private router: Router,
  ) {
    this.filterChoosen = sessionStorage.getItem('filtreRoutine') as EtatRoutine || "tout";
    this.recherche = sessionStorage.getItem('rechercheRoutine') || "";
  }

  ngOnInit(): void {
    this.startLoadingAnimation();
    this.routines = this.routineService.getRoutines();
    this.routines.subscribe({
      next: routine => {
        this.routinesList = routine;
        this.routinesBySearch = this.routinesList;
        this.subscribeToRoutines();
        this.playEndProgressBar(EtatChargement.FAIT);
      },
      error: err => {
        this.playEndProgressBar(EtatChargement.ERREUR).then(() => {
          Swal.fire('Erreur', 'Une erreur est survenue lors de la récupération des routines.', 'error')
        });
      }
    });
  }

  /**
   * Met à jour le filtre des routines.
   */
  updateFilter($event: Event) {
    this.filterChoosen = $event as unknown as EtatRoutine;
    sessionStorage.setItem('filtreRoutine', this.filterChoosen);
    this.subscribeToRoutines();
  }

  /**
   * Met à jour la chaîne de recherche des routines.
   */
  updateRecherche($event: Event) {
    this.recherche = $event.toString();
    sessionStorage.setItem('rechercheRoutine', this.recherche);
    this.subscribeToRoutines();
  }

  /**
   * Souscrit aux routines filtrées.
   */
  subscribeToRoutines() {
    this.routinesBySearch = this.filtrerRoutines(this.routinesList);
  }

  /**
   * Vérifie si une routine est sélectionnée.
   */
  isRoutinesSelected(RoutinesId: number): boolean {
    return this.selectedRoutinesIds.includes(RoutinesId);
  }

  /**
   * Filtrage des routines en fonction du choix de filtre et de recherche.
   */
  private filtrerRoutines(routinesList: Routine[]): Routine[] {
    if (this.filterChoosen === 'active' || this.filterChoosen === 'inactive') {
      return routinesList.filter(routine => routine.status === this.filterChoosen && this.isRechercheMatch(routine));
    } else if (this.filterChoosen === 'fait' || this.filterChoosen === 'non fait') {
      return routinesList.filter(routine => this.checkDoneStatus(routine.id) === (this.filterChoosen === "non fait") && this.isRechercheMatch(routine));
    } else {
      return this.filterByRecherche(routinesList);
    }
  }

  /**
   * Vérifie si une routine est marquée comme terminée.
   */
  private checkDoneStatus(id: number): boolean {
    let routinesDoneIds = JSON.parse(localStorage.getItem('routinesDoneIds') || '[]') as number[];
    return !routinesDoneIds.includes(id);
  }

  /**
   * Filtrage des routines par recherche.
   */
  private filterByRecherche(routinesList: Routine[]): Routine[] {
    return routinesList.filter(routine => this.isRechercheMatch(routine));
  }

  /**
   * Vérifie si une routine correspond à la recherche.
   */
  private isRechercheMatch(routine: Routine): boolean {
    const rechercheLower = this.recherche.toLowerCase().replace(/\s/g, '');
    const routineNomSansEspaces = routine.name.toLowerCase().replace(/\s/g, '');

    return routineNomSansEspaces.includes(rechercheLower);
  }

  /**
   * Met à jour l'état de sélection des routines.
   */
  updateEtatSelection(): void {
    Swal.fire({
      title: 'Passer le statut des routines sélectionnés à l\'état : ' + this.selectionChoice + '?',
      showDenyButton: true,
      confirmButtonText: 'Confirmer',
      denyButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.startLoadingAnimation();
        if (this.selectionChoice !== "fait" && this.selectionChoice !== "non fait") {
          this.updateMultipleRoutines(this.selectionChoice as EtatRoutine);
        } else {
          this.updateRoutinesDone(this.selectionChoice === "fait");
        }
      }
      this.selectionChoice = "";
    });
  }

  /**
 * Met à jour le statut des routines sélectionnées comme terminées ou non terminées.
 */
  private updateRoutinesDone(shouldAdd: boolean) {
    this.selectedRoutinesIds.forEach(id => {
      this.updateRoutineDoneStatus(shouldAdd, id);
    });
    this.playEndProgressBar(EtatChargement.FAIT);
  }

  /**
   * Met à jour le statut de terminé d'une routine.
   */
  private updateRoutineDoneStatus(shouldAdd: boolean, routineId: number): void {
    let routinesDoneIds = JSON.parse(localStorage.getItem('routinesDoneIds') || '[]') as number[];
    const index = routinesDoneIds.indexOf(routineId);
    if (shouldAdd) {
      if (index === -1) {
        routinesDoneIds.push(routineId);
      }
    } else {
      if (index !== -1) {
        routinesDoneIds.splice(index, 1);
      }
    }
    localStorage.setItem('routinesDoneIds', JSON.stringify(routinesDoneIds));
  }

  /**
   * Met à jour plusieurs routines avec un statut donné.
   */
  private updateMultipleRoutines(status: EtatRoutine): void {
    const id = this.selectedRoutinesIds[0];
    this.selectedRoutinesIds.splice(0, 1);
    if (id) {
      this.routinesList.forEach(routine => {
        if (routine.id === id) {
          routine.status = status;
          const updateObservable = this.routineService.updateRoutine(routine);
          updateObservable.subscribe({
            error: (err) => {
              Swal.fire("Erreur lors de la mise à jour.\nCode d'erreur : " + err, '', 'error');
            },
            complete: () => {
              if (this.selectedRoutinesIds.length == 0) {
                this.playEndProgressBar(EtatChargement.FAIT);
                this.redirectToRoutines();
                return;
              } else {
                this.updateMultipleRoutines(status);
              }
            }
          })
        }
      });
    }
  }

  /**
   * Basculer la sélection de toutes les routines.
   */
  toggleSelectAll() {
    this.selectedRoutinesIds = [];
    for (const routine of this.routinesBySearch) {
      if (this.selectAllChecked) {
        this.selectedRoutinesIds.push(routine.id);
      }
    }
  }

  /**
   * Gérer le changement de la case à cocher pour une routine.
   */
  onRoutinesCheckboxChange(isSelected: boolean, routineId: number): void {
    if (isSelected) {
      this.selectedRoutinesIds.push(routineId);
    } else {
      const index = this.selectedRoutinesIds.indexOf(routineId);
      if (index !== -1) {
        this.selectedRoutinesIds.splice(index, 1);
      }
    }
  }

  /**
   * Supprimer les routines sélectionnées.
   */
  onSupprime(): void {
    Swal.fire({
      title: 'Voulez-vous réellement supprimer ces routines ?',
      showDenyButton: true,
      confirmButtonText: 'Supprimer',
      denyButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.startLoadingAnimation();
        this.deleteMultipleRoutines();
      } else if (result.isDenied) {
        Swal.fire('Suppression annulée', '', 'info');
      }
    });
  }

  /**
   * Supprimer plusieurs routines sélectionnées.
   */
  private deleteMultipleRoutines(): void {
    const id = this.selectedRoutinesIds[0];
    this.selectedRoutinesIds.splice(0, 1);
    if (id) {
      const deleteObservable = this.routineService.deleteRoutine(id);
      deleteObservable.subscribe({
        error: (err) => {
          this.playEndProgressBar(EtatChargement.ERREUR).then(() => {
            Swal.fire("Erreur lors de la suppression.\nCode d'erreur : " + err, '', 'error');
            this.redirectToRoutines();
          });
        },
        complete: () => {
          if (this.selectedRoutinesIds.length == 0) {
            this.playEndProgressBar(EtatChargement.FAIT).then(() => {
              Swal.fire('Routines supprimées !', '', 'success');
              this.redirectToRoutines();
            });
          } else {
            this.deleteMultipleRoutines();
          }
        }
      })
    };
  }

  /**
   * Rediriger vers la page '/routines'.
   */
  redirectToRoutines(): void {
    this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/routines'));
  }

  /**
   * Afficher la barre de chargement à 100% avec un état donné.
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
   * Démarrer l'animation de chargement.
   */
  private startLoadingAnimation() {
    this.valBarreChargement = Math.random() * 100;
    this.etatChargement = EtatChargement.ENCOURS;
  }
}