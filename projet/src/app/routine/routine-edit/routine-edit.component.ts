import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EtatChargement } from 'src/app/models/chargement';
import { EtatRoutine, Routine } from 'src/app/models/routine';
import { RoutineService } from 'src/app/services/routine.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-routine-edit',
  templateUrl: './routine-edit.component.html',
  styleUrls: ['./routine-edit.component.css']
})
export class RoutineEditComponent implements OnInit {

  /**
   * La routine en cours d'édition.
   */
  public routine: Routine = new Routine();

  /**
   * Énumération des états de routine.
   */
  readonly etatRoutine = EtatRoutine;

  /**
   * L'état de chargement de la page, actuellement ENCOURS.
   */
  public etatChargement = EtatChargement.ENCOURS;

  /**
   * Indique si le formulaire d'édition des exercices est visible ou non.
   */
  public showExerciceEdit: boolean = false;

  constructor(
    private routineService: RoutineService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  /**
   * Méthode appelée lors de la soumission du formulaire.
   * Vérifie la validité du formulaire, puis ajoute ou met à jour la routine.
   * Affiche ensuite un message de succès ou d'erreur.
   * Redirige finalement vers la page d'édition de la routine.
   */
  public onSubmit(leFormulaire: NgForm): void {
    if (leFormulaire.valid) {
      let ObservableAction;
      if (this.routine.id) {
        ObservableAction = this.routineService.updateRoutine(this.routine);
      } else {
        ObservableAction = this.routineService.addRoutine(this.routine);
      }
      ObservableAction.subscribe({
        next: (routine: any) => {
          Swal.fire(this.routine.id != 0 ? "Routine modifiée !" : "Routine ajoutée !", '', 'success');
          this.router.navigateByUrl('/').then(() => this.router.navigateByUrl("/routine/edit/" + this.routine.id));
        },
        error: (err: string) => {
          Swal.fire("Erreur lors de la sauvegarde.\nCode d'erreur : " + err);
          this.router.navigateByUrl('/').then(() => this.router.navigateByUrl("/routines"));
        }
      })
    }
  }

  /**
   * Méthode appelée lors de l'initialisation du composant.
   * Récupère l'identifiant de la routine depuis l'URL,
   * puis récupère les détails de la routine correspondante depuis le service.
   * En cas d'erreur, redirige vers la liste des routines.
   */
  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.routine = new Routine();
    if (id) {
      this.routineService.getRoutine(id).subscribe(
        {
          next: (routine: Routine) => {
            this.routine = routine;
            this.etatChargement = EtatChargement.FAIT;
          },
          error: (err: any) => this.router.navigateByUrl('/routines')
        }
      )
    }
    else { this.etatChargement = EtatChargement.FAIT; }
  }

  /**
   * Bascule l'affichage du formulaire d'édition des exercices.
   */
  showExerciceAddForm(): void {
    this.showExerciceEdit = !this.showExerciceEdit;
  }
}