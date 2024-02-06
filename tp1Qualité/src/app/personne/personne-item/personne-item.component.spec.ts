import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonneItemComponent } from './personne-item.component';

describe('PersonneItemComponent', () => {
  let component: PersonneItemComponent;
  let fixture: ComponentFixture<PersonneItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonneItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonneItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
