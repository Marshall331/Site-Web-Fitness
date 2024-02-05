import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { EtatChargement } from 'src/app/models/chargement';
import { EtatTache, Tache } from 'src/app/models/tache';
import { ExerciceService } from 'src/app/services/exercice.service';
import { TacheService } from 'src/app/services/tache.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tache-list',
  templateUrl: './tache-list.component.html',
  styleUrls: ['./tache-list.component.css']
})
export class TacheListComponent implements OnInit {


  public selectAllChecked: boolean = false;
  public selectedTaskStates: Map<number, boolean> = new Map<number, boolean>();
  public selectedTaskIds: number[] = [];
  public etatChoisi: string;
  public etatChoisiSelection: string;
  public recherche: string = "";
  public taches!: Observable<Tache[]>;
  public tachesBySearch: Tache[] = [];
  public etatChargement: EtatChargement = EtatChargement.ENCOURS;
  readonly etatTache = EtatTache;

  constructor(
    private tacheService: TacheService,
    private router: Router,
  ) {
    this.etatChoisi = sessionStorage['choixEtat'] as EtatTache || "tout";
    this.recherche = sessionStorage['recherche'] || "";
    this.etatChoisiSelection = "tout";
  }

  ngOnInit(): void {
    this.taches = this.tacheService.getTaches();
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
    this.taches.subscribe({
      next: (tacheList: Tache[]) => {
        this.tachesBySearch = this.filterTaches(tacheList);
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

  private filterTaches(tacheList: Tache[]): Tache[] {
    return this.etatChoisi === "tout"
      ? this.filterByRecherche(tacheList)
      : tacheList.filter(tache => tache.etat === this.etatChoisi && this.isRechercheMatch(tache));
  }

  private filterByRecherche(tacheList: Tache[]): Tache[] {
    return tacheList.filter(tache => this.isRechercheMatch(tache));
  }

  private isRechercheMatch(tache: Tache): boolean {
    const rechercheLower = this.recherche.toLowerCase().replace(/\s/g, '');
    const tacheNomSansEspaces = tache.nom.toLowerCase().replace(/\s/g, '');
    // const tacheMemoSansEspaces = tache.memo.toLowerCase().replace(/\s/g, '');

    return (
      tacheNomSansEspaces.includes(rechercheLower)
      // || tacheMemoSansEspaces.includes(rechercheLower) la recherche pas titre est mieux donc ceci est inutile
    );
  }

  updateEtatSelection($event: Event) {
    let etatChoisi = $event as unknown as EtatTache;
    Swal.fire({
      title: 'Voulez-vous vraiment passer le statut des tâches sélectionnés à l\'état: ' + etatChoisi + ' ?',
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
              Swal.fire(error ? "Erreur lors de la sauvegarde.\nCode d'erreur : " + error : "Tâches modifiées !");
            }
          };
          for (const id of this.selectedTaskIds) {
            this.tacheService.getTache(id).subscribe({
              next: (tache: Tache) => {
                if (tache) {
                  tache.etat = etatChoisi;
                  let observable = this.tacheService.updateTache(tache);

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
        this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/taches'));
        Swal.fire('Action annulée', '', 'info');
      }
    });
  }


  toggleSelectAll() {
    this.selectedTaskIds = [];

    for (const task of this.tachesBySearch) {
      this.selectedTaskStates.set(task.id, this.selectAllChecked);
      if (this.selectAllChecked) {
        this.selectedTaskIds.push(task.id);
      }
    }
  }

  onTaskCheckboxChange(isSelected: boolean, taskId: number): void {
    if (isSelected) {
      this.selectedTaskIds.push(taskId);
    } else {
      const index = this.selectedTaskIds.indexOf(taskId);
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
        let observable = this.tacheService.deleteMultipleTaches(this.selectedTaskIds);

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