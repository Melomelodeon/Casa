describe('My First Test', () => {
  it('Visits the app root url', () => {
    cy.visit('/')
    cy.contains('h1', 'Find a place')
    cy.contains('h2', 'Spaces worth')
  })
})
