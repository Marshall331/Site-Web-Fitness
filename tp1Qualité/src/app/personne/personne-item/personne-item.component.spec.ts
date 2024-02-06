import { AppComponent } from "../../app.component";
import { Personne } from "../../model/personne"
import { TestBed } from '@angular/core/testing';
import { PersonneItemComponent } from "./personne-item.component";

describe('Personne', () => {
  let fixture = TestBed.createComponent(AppComponent);
  let component: PersonneItemComponent;
  let personne: Personne | null = null
  beforeEach(() => {
    const fixture = TestBed.createComponent(AppComponent);
    personne = new Personne()
  })
  it('should have a valid constructor', () => {
    expect(personne).not.toBeNull()
  })
  it('should set name correctly through constructor', () => {
    personne = new Personne('Robert')
    expect(personne.nom).toEqual('Robert')
  });
  it('should get upper case name with method upperName()', () => {
    personne = new Personne('Robert')
    expect(personne.nom).toEqual('Robert')
    expect(personne.upperName()).toEqual('ROBERT')
    personne.nom = 'Lou'
    expect(personne.upperName()).toEqual('LOU')
  });
  it('should show email only if it exists', () => {
    component.personne.email = 'mailpersonne@mail.fr';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.email')?.textContent).toContain('e-mail : mailpersonne@mail.fr');

    component.personne.email = undefined;
    fixture.detectChanges();
    expect(compiled.querySelector('.personne .email')).toBeNull();
  });

  it('should change personne.id when use onChangeId() method', () => {
    personne = new Personne('Robert')
    // Récupérer l'ID actuel de la personne
    const currentId = component.personne.id;

    // Appeler la méthode onChangeId() pour changer l'ID
    component.onChangeId();

    // Vérifier que l'ID de la personne a été modifié
    expect(component.personne.id).not.toBe(currentId);
  });

  afterEach(() => {
    personne = null
  })
})