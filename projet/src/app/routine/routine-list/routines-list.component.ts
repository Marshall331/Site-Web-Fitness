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
  public selectedRoutinesIds: number[] = [];
  public etatChoisi: string;
  public etatChoisiSelection: string;
  public recherche: string = "";
  public routines!: Observable<Routine[]>;
  public routinesList: Routine[] = [];
  public routinesBySearch: Routine[] = [];
  public etatChargement: EtatChargement = EtatChargement.ENCOURS;
  readonly etatRoutine = EtatRoutine;

  constructor(
    private routineService: RoutineService,
    private router: Router,
  ) {
    this.etatChoisi = sessionStorage['choixEtat'] as EtatTache || "tout";
    this.recherche = sessionStorage['rechercheRoutine'] || "";
    this.etatChoisiSelection = "tout";
  }

  ngOnInit(): void {
    this.etatChargement = EtatChargement.ENCOURS;
    this.routines = this.routineService.getRoutines();
    this.routines.subscribe({
      next: routine => {
        this.routinesList = routine;
        this.routinesBySearch = this.routinesList;
        this.subscribeToTaches();
        this.etatChargement = EtatChargement.FAIT;
      },
      error: err => {
        Swal.fire('Erreur', 'Une erreur est survenue lors de la récupération des routines.', 'error')
        this.router.navigateByUrl('/routines');
      }
    });
  }

  updateEtat($event: Event) {
    this.etatChoisi = $event as unknown as EtatTache;
    sessionStorage['choixEtat'] = this.etatChoisi;
    this.subscribeToTaches();
  }

  updateRecherche($event: Event) {
    this.recherche = $event.toString();
    sessionStorage['rechercheRoutine'] = this.recherche;
    this.subscribeToTaches();
  }

  private subscribeToTaches() {
    this.routinesBySearch = this.filterTaches(this.routinesList);
  }

  isRoutinesSelected(RoutinesId: number): boolean {
    return this.selectedRoutinesIds.includes(RoutinesId);
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
    const routineNomSansEspaces = routine.description.toLowerCase().replace(/\s/g, '');
  
    return routineNomSansEspaces.includes(rechercheLower);
  }
  

  // Nouvelle méthode pour la gestion de la confirmation
  async confirmUpdate(etatChoisi: EtatRoutine): Promise<boolean> {
    const result = await Swal.fire({
      title: `Voulez-vous vraiment passer le statut des routines sélectionnés à l'état: ${etatChoisi} ?`,
      showDenyButton: true,
      confirmButtonText: 'Confirmer',
      denyButtonText: 'Annuler'
    });

    return result.isConfirmed;
  }

  // Nouvelle méthode pour la gestion des erreurs
  handleError(error: any): void {
    this.etatChargement = EtatChargement.ERREUR;
    console.error('Erreur lors de la sauvegarde.', error);
  }

  // Nouvelle méthode pour mettre à jour une routine
  updateRoutine(routine: Routine, etatChoisi: EtatRoutine): Observable<Routine> {
    routine.status = etatChoisi;
    return this.routineService.updateRoutine(routine);
  }

  // Nouvelle méthode pour mettre à jour l'état de chargement
  updateLoadingState(error: boolean): void {
    this.etatChargement = error ? EtatChargement.ERREUR : EtatChargement.FAIT;
  }

  // Nouvelle méthode pour rediriger vers la page '/routines'
  navigateToRoutines(): void {
    this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/routines'));
  }

  // Nouvelle méthode pour afficher une notification
  showNotification(error: boolean, errorCode?: any): void {
    Swal.fire(error ? `Erreur lors de la sauvegarde.\nCode d'erreur : ${errorCode}` : 'Routines modifiées !');
  }

  // Nouvelle méthode pour gérer la mise à jour de l'état
  async handleUpdate(etatChoisi: EtatRoutine): Promise<void> {
    this.etatChargement = EtatChargement.ENCOURS;
    let error = false;

    for (const id of this.selectedRoutinesIds) {
      try {
        const routine = await this.routineService.getRoutine(id).toPromise();

        if (routine) {
          const observable = this.updateRoutine(routine, etatChoisi);

          try {
            await observable.toPromise();
          } catch (err) {
            error = true;
            this.handleError(err);
          }
        }
      } catch (err) {
        error = true;
        this.handleError(err);
      }
    }

    this.updateLoadingState(error);
    this.navigateToRoutines();
    this.showNotification(error);
  }

  // Méthode principale mise à jour
  updateEtatSelection($event: Event): void {
    const etatChoisi = $event as any as EtatRoutine;

    this.confirmUpdate(etatChoisi).then(async (isConfirmed) => {
      if (isConfirmed) {
        try {
          await this.handleUpdate(etatChoisi);
        } catch (error) {
          this.etatChargement = EtatChargement.ERREUR;
        }
      } else {
        this.navigateToRoutines();
        Swal.fire('Action annulée', '', 'info');
      }
    });
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
      title: 'Voulez-vous réellement supprimer ces tâches ?',
      showDenyButton: true,
      confirmButtonText: 'Supprimer',
      denyButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        let observable = this.routineService.deleteMultipleRoutines(this.selectedRoutinesIds);

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