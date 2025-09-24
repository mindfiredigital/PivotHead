/// <reference types="cypress" />

// Comprehensive tests for the Minimal UI page of the react demo
// Covers processed/raw views, filter, pagination, sorting, and drilldown modal

describe('React Demo - Minimal UI', () => {
  beforeEach(() => {
    cy.visit('/');
    // Navigate to Minimal page from App switcher
    cy.contains('button', 'Switch to Minimal').click();
    cy.contains('h1', 'Minimal UI').should('be.visible');
    // Wait for pivot table to render
    cy.get('#pivot-table').should('be.visible');
  });

  it('renders processed view with expected aggregates and supports drilldown', () => {
    // Ensure processed view is active (button text says Switch to Raw)
    cy.contains('button[aria-label="Switch view"]', 'Switch to Raw').should(
      'be.visible'
    );

    // Assert specific aggregate cells via data attributes
    // Furniture | Chairs | Sales sum = 1200
    cy.get(
      'td[data-row-value="Furniture"][data-column-value="Chairs"][data-measure-name="Sales"]'
    ).as('furnitureChairs');
    cy.get('@furnitureChairs').should('exist');
    cy.get('@furnitureChairs')
      .invoke('attr', 'data-aggregate-value')
      .should('eq', '1200');

    // Electronics | Laptops | Sales sum = 4500
    cy.get(
      'td[data-row-value="Electronics"][data-column-value="Laptops"][data-measure-name="Sales"]'
    ).as('electronicsLaptops');
    cy.get('@electronicsLaptops').should('exist');
    cy.get('@electronicsLaptops')
      .invoke('attr', 'data-aggregate-value')
      .should('eq', '4500');

    // Drilldown from a populated cell opens a modal
    cy.get('@electronicsLaptops').click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('#drilldown-title').should('contain.text', 'Details:');
    cy.contains('[role="dialog"]', 'Records:').should('be.visible');
    cy.get('button[aria-label="Close dialog"]').click();
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('applies and resets filters in processed view', () => {
    // Apply filter: Category equals Electronics
    cy.get('select[aria-label="Filter field"]').select('Category');
    cy.get('select[aria-label="Filter operator"]').select('Equals');
    cy.get('input[aria-label="Filter value"]').clear().type('Electronics');
    cy.get('button[aria-label="Apply filter"]').click();

    // Expect only Electronics rows present
    cy.get('td[data-row-value="Electronics"]').should('exist');
    cy.get('td[data-row-value="Furniture"]').should('not.exist');

    // Reset filter restores data
    cy.get('button[aria-label="Reset filter"]').click();
    cy.get('td[data-row-value="Furniture"]').should('exist');
  });

  it('supports pagination controls', () => {
    // Ensure unfiltered state
    cy.get('button[aria-label="Reset filter"]').click({ force: true });

    // Use a supported page size option (e.g., 5) and assert row count <= page size
    cy.get('select[aria-label="Page size"]').select('5');
    cy.contains('span', /^Page \d+ of \d+$/).should('contain.text', 'of');
    cy.get('#pivot-table tbody tr').should('have.length.at.most', 5);

    // Next/Prev should not break when total pages is 1
    cy.get('button[aria-label="Next page"]').click();
    cy.contains('span', /^Page \d+ of \d+$/).should('be.visible');
    cy.get('button[aria-label="Previous page"]').click();
    cy.contains('span', /^Page \d+ of \d+$/).should('be.visible');
  });

  it('switches to raw view and supports column sorting', () => {
    // Switch to Raw view
    cy.contains('button[aria-label="Switch view"]', 'Switch to Raw').click();
    cy.contains(
      'button[aria-label="Switch view"]',
      'Switch to Processed'
    ).should('be.visible');

    // Find index of Sales column in raw table header
    cy.get('#pivot-table thead tr.measures th').then($ths => {
      const headers = Array.from($ths);
      const salesIndex = headers.findIndex(
        th => th.getAttribute('data-sort-field') === 'Sales'
      );
      expect(salesIndex).to.be.greaterThan(-1);

      // Click Sales to sort ascending: expect first row Sales = 1200
      cy.wrap($ths.eq(salesIndex)).click();
      cy.get('#pivot-table tbody tr')
        .first()
        .find('td')
        .eq(salesIndex)
        .should('have.text', '1200');

      // Click Sales again to sort descending: expect first row Sales = 4500
      cy.wrap($ths.eq(salesIndex)).click();
      cy.get('#pivot-table tbody tr')
        .first()
        .find('td')
        .eq(salesIndex)
        .should('have.text', '4500');
    });
  });
});
