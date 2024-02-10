/**
 * Composant pour afficher les détails d'un exercice spécifique.
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EtatChargement } from 'src/app/models/chargement';
import { Exercice } from 'src/app/models/exercice';
import { ExerciceService } from 'src/app/services/exercice.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-exercice-detail',
  templateUrl: './exercice-detail.component.html',
  styleUrls: ['./exercice-detail.component.css']
})
export class ExerciceDetailComponent implements OnInit {

  public routineId: number = 0; // ID de la routine associée à l'exercice
  public exercice!: Exercice; // Détails de l'exercice
  public etatChargement = EtatChargement.ENCOURS; // État de chargement de l'exercice

  /**
   * Constructeur de ExerciceDetailComponent.
   * @param exerciceService Le service pour récupérer les données de l'exercice
   * @param router Le routeur pour la navigation
   * @param route La route pour récupérer les paramètres de la route
   */
  constructor(
    private exerciceService: ExerciceService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  /**
   * Hook de cycle de vie appelé après que Angular ait initialisé toutes les propriétés liées aux données d'une directive.
   */
  ngOnInit(): void {
    const routId = this.route.snapshot.params['routineId'];
    if (this.routineId == 0 && routId) {
      this.routineId = routId;
    }
    const id = this.route.snapshot.params['idExo'];

    // Récupérer les détails de l'exercice avec l'ID fourni
    this.exerciceService.getExercice(id).subscribe({
      next: exercice => {
        this.exercice = exercice;
        this.etatChargement = EtatChargement.FAIT; // Définir l'état de chargement à 'FAIT'
      },
      error: err => {
        // Afficher le message d'erreur si la récupération des détails de l'exercice échoue
        Swal.fire('Erreur', 'Une erreur est survenue lors de la récupération de l\'exercice.', 'error');
        // Rediriger vers la liste des exercices
        this.router.navigateByUrl('/exercices');
      }
    });
  }
}