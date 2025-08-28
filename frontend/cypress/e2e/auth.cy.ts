import { faker } from '@faker-js/faker';

describe('Authentication Acceptance Tests', () => {
  // Shared variables to store test data
  let email;
  let password;

  before(() => {
    // Generate email and password for tests
    email = faker.internet.email();

    // Generate a password with at least 8 characters
    // and at least one uppercase letter, one lowercase letter,
    // one number, and one special character
    password = faker.internet.password({
      length: 10,
      prefix: 'Aa1!',
    });
  });

  it('AT001: Sign UP', () => {
    cy.visit('http://localhost:3000/register');

    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="confirmPassword"]').type(password);

    cy.get('button[type="submit"]').click();

    // Verify account creation
    cy.url().should('eq', 'http://localhost:3000/login');
    cy.contains('Registration Successful');
    cy.contains(
      'You have successfully registered! You can now login to your account.'
    );

    cy.log('Sign-up completed in the setup step.');
  });

  it('AT002: Login', () => {
    // Log in using the created account
    cy.visit('http://localhost:3000/login');

    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();

    // Verify successful login
    cy.url().should('eq', 'http://localhost:3000/');
    cy.contains(email);

    cy.log('Login completed in the setup step.');
  });

  it('AT003: Logout', () => {
    // Log in using the created account
    cy.visit('http://localhost:3000/login');

    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();

    // Log out from the application
    cy.get('p').contains(email).click();
    cy.get('div').contains('Log Out').click();

    // Verify successful logout
    cy.url().should('eq', 'http://localhost:3000/login');

    cy.log('Logout completed in the setup step.');
  });

  it('AT006: Delete Account', () => {
    // Log in using the created account
    cy.visit('http://localhost:3000/login');

    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();

    // Delete the account
    cy.get('p').contains(email).click();
    cy.get('a').contains('Profile').click();

    // Click the delete account button
    cy.get('button').contains('Delete Account').click();

    // Confirm the deletion
    cy.get('button').contains('Proceed').click();

    // Verify successful account deletion
    cy.url().should('eq', 'http://localhost:3000/login');

    cy.log('Account deletion completed in the setup step.');
  });
});
