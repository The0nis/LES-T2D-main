describe('Search Acceptance Tests', () => {
  // Shared variables to store test data
  let email;
  let password;

  before(() => {
    // Run seed
    email = 'test@email.com';
    password = 'aA!123456789';
  });

  it('AT015: Search Track', () => {
    cy.visit('http://localhost:3000/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://localhost:3000/');

    cy.get('input[id="search"]').type('Test{enter}');
    cy.url().should('eq', 'http://localhost:3000/search?query=Test');
    cy.contains('Test Song');
    cy.log('Song found in search results');
  });
});
