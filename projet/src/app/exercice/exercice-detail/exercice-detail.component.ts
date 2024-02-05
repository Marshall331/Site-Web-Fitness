import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EtatChargement } from 'src/app/models/chargement';
import { Exercice } from 'src/app/models/exercice';
import { ExerciceService } from 'src/app/services/exercice.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-exercice-detail ',
  templateUrl: './exercice-detail.component.html',
  styleUrls: ['./exercice-detail.component.css']
})
export class ExerciceDetailComponent {

  public exercice!: Exercice;
  public etatChargement = EtatChargement.ENCOURS;

  constructor(
    private exerciceService: ExerciceService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];

    this.exerciceService.getExercice(id).subscribe({
      next: routine => {
        this.exercice = routine;
        this.etatChargement = EtatChargement.FAIT;
      },
      error: err => {
        Swal.fire('Erreur', 'Une erreur est survenue lors de la récupération de l\'exercice.', 'error')
        this.router.navigateByUrl('/exercices');
      }
    });
  }
}