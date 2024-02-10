import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EtatChargement } from 'src/app/models/chargement';
import { EtatRoutine, Routine } from 'src/app/models/routine';
import { RoutineService } from 'src/app/services/routine.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-routine-detail',
  templateUrl: './routine-detail.component.html',
  styleUrls: ['./routine-detail.component.css']
})
export class RoutineDetailComponent implements OnInit {

  /**
   * La routine actuellement affichée.
   */
  public routine!: Routine;

  /**
   * L'état de la routine, actuellement par défaut ACTIVE.
   */
  public etatRoutine: EtatRoutine = EtatRoutine.ACTIVE;

  /**
   * L'état de chargement de la page, actuellement ENCOURS.
   */
  public etatChargement = EtatChargement.ENCOURS;

  /**
   * Indique si le formulaire d'ajout d'exercice est visible ou non.
   */
  public showExerciceEdit: boolean = false;
  
  constructor(
    private routineService: RoutineService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Récupère l'identifiant de la routine depuis l'URL
    const id = this.route.snapshot.params['id'];

    // Récupère la routine correspondante depuis le service
    this.routineService.getRoutine(id).subscribe({
      next: routine => {
        this.routine = routine;
        this.etatChargement = EtatChargement.FAIT;
      },
      error: err => {
        // En cas d'erreur, affiche un message d'erreur et redirige vers la liste des routines
        Swal.fire('Erreur', 'Une erreur est survenue lors de la récupération de la routine.', 'error');
        this.router.navigateByUrl('/routines');
      }
    });
  }

  /**
   * Bascule l'affichage du formulaire d'ajout d'exercice.
   */
  showExerciceAddForm(): void {
    this.showExerciceEdit = !this.showExerciceEdit;
  }
}