/// <reference types="cypress" />

// Tests PivotHead Minimal Mode web component demo

describe('pivothead-minimal-demo (web component, minimal mode)', () => {
  const base = Cypress.config('baseUrl') || 'http://localhost:5176';

  beforeEach(() => {
    cy.visit(base);
  });

  it('renders processed view with grouped headers and measures, supports pagination', () => {
    cy.get('pivot-head#pivot').should('exist');

    // Processed by default
    cy.contains('button', 'Switch to Raw');

    // Headers
    cy.get('table#table thead tr.groups th').should(
      'have.length.greaterThan',
      1
    );
    cy.get('table#table thead tr.measures th').should(
      'have.length.greaterThan',
      1
    );

    // Pagination info
    cy.get('#pageInfo').should('contain.text', 'Page');

    // Next page then previous page (allow time for UI to update)
    cy.get('#nextPage').click();
    cy.get('#pageInfo', { timeout: 8000 })
      .invoke('text')
      .then(t => t.trim())
      .should('match', /Page\s+\d+\s+of\s+\d+/);

    cy.get('#prevPage').click();
    cy.get('#pageInfo', { timeout: 8000 })
      .invoke('text')
      .then(t => t.trim())
      .should('match', /Page\s+\d+\s+of\s+\d+/);
  });

  it('sorts by row label and by a measure for a specific column', () => {
    // Click the row header to sort by row labels
    cy.get('table#table thead tr.measures th').first().click();
    cy.get('table#table thead tr.measures th')
      .first()
      .should('have.class', 'sorted-asc');

    // Find a measure header and click to sort
    cy.get('table#table thead tr.measures th[data-measure-unique]')
      .first()
      .as('measure');
    cy.get('@measure').click();
    cy.get('@measure').should($th => {
      expect($th.hasClass('sorted-asc') || $th.hasClass('sorted-desc')).to.be
        .true;
    });
  });

  it('filters data and can reset filter', () => {
    // Ensure filter field populated
    cy.get('#filterField').children().should('have.length.greaterThan', 0);

    // Apply a filter (choose first option and equals some existing value)
    cy.get('#filterField').then($sel => {
      const firstVal = $sel.val() as string;
      if (!firstVal) return;
      cy.wrap($sel).select(firstVal);
      cy.get('#filterOperator').select('equals');
      // Try a known value from dataset
      const guess = firstVal.includes('country')
        ? 'Australia'
        : firstVal.includes('category')
          ? 'Accessories'
          : '180';
      cy.get('#filterValue').clear().type(guess);
      cy.get('#applyFilter').click();
      cy.get('#pageInfo').should('contain.text', 'Page 1 of');
    });

    // Reset
    cy.get('#resetFilter').click();
    cy.get('#pageInfo').should('contain.text', 'Page 1 of');
  });

  it('switches to raw view and sorts columns', () => {
    cy.contains('button', 'Switch to Raw').click();
    cy.contains('button', 'Switch to Processed');

    // Raw table headers exist
    cy.get('table#table thead tr.measures th').should(
      'have.length.greaterThan',
      1
    );

    // Sort by first column
    cy.get('table#table thead tr.measures th').first().click();
    cy.get('table#table thead tr.measures th')
      .first()
      .should('have.class', 'sorted-asc');
  });

  it('opens and closes drilldown modal from processed cell', () => {
    // Ensure we are in processed mode; if currently raw, switch back
    cy.get('body').then($body => {
      const btn = $body
        .find('button')
        .filter((_, b) =>
          (b.textContent || '').includes('Switch to Processed')
        );
      if (btn.length) {
        cy.wrap(btn.first()).click();
      }
    });

    // Click a non-empty cell
    cy.get('td.drill-down-cell')
      .filter(
        (_, el) => el.textContent?.trim() && el.textContent?.trim() !== '0'
      )
      .first()
      .click({ force: true });

    // Modal should appear outside shadow DOM
    cy.contains('div', 'Details:').should('be.visible');

    // Close the modal by clicking the overlay or X
    cy.get('body').then($body => {
      const closeBtn = $body
        .find('button')
        .filter((_, b) => b.textContent === '×');
      if (closeBtn.length) cy.wrap(closeBtn.first()).click({ force: true });
    });
  });
});
