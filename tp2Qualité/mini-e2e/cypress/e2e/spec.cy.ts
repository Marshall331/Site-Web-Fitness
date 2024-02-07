describe('Mon premier test', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  it("Visiter la page d'accueil", () => {
    cy.contains('mini-e2e')
  })
  it('incrémenter le compteur', () => {
    cy.visit('/')
    cy.get('#compteur').should('have.text', '1')
    cy.get('#oneUp').click()
    cy.get('#compteur').should('have.text', '2')
  })
  it('reset le compteur', () => {
    cy.visit('/')
    cy.get('#compteur').should('have.text', '1')
    // Générer un nombre aléatoire entre 1 et 50
    const nbClicks = Math.floor(Math.random() * 50) + 1;
    for (let i = 0; i < nbClicks; i++) {
      cy.get('#onReset').click();
    }
    cy.get('#compteur').should('have.text', '0')
  })
})


