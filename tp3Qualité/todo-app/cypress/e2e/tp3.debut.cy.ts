
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
  const tacheItemStatus = "terminée";
  const tacheItemDesc = "Dès que le réveil sonne et ne pas se laisser absorber par mon téléphone portable";
  beforeEach(() => {
    cy.visit('/taches')
  })

  it('should see item detail', () => {
    cy.get('[ng-reflect-router-link="/tache/3"]').click();
    cy.url().should('eq', Cypress.config().baseUrl + 'tache/' + tacheItemId);
    cy.get('body').contains(tacheItemName);
    cy.get('body').contains(tacheItemStatus);
    cy.get('body').contains(tacheItemDesc);
  });

  it('return button in detail should return to taches list', () => {
    cy.get('[ng-reflect-router-link="/tache/3"]').click();
    cy.get('.btn').click();
    cy.url().should('eq', Cypress.config().baseUrl + 'taches');
  })

  it('should downgrade a tache', () => {
    DownGradeTache();
    cy.get('body').contains(tacheItemName);
    cy.get('body').contains('en cours');
  });

  it('should updategrade a tache', () => {
    DownGradeTache();
    DownGradeTache();
    UpgradeTache();
    cy.get('body').contains(tacheItemName);
    cy.get('body').contains('en cours');
  });
  
  function DownGradeTache(){
    cy.get(':nth-child(1) > .list-group-item > .justify-content-between > .d-flex > :nth-child(1)').click();
  } 

  function UpgradeTache(){
    cy.get(':nth-child(2) > .list-group-item > .justify-content-between > .d-flex > :nth-child(5)').click();
  }
});