describe('User Profile Acceptance Tests', () => {
  // Shared variables to store test data
  let email;
  let password;

  before(() => {
    // Run seed
    email = 'test@email.com';
    password = 'aA!123456789';
  });

  it('AT0124122: Navigate to user profile', () => {
    cy.visit('http://localhost:3000/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://localhost:3000/');

    // locate the dropdown menu in the bottom left

    cy.get('button[id="user_menu"]').click();
    cy.get('a').contains('Profile').click();
    cy.url().should('eq', 'http://localhost:3000/profile');
    cy.log('Navigated to user profile');
  });

  it('AT0124123: Edit personal information', () => {
    cy.visit('http://localhost:3000/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://localhost:3000/');
    cy.visit('http://localhost:3000/profile');

    cy.get('button[id="edit-profile"]').click();

    cy.get('input[name="username"]').clear().type('John');
    cy.get('button[role=combobox]').click();
    cy.get('div').contains('Male').click();
    cy.get('input[name="phone"]').clear().type('0612345678');

    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://localhost:3000/profile');
    cy.get('p').contains('John');
    cy.get('p').contains('male');
    cy.get('p').contains('0612345678');
    cy.log('Personal information updated');
  });

  it('AT0124124: Change address information', () => {
    cy.visit('http://localhost:3000/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://localhost:3000/');
    cy.visit('http://localhost:3000/profile');

    cy.get('div[id="edit-address"]').click();

    cy.get('button[role=combobox]').contains('Select Country').click();
    cy.get('div').contains('The Netherlands').click();
    cy.get('input[name="city"]').clear().type('Amersfoort');
    cy.get('button[role=combobox]').contains('Select State').click();
    cy.get('div').contains('Utrecht').click();
    cy.get('input[name="street"]').clear().type('De Straat 1');
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://localhost:3000/profile');

    cy.get('div[id="edit-address"]').click();

    cy.url().should('eq', 'http://localhost:3000/profile');
    cy.log('Address information updated');
  });

  it('AT012412: Change password', () => {
    cy.visit('http://localhost:3000/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://localhost:3000/');
    cy.visit('http://localhost:3000/profile');

    cy.get('button[id="edit-password"]').click();

    cy.get('input[name="new_password"]').clear().type('aA!1234567890');
    cy.get('input[name="password_confirmation"]').clear().type('aA!1234567890');
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://localhost:3000/profile');

    cy.get('button[id="edit-password"]').click();

    // change back for other tests

    cy.get('button[id="edit-password"]').click();

    cy.get('input[name="new_password"]').clear().type('aA!123456789');
    cy.get('input[name="password_confirmation"]').clear().type('aA!123456789');
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', 'http://localhost:3000/profile');
    cy.get('button[id="edit-password"]').click();
    cy.log('Password changed');
  });
});
