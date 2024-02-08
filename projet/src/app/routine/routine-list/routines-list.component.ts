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

  public selectAllChecked: boolean = false;
  public selectedRoutinesIds: number[] = [];
  public filterChoosen: string;
  public recherche: string = "";
  public routines!: Observable<Routine[]>;
  public routinesList: Routine[] = [];
  public routinesBySearch: Routine[] = [];
  public etatChargement: EtatChargement = EtatChargement.ENCOURS;
  readonly etatRoutine = EtatRoutine;
  public valBarreChargement!: number;
  public selectionChoice: String = "";

  constructor(
    private routineService: RoutineService,
    private router: Router,
  ) {
    this.filterChoosen = sessionStorage['filtreRoutine'] as EtatRoutine || "tout";
    this.recherche = sessionStorage['rechercheRoutine'] || "";
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

  updateFilter($event: Event) {
    this.filterChoosen = $event as unknown as EtatRoutine;
    sessionStorage['filtreRoutine'] = this.filterChoosen;
    this.subscribeToRoutines();
  }

  updateRecherche($event: Event) {
    this.recherche = $event.toString();
    sessionStorage['rechercheRoutine'] = this.recherche;
    this.subscribeToRoutines();
  }

  subscribeToRoutines() {
    this.routinesBySearch = this.filtrerRoutines(this.routinesList);
  }

  isRoutinesSelected(RoutinesId: number): boolean {
    return this.selectedRoutinesIds.includes(RoutinesId);
  }

  private filtrerRoutines(routinesList: Routine[]): Routine[] {
    switch (this.filterChoosen) {
      case "tout":
        return this.filterByRecherche(routinesList);
      case "active":
        return routinesList.filter(routine => routine.status === this.filterChoosen && this.isRechercheMatch(routine));
      case "inactive":
        return routinesList.filter(routine => routine.status === this.filterChoosen && this.isRechercheMatch(routine));
      case "fait":
        return routinesList.filter(routine => !this.checkDoneStatus(routine.id) && this.isRechercheMatch(routine));
      case "non fait":
        return routinesList.filter(routine => this.checkDoneStatus(routine.id) && this.isRechercheMatch(routine));
      default:
        return this.filterByRecherche(routinesList);
    }
  }

  private checkDoneStatus(id: number): boolean {
    let routinesDoneIds = JSON.parse(localStorage.getItem('routinesDoneIds') || '[]') as number[];
    const index = routinesDoneIds.indexOf(id);
    return index == -1;
  }

  private filterByRecherche(routinesList: Routine[]): Routine[] {
    return routinesList.filter(routine => this.isRechercheMatch(routine));
  }

  private isRechercheMatch(routine: Routine): boolean {
    const rechercheLower = this.recherche.toLowerCase().replace(/\s/g, '');
    const routineNomSansEspaces = routine.name.toLowerCase().replace(/\s/g, '');

    return routineNomSansEspaces.includes(rechercheLower);
  }


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
          if (this.selectionChoice == "fait") {
            this.updateRoutinesDone(true);
          } else {
            this.updateRoutinesDone(false);
          }
        }
      }
      this.selectionChoice = "";
    });
  }

  private updateRoutinesDone(shouldAdd: boolean) {
    this.selectedRoutinesIds.forEach(id => {
      this.updateRoutineDoneStatus(shouldAdd, id);
    });
    this.playEndProgressBar(EtatChargement.FAIT);
  }

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

  private updateMultipleRoutines(status: EtatRoutine): void {
    const id = this.selectedRoutinesIds[0];
    this.selectedRoutinesIds.splice(0, 1);
    if (id) {
      this.routinesList.forEach(routine => {
        if (routine.id === id) {
          routine.status = status;
          const deleteObservable = this.routineService.updateRoutine(routine);
          deleteObservable.subscribe({
            error: (err) => {
              Swal.fire("Erreur lors de la suppression.\nCode d'erreur : " + err, '', 'error');
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
    };
  }


  toggleSelectAll() {
    this.selectedRoutinesIds = [];
    for (const Routine of this.routinesBySearch) {
      if (this.selectAllChecked) {
        this.selectedRoutinesIds.push(Routine.id);
      }
    }
  }

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

  onSupprime(): void {
    Swal.fire({
      title: 'Voulez-vous réellement supprimer ces types d\'exercices ? ?',
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
            this.deletePlusieursExerciceType();
          }
        }
      })
    };
  }

  // Nouvelle méthode pour rediriger vers la page '/routines'
  redirectToRoutines(): void {
    this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/routines'));
  }

  private playEndProgressBar(loadingState: EtatChargement): Promise<void> {
    return new Promise((resolve) => {
      this.valBarreChargement = 100;
      setTimeout(() => {
        this.etatChargement = loadingState;
        resolve();
      }, 50);
    });
  }

  private startLoadingAnimation() {
    this.valBarreChargement = Math.random() * 100;
    this.etatChargement = EtatChargement.ENCOURS;
  }
}