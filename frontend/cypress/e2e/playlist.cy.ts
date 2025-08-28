describe('Playlist Acceptance Test', () => {
  let name;
  let name2;

  before(() => {
    //const adjective = faker.word.adjective();
    //const noun = faker.word.noun();
    name = 'ttest_playlist';
    name2 = name.slice(1);

    cy.visit('http://localhost:3000/login');

    cy.get('input[name="email"]').type('test@email.com');
    cy.get('input[name="password"]').type('aA!123456789');
    cy.get('button[type="submit"]').click();

    cy.url().should('eq', 'http://localhost:3000/');
  });

  it('AT01: Create Playlist', () => {
    //test@email.com aA!123456789
    //Test Song

    cy.visit('http://localhost:3000/profile/songs');
    cy.get('div[id="Test Song"]').rightclick();

    cy.contains('Add to Playlist').click();
    cy.contains('New Playlist').should('be.visible');
    cy.contains('New Playlist').click();

    cy.get('input[name="title"]').clear().type(name, { delay: 200 });
    cy.get('button[type="submit"]').click();
    cy.contains('Playlist created successfully!');
  });

  it('AT02: Add song to a Playlist', () => {
    cy.visit('http://localhost:3000/login');

    cy.get('input[name="email"]').type('test@email.com');
    cy.get('input[name="password"]').type('aA!123456789');
    cy.get('button[type="submit"]').click();

    cy.url().should('eq', 'http://localhost:3000/');

    cy.visit('http://localhost:3000/profile/songs');
    cy.get('div[id="Test Song"]').rightclick();

    cy.contains('Add to Playlist').click();
    cy.get('div[role="menuitem"]').eq(3).click();
    cy.contains('Music added to playlist');
  });

  it('AT03: Remove a song from a Playlist', () => {
    cy.visit('http://localhost:3000/login');

    cy.get('input[name="email"]').type('test@email.com');
    cy.get('input[name="password"]').type('aA!123456789');
    cy.get('button[type="submit"]').click();

    cy.url().should('eq', 'http://localhost:3000/');

    cy.contains(new RegExp(`${name}|${name2}`)).click();
    cy.contains('div', 'Test Song').siblings('button').click();
    cy.contains('Music deleted from playlist');
  });

  it('AT04: Delete a Playlist', () => {
    cy.visit('http://localhost:3000/login');

    cy.get('input[name="email"]').type('test@email.com');
    cy.get('input[name="password"]').type('aA!123456789');
    cy.get('button[type="submit"]').click();

    cy.url().should('eq', 'http://localhost:3000/');

    cy.contains('div', new RegExp(`${name}|${name2}`))
      .siblings('button')
      .click();
    cy.contains('Playlist Deleted');
  });
});
