import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Exercice } from 'src/app/models/exercice';
import { ExerciceService } from 'src/app/services/exercice.service';

@Component({
  selector: 'app-exercice-item',
  templateUrl: './exercice-item.component.html',
  styleUrls: ['./exercice-item.component.css']
})
export class ExerciceItemComponent {
  @Input()
  public exercice: Exercice = new Exercice();

  @Input() isSelected: boolean = false;
  @Output() checkboxChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private exerciceService: ExerciceService,
    private router: Router,
  ) { }

  onCheckboxChange(event: any): void {
    this.checkboxChange.emit(event.target.checked);
  }

  updateStatus(event: any): void {
    let Observable = this.exerciceService.updateExercice(this.exercice);
    Observable.subscribe({
      error: err => {
        Swal.fire("Erreur lors de la sauvegarde.\nCode d'erreur : " + err, '', 'error')
      }
    })
    this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/routines'));
  }

  onSupprime(): void {
    Swal.fire({
      title: "Voulez vous réellement supprimer cette routine ?",
      showDenyButton: true,
      confirmButtonText: "Supprimer",
      denyButtonText: `Annuler`
    }).then((result) => {
      if (result.isConfirmed) {
        let Observable = this.exerciceService.deleteExercice(this.exercice);
        Observable.subscribe({
          next: routine => {
            Swal.fire("Routine supprimée !", "", "success");
          },
          error: err => {
            window.alert("Erreur lors de la sauvegarde.\nCode d'erreur : " + err)
          }
        })
        this.router.navigateByUrl('/').then(() => this.router.navigateByUrl('/taches'));
      } else if (result.isDenied) {
        Swal.fire('Ok, on ne supprime pas', '', 'info');
      }
    });
  }
}