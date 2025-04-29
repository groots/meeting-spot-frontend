/// <reference types="cypress" />

describe('Redirect functionality', () => {
  it('should redirect from /meetings to /dashboard when logged in', () => {
    // Mock being logged in
    cy.intercept('GET', '**/api/v1/auth/me', {
      statusCode: 200,
      body: {
        id: 'test-user-id',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User'
      }
    }).as('getUser');

    // Set up token in local storage
    cy.window().then((win: Cypress.AUTWindow) => {
      win.localStorage.setItem('auth_token', 'fake-jwt-token');
    });

    // Visit the meetings page
    cy.visit('/meetings');

    // It should redirect to dashboard
    cy.url().should('include', '/dashboard');
  });

  it('should redirect from /meetings/123 to /meeting/123', () => {
    // Mock being logged in
    cy.intercept('GET', '**/api/v1/auth/me', {
      statusCode: 200,
      body: {
        id: 'test-user-id',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User'
      }
    }).as('getUser');

    // Set up token in local storage
    cy.window().then((win: Cypress.AUTWindow) => {
      win.localStorage.setItem('auth_token', 'fake-jwt-token');
    });

    // Mock meeting request data
    const testId = '123e4567-e89b-12d3-a456-426614174000';
    cy.intercept('GET', `**/api/v1/meeting-requests/${testId}`, {
      statusCode: 200,
      body: {
        id: testId,
        status: 'COMPLETED',
        user_b_contact: 'test@example.com',
        location_type: 'Restaurant',
        created_at: new Date().toISOString()
      }
    }).as('getMeeting');

    // Visit the meetings page with ID
    cy.visit(`/meetings/${testId}`);

    // It should redirect to the meeting page with the same ID
    cy.url().should('include', `/meeting/${testId}`);
  });
}); 