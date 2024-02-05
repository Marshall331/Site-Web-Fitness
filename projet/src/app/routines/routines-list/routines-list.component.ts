import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { EtatChargement } from 'src/app/models/chargement';
import { EtatRoutine, Routine } from 'src/app/models/routine';
import { EtatTache, Tache } from 'src/app/models/tache';
import { RoutineService } from 'src/app/services/routine.service';
import Swal from 'sweetalert2';
import { NgForm } from '@angular/forms';


@Component({
  selector: 'app-routines-list',
  templateUrl: './routines-list.component.html',
  styleUrls: ['./routines-list.component.css']
})
export class RoutineListComponent implements OnInit {


  public selectAllChecked: boolean = false;
  public selectedRoutinesStates: Map<number, boolean> = new Map<number, boolean>();
  public selectedTaskIds: number[] = [];
  public etatChoisi: string;
  public etatChoisiSelection: string;
  public recherche: string = "";
  public routines!: Observable<Routine[]>;
  public routinesBySearch: Routine[] = [];
  public etatChargement: EtatChargement = EtatChargement.ENCOURS;
  readonly etatRoutine = EtatRoutine;

  constructor(
    private routineService: RoutineService,
    private router: Router,
  ) {
    this.etatChoisi = sessionStorage['choixEtat'] as EtatTache || "tout";
    this.recherche = sessionStorage['recherche'] || "";
    this.etatChoisiSelection = "tout";
  }

  ngOnInit(): void {
    this.routines = this.routineService.getTaches();
    this.etatChargement = EtatChargement.ENCOURS;
    this.subscribeToTaches();
  }

  updateEtat($event: Event) {
    this.etatChoisi = $event as unknown as EtatTache;
    sessionStorage['choixEtat'] = this.etatChoisi;
    this.subscribeToTaches();
  }

  updateRecherche($event: Event) {
    this.recherche = $event.toString();
    sessionStorage['recherche'] = this.recherche;
    this.subscribeToTaches();
  }

  private subscribeToTaches() {
    this.routines.subscribe({
      next: (routinesList: Routine[]) => {
        this.routinesBySearch = this.filterTaches(routinesList);
        this.etatChargement = EtatChargement.FAIT;
      },
      error: (err: any) => {
        this.etatChargement = EtatChargement.ERREUR;
      }
    });
  }

  isTaskSelected(taskId: number): boolean {
    return this.selectedTaskIds.includes(taskId);
  }

  private filterTaches(routinesList: Routine[]): Routine[] {
    return this.etatChoisi === "tout"
      ? this.filterByRecherche(routinesList)
      : routinesList.filter(routine => routine.status === this.etatChoisi && this.isRechercheMatch(routine));
  }

  private filterByRecherche(routinesList: Routine[]): Routine[] {
    return routinesList.filter(routine => this.isRechercheMatch(routine));
  }

  private isRechercheMatch(routine: Routine): boolean {
    const rechercheLower = this.recherche.toLowerCase().replace(/\s/g, '');
    const tacheNomSansEspaces = routine.description.toLowerCase().replace(/\s/g, '');
    // const tacheMemoSansEspaces = tache.memo.toLowerCase().replace(/\s/g, '');

    return (
      tacheNomSansEspaces.includes(rechercheLower)
      // || tacheMemoSansEspaces.includes(rechercheLower) la recherche pas titre est mieux donc ceci est inutile
    );
  }

  updateEtatSelection($event: Event) {
    let etatChoisi = $event as any as EtatRoutine;
    Swal.fire({
      title: 'Voulez-vous vraiment passer le statut des routines sélectionnés à l\'état: ' + etatChoisi + ' ?',
      showDenyButton: true,
      confirmButtonText: 'Confirmer',
      denyButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.etatChargement = EtatChargement.ENCOURS;
        try {
          let error = false;
          let count = 0;
          const handleUpdate = () => {
            count++;
            if (count === this.selectedTaskIds.length) {
              this.etatChargement = error ? EtatChargement.ERREUR : EtatChargement.FAIT;
              this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/taches'));
              Swal.fire(error ? "Erreur lors de la sauvegarde.\nCode d'erreur : " + error : "Routines modifiées !");
            }
          };
          for (const id of this.selectedTaskIds) {
            this.routineService.getTache(id).subscribe({
              next: (routine: Routine) => {
                if (routine) {
                  routine.status = etatChoisi;
                  let observable = this.routineService.updateTache(routine);

                  observable.subscribe({
                    error: err => {
                      error = err;
                      this.etatChargement = EtatChargement.ERREUR;
                      handleUpdate();
                    },
                    complete: () => {
                      handleUpdate();
                    }
                  });
                }
              },
              error: err => {
                error = err;
                this.etatChargement = EtatChargement.ERREUR;
                handleUpdate();
              }
            });
          }
        } catch (error) {
          this.etatChargement = EtatChargement.ERREUR;
        }
      } else if (result.isDenied) {
        this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/routines'));
        Swal.fire('Action annulée', '', 'info');
      }
    });
  }


  toggleSelectAll() {
    this.selectedTaskIds = [];

    for (const Routine of this.routinesBySearch) {
      this.selectedRoutinesStates.set(Routine.id, this.selectAllChecked);
      if (this.selectAllChecked) {
        this.selectedTaskIds.push(Routine.id);
      }
    }
  }

  onTaskCheckboxChange(isSelected: boolean, routineId: number): void {
    if (isSelected) {
      this.selectedTaskIds.push(routineId);
    } else {
      const index = this.selectedTaskIds.indexOf(routineId);
      if (index !== -1) {
        this.selectedTaskIds.splice(index, 1);
      }
    }
  }

  onSupprime(): void {
    Swal.fire({
      title: 'Voulez-vous réellement supprimer ces tâches ?',
      showDenyButton: true,
      confirmButtonText: 'Supprimer',
      denyButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        // Assuming you have a service method to delete multiple tasks by IDs
        let observable = this.routineService.deleteMultipleTaches(this.selectedTaskIds);

        observable.subscribe({
          next: () => {
            this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/taches'));
            Swal.fire('Tâches supprimées !', '', 'success');
          },
          error: (err) => {
            Swal.fire("Erreur lors de la suppression.\nCode d'erreur : " + err, '', 'error');
          }
        });
      } else if (result.isDenied) {
        Swal.fire('Suppression annulée', '', 'info');
      }
    });
  }
}