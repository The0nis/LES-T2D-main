describe('Listening to Music Acceptance Tests', () => {
  // Shared variables to store test data
  const email = 'test@email.com';
  const password = 'aA!123456789';

  before(() => {
    cy.visit('http://localhost:3000/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://localhost:3000/');
  });

  it('AT007: Listening to Music', () => {
    cy.visit('http://localhost:3000/profile/songs');
    cy.get('div[id="Test Song"]').trigger('mouseover');
    cy.get('div[id="Test Song"] button').click();
    cy.get('div[id="Music Player"]').contains('Test Song');
    cy.get('div[id="Music Player"]').contains('test');
  });
});
