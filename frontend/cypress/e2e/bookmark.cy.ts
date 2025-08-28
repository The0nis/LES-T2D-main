describe('Playlist Bookmark Acceptance Test', () => {
  it('AT012: Bookmark a Song', () => {
    cy.visit('http://localhost:3000/login');

    cy.get('input[name="email"]').type('test@email.com');
    cy.get('input[name="password"]').type('aA!123456789');
    cy.get('button[type="submit"]').click();

    cy.url().should('eq', 'http://localhost:3000/');

    cy.visit('http://localhost:3000/profile/songs');
    cy.get('div[id="Test Song"]').rightclick();

    cy.contains('Like!').click();
    cy.contains('Music liked');
  });

  it('AT013: Remove a Bookmark', () => {
    cy.visit('http://localhost:3000/login');

    cy.get('input[name="email"]').type('test@email.com');
    cy.get('input[name="password"]').type('aA!123456789');
    cy.get('button[type="submit"]').click();

    cy.url().should('eq', 'http://localhost:3000/');

    cy.contains('Liked Songs').click();
    cy.contains('div', 'Test Song').siblings('button').click();
    cy.contains('Music deleted from playlist');
  });
});
