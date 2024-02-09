const targetHero = 'Magneta'
const targetHeroID = 15
const newHeroName = "fabrice"

describe('Tour of Heroes App Testing', () => {
    beforeEach(() => {
    })
    it(`Should have the title 'Tour Of Heroes'`, () => {
        cy.visit('/')
        cy.contains('Tour of Heroes')
    })
    it(`Should have title 'Top Heroes'`, () => {
        cy.visit('/dashboard')
        cy.contains('Top Heroes')
    })
    it(`Should have title 'Hero Search'`, () => {
        cy.visit('/dashboard')
        cy.contains('Hero Search')
    })
    it(`Should select and route to (${targetHero}) Hero details`, dashboardSelecTargetHero)

    it(`Back to home'`, () => {
        cy.visit('/')
        cy.contains('Tour of Heroes')
    })
    it(`Should add (${newHeroName}) in Heroes list`, heroesAddHero)
    it('Should be able to see the dashboard', dashboardOpeningCheck)
    it('Should be able to see the heroes', heroesOpeningCheck)
    it(`Should delete (${newHeroName}) in Heroes list`, heroesDeleteHero)
    it(`Should open (${newHeroName}) detail from heroes list`, heroesDetailOpenInList)
})

function heroesDetailOpenInList() {
    cy.visit('/heroes')
    cy.get('ul.heroes').contains('li', targetHeroID).find('.hero-detail').click();
    cy.url().should('include', '/detail/15');
    cy.url().should('eq', 'http://localhost:4200/detail/15');
}

function heroesOpeningCheck() {
    cy.visit('/heroes')
    cy.url().should('include', '/heroes');
    cy.get('.content nav a').contains('Dashboard').click();
    cy.get('.content nav a').contains('Heroes').click();
    cy.url().should('include', '/heroes');
}

function heroesDeleteHero() {
    cy.visit('/heroes')
    cy.get('ul.heroes').contains('li', targetHeroID).find('.delete').click();
    cy.get('ul.heroes').should('not.contain', targetHero)
}

function dashboardOpeningCheck() {
    cy.visit('/dashboard')
    cy.url().should('include', '/dashboard');
    cy.get('.content nav a').contains('Heroes').click();
    cy.get('.content nav a').contains('Dashboard').click();
    cy.url().should('include', '/dashboard');
}

function heroesAddHero() {
    cy.visit('/heroes')
    cy.get('#new-hero').clear().type(newHeroName)
    cy.get('.add-button').click()
    cy.get('ul.heroes').contains(newHeroName)
}

function dashboardSelecTargetHero() {
    cy.visit('/dashboard')
    cy.contains(targetHero).click();
    // Ensuring Url routed properly
    cy.url().should('include', '/detail/15');
    cy.url().should('eq', '/');
}
