
describe('Début TP3', () => {
  it('4 tâches présentes par défaut', () => {
    cy.visit('/taches')
    cy.get('[data-testid="nbtaches"]').should('have.text', '4')
  });
  it('si le serveur ne répond pas la liste des tâches indique une erreur',
    () => {
      cy.intercept('GET', 'http://localhost:3000/taches?**', {
        statusCode: 404,
        body: '404 Not Found!',
        headers: {
          'x-not-found': 'true',
        },
      })
      cy.visit('/taches')
      cy.get('form').contains('Rechercher')
      cy.get('.alert-heading').contains('Service non disponible')
    });
})

describe('taches page tests', () => {
  it('should be able to go back to home page', () => {
    cy.visit('/taches')
    cy.get('#navbarColor01').contains('Accueil').click();
    cy.url().should('eq', Cypress.config().baseUrl);
  });
})
describe('Tache item tests', () => {
  const tacheItemId = 3;
  const tacheItemName = "Se lever tôt";
  const tacheItemStatus = "en cours";
  const tacheItemDesc = "Dès que le réveil sonne et ne pas se laisser absorber par mon téléphone portable";

  beforeEach(() => {
    cy.visit('/taches');
  });

  it('should display item details', () => {
    cy.get('[ng-reflect-router-link="/tache/3"]').click();
    cy.url().should('eq', Cypress.config().baseUrl + 'tache/' + tacheItemId);
    cy.get('body').contains(tacheItemName);
    cy.get('body').contains(tacheItemStatus);
    cy.get('body').contains(tacheItemDesc);
  });

  it('should return to taches list when return button is clicked', () => {
    cy.get('[ng-reflect-router-link="/tache/3"]').click();
    cy.get('.btn').click();
    cy.url().should('eq', Cypress.config().baseUrl + 'taches');
  });

  it('should update tache status to "à faire"', () => {
    cy.get('[ng-reflect-router-link="/tache/3"]').click();
    cy.get('body').contains("à faire");
    DownGradeTache();
  });

  it('should update tache status to "terminée"', () => {
    UpgradeTache();
    cy.get('[ng-reflect-router-link="/tache/3"]').click();
    cy.get('body').contains('terminée');
    DownGradeTache();
  });

  it('should update tache details', () => {
    const newTacheName = "Tâche mise à jour";
    const newTacheStatus = "en cours";
    const newTacheDesc = "Description mise à jour de la tâche";
  
    cy.get('[ng-reflect-router-link="/tache/edit/3"]').click();
  
    // Modifier les détails de la tâche
    cy.get('#nom').clear().type(newTacheName);
    cy.get('#status').select(newTacheStatus);
    cy.get('#description').clear().type(newTacheDesc);
    
    cy.get('.btn-success').click();
  
    cy.get('[ng-reflect-router-link="/tache/3"]').click();
    cy.get('body').should('contain', newTacheName);
    cy.get('body').should('contain', newTacheDesc);
  });
  

  it('should delete a tache', () => {
    cy.get(':nth-child(1) > .list-group-item > .justify-content-between > .d-flex > :nth-child(4)').click();
    cy.get('body').should('not.contain', tacheItemName);
  });

  it('should display search bar', () => {
    cy.get('input.form-control').should('exist');
  });

  it('search bar should update list on search', () =>{
    cy.get('input.form-control').type('Se lever tôt');
  });

  it('should cancel tache creation', () => {
    cy.get(':nth-child(2) > .btn-group > .btn').click();
    cy.get('#nom').type('newTache');
    cy.get('.btn-warning').click();
    cy.visit('/taches');
    cy.get('body').should('not.contain', 'newTache');
  });

  it('should create new tache', () => {
    cy.get(':nth-child(2) > .btn-group > .btn').click();
    cy.get('#nom').type('newTache');
    cy.get('.btn-success').click();
    cy.visit('/taches');
    cy.get('body').contains('newTache');
  });

  function DownGradeTache() {
    cy.get(':nth-child(1) > .list-group-item > .justify-content-between > .d-flex > :nth-child(1)').click();
  }

  function UpgradeTache() {
    cy.get(':nth-child(1) > .list-group-item > .justify-content-between > .d-flex > :nth-child(5)').click();
  }
});
