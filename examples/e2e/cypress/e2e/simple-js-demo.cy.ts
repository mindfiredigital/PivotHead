/// <reference types="cypress" />

// E2E coverage for the simple-js-demo example
// Validates processed/raw rendering, filtering, pagination, sorting and drilldown

describe('Simple JS Demo', () => {
  beforeEach(() => {
    cy.visit('/');
    // Controls and main table placeholders should exist
    cy.get('.controls').should('exist');
    cy.get('#myTable').should('exist');
  });

  it('renders processed view by default and shows aggregates', () => {
    // Expect table to render with headers and cells
    cy.get('table').should('exist');
    cy.get('thead').should('exist');
    cy.get('tbody tr').its('length').should('be.greaterThan', 0);

    // Header top-left shows Country / Category (or Country when using __all__)
    cy.get('thead th')
      .first()
      .invoke('text')
      .then(text => {
        expect(text.trim()).to.match(/Country(\s*\/\s*Category)?/);
      });
  });

  it('can filter rows by country and reset', () => {
    // Set filter Country equals Australia
    cy.get('#filterField').select('country');
    cy.get('#filterOperator').select('equals');
    cy.get('#filterValue').clear().type('Australia');
    cy.get('#applyFilter').click();

    // Expect at least one Australia row and no rows from other countries (top visible page)
    cy.get('tbody tr td.row-cell').each($td => {
      const val = $td.text().trim();
      expect(val).to.eq('Australia');
    });

    // Reset
    cy.get('#resetFilter').click();
    cy.get('tbody tr td.row-cell').contains('Australia');
  });

  it('paginates processed table', () => {
    cy.get('#pageSize').select('2');
    cy.get('#pageInfo').should('contain.text', 'Page');
    cy.get('tbody tr').should('have.length.at.most', 2);
    cy.get('#nextPage').click();
    cy.get('#pageInfo').should('contain.text', 'Page');
    cy.get('#prevPage').click();
  });

  it('sorts by a measure and by row field', () => {
    // Click first measure header twice to toggle asc/desc
    cy.get('thead tr').eq(1).find('th').eq(1).click();
    cy.get('thead tr').eq(1).find('th').eq(1).click();

    // Click row header to sort row labels
    cy.get('thead tr').eq(1).find('th').first().click();
  });

  it('supports drilldown on a populated cell', () => {
    // Find a cell that looks populated (not header)
    cy.get('tbody tr')
      .first()
      .within(() => {
        cy.get('td').eq(1).dblclick({ force: true });
      });

    // A modal should appear per createDrillDownModal
    cy.get('.drill-down-modal').should('be.visible');
    cy.get('.drill-down-content').should('be.visible');

    // Close the modal
    cy.get('.drill-down-close').click({ force: true });
    cy.get('.drill-down-modal').should('not.exist');
  });

  it('switches to raw data view and sorts a column', () => {
    // Switch to raw data
    cy.get('#switchView').click();
    cy.get('#pageInfo').should('contain', 'Raw Data');

    // Click a header to sort
    cy.get('thead th.raw-data-header').eq(0).click();
    cy.get('tbody tr').its('length').should('be.greaterThan', 0);
  });
});
