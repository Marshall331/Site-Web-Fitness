import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EtatChargement } from 'src/app/models/chargement';
import { EtatRoutine, Routine } from 'src/app/models/routine';
import { RoutineService } from 'src/app/services/routine.service';

@Component({
  selector: 'app-routine-detail ',
  templateUrl: './routine-detail.component.html',
  styleUrls: ['./routine-detail.component.css']
})
export class RoutineDetailComponent {

  public routine: Routine = new Routine();
  public etatRoutine: EtatRoutine = EtatRoutine.ACTIVE;
  public etatChargement = EtatChargement.ENCOURS;

  constructor(
    private routineService: RoutineService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.routineService.getTache(id).subscribe(
      {
        next: routine => {
          this.routine = routine
          this.etatChargement = EtatChargement.FAIT
        },
        error: err => this.router.navigateByUrl('/routines')
      }
    )
  }
}
