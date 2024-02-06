import { Personne } from './personne';
describe('Personne', () => {
  let personne: Personne | null = null
  beforeEach(() => {
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
  afterEach(() => {
    personne = null
  })

  it('should get a correct code with method codeName when > 10',() =>{
    personne = new Personne('Jean-Pierre')
    expect(personne.codeName(personne.nom)).toEqual('Jean-Pierr');
  })

  it('should get a correct code with method codeName < 10',() =>{
    personne = new Personne('Lou')
    expect(personne.codeName(personne.nom)).toEqual('Louxxxxxxx');
  })

  it('should get a correct code with method codeName == 10',() =>{
    personne = new Personne('aaaaaaaaaa')
    expect(personne.codeName(personne.nom)).toEqual(personne.nom);
  })
})