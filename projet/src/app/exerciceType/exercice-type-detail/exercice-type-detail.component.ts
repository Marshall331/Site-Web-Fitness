import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EtatChargement } from 'src/app/models/chargement';
import { ExerciceTypes } from 'src/app/models/exercice-types';
import { ExerciceTypesService } from 'src/app/services/exercice-types.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-exercice-type-detail',
  templateUrl: './exercice-type-detail.component.html',
  styleUrl: './exercice-type-detail.component.css'
})
export class ExerciceTypeDetailComponent {


  public exerciceType!: ExerciceTypes;
  public etatChargement = EtatChargement.ENCOURS;

  constructor(
    private exerciceTypeService: ExerciceTypesService,
    private router: Router,
    private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];

    this.exerciceTypeService.getExerciceType(id).subscribe({
      next: exerice => {
        this.exerciceType = exerice;
        this.etatChargement = EtatChargement.FAIT;
      },
      error: err => {
        Swal.fire('Erreur', 'Une erreur est survenue lors de la récupération de la routine.', 'error')
        this.router.navigateByUrl('/routines');
      }
    });
  }
}
