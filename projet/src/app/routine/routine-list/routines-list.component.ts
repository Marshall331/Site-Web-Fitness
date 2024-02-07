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
  public selectedRoutinesStates: Map<number, boolean> = new Map<number, boolean>();
  public selectedRoutinesIds: number[] = [];
  public etatChoisi: string;
  public etatChoisiSelection: string = "";
  public recherche: string = "";
  public routines!: Observable<Routine[]>;
  public routinesList: Routine[] = [];
  public routinesBySearch: Routine[] = [];
  public etatChargement: EtatChargement = EtatChargement.ENCOURS;
  readonly etatRoutine = EtatRoutine;
  public valBarreChargement!: number;

  constructor(
    private routineService: RoutineService,
    private router: Router,
  ) {
    this.etatChoisi = sessionStorage['choixEtat'] as EtatRoutine || "tout";
    this.recherche = sessionStorage['rechercheRoutine'] || "";
  }

  ngOnInit(): void {
    this.playStartProgressBar();
    this.routines = this.routineService.getRoutines();
    this.routines.subscribe({
      next: routine => {
        this.routinesList = routine;
        this.routinesBySearch = this.routinesList;
        this.subscribeToRoutines();
        this.playEndProgressBar(EtatChargement.FAIT);
      },
      error: err => {
        Swal.fire('Erreur', 'Une erreur est survenue lors de la récupération des routines.', 'error')
        this.router.navigateByUrl('/routines');
      }
    });
  }

  updateEtat($event: Event) {
    this.etatChoisi = $event as unknown as EtatRoutine;
    sessionStorage['choixEtat'] = this.etatChoisi;
    this.subscribeToRoutines();
  }

  updateRecherche($event: Event) {
    this.recherche = $event.toString();
    sessionStorage['rechercheRoutine'] = this.recherche;
    this.subscribeToRoutines();
  }

  private subscribeToRoutines() {
    this.routinesBySearch = this.filtrerRoutines(this.routinesList);
  }

  isRoutinesSelected(RoutinesId: number): boolean {
    return this.selectedRoutinesIds.includes(RoutinesId);
  }

  private filtrerRoutines(routinesList: Routine[]): Routine[] {
    return this.etatChoisi === "tout"
      ? this.filterByRecherche(routinesList)
      : routinesList.filter(routine => routine.status === this.etatChoisi && this.isRechercheMatch(routine));
  }

  private filterByRecherche(routinesList: Routine[]): Routine[] {
    return routinesList.filter(routine => this.isRechercheMatch(routine));
  }

  private isRechercheMatch(routine: Routine): boolean {
    const rechercheLower = this.recherche.toLowerCase().replace(/\s/g, '');
    const routineNomSansEspaces = routine.description.toLowerCase().replace(/\s/g, '');

    return routineNomSansEspaces.includes(rechercheLower);
  }


  // Méthode principale mise à jour
  updateEtatSelection(): void {
    Swal.fire({
      title: 'Passer le statut des routines sélectionnés à l\'état : ' + this.etatChoisiSelection + '?',
      showDenyButton: true,
      confirmButtonText: 'Confirmer',
      denyButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.playStartProgressBar();
        this.updateMultipleRoutines(this.etatChoisiSelection as EtatRoutine);
      } else {
        this.etatChoisiSelection = "";
      }
    })
  }

  private filterRoutinesToUpdate(status: EtatRoutine) {
    this.selectedRoutinesIds.forEach(id => {

    })
  }

  private updateMultipleRoutines(status: EtatRoutine): void {
    const id = this.selectedRoutinesIds[0];
    this.selectedRoutinesIds.splice(0, 1);

    if (id) {
      this.routinesList.forEach(routine => {
        if (routine.id === id) {
          // if (routine.status != status) {
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
          // }
        }
      });
    };
  }


  toggleSelectAll() {
    this.selectedRoutinesIds = [];
    for (const Routine of this.routinesBySearch) {
      this.selectedRoutinesStates.set(Routine.id, this.selectAllChecked);
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
        this.playStartProgressBar();
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
          Swal.fire("Erreur lors de la suppression.\nCode d'erreur : " + err, '', 'error');
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

  private playStartProgressBar() {
    this.valBarreChargement = Math.random() * 100;
    this.etatChargement = EtatChargement.ENCOURS;
  }
}