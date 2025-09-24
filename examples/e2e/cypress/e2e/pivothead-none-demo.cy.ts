/// <reference types="cypress" />

// E2E for PivotHead None Mode Demo (headless UI controlled by host page)
// Assumes the demo runs on port 5177

describe('pivothead-none-demo (web component, none mode)', () => {
  const base = Cypress.config('baseUrl') || 'http://localhost:5177';

  beforeEach(() => {
    cy.visit(base + '/index.html');
    cy.get('pivot-head#pivot').should('exist');
    // The demo renders its own DOM outside shadow; verify table present after init
    cy.get('table#table', { timeout: 10000 }).should('exist');
  });

  it('renders processed view and paginates', () => {
    cy.contains('button', 'Switch to Raw');
    cy.get('#pageInfo').should('contain.text', 'Page');

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

  it('supports sorting by row header and measure', () => {
    // Row header is first th in the measures row
    cy.get('table#table thead tr.measures th').first().click();
    cy.get('table#table thead tr.measures th')
      .first()
      .should('have.class', 'sorted-asc');

    // Click any other header to toggle sorting
    cy.get('table#table thead tr.measures th').eq(1).click();
    cy.get('table#table thead tr.measures th')
      .eq(1)
      .should($th => {
        expect($th.hasClass('sorted-asc') || $th.hasClass('sorted-desc')).to.be
          .true;
      });
  });

  it('filters and resets', () => {
    cy.get('#filterField').children().should('have.length.greaterThan', 0);

    cy.get('#filterField').then($sel => {
      const firstVal = $sel.val() as string;
      if (!firstVal) return;
      cy.wrap($sel).select(firstVal);
      cy.get('#filterOperator').select('equals');
      const guess = firstVal.includes('country')
        ? 'Australia'
        : firstVal.includes('category')
          ? 'Accessories'
          : '180';
      cy.get('#filterValue').clear().type(guess);
      cy.get('#applyFilter').click();
      cy.get('#pageInfo').should('contain.text', 'Page 1 of');
    });

    cy.get('#resetFilter').click();
    cy.get('#pageInfo').should('contain.text', 'Page 1 of');
  });

  it('switches to raw view and sorts', () => {
    cy.contains('button', 'Switch to Raw').click();
    cy.contains('button', 'Switch to Processed');

    cy.get('table#table thead tr.measures th').should(
      'have.length.greaterThan',
      1
    );
    cy.get('table#table thead tr.measures th').first().click();
    cy.get('table#table thead tr.measures th')
      .first()
      .should('have.class', 'sorted-asc');
  });

  it('opens drilldown modal on processed cell click and can close it', () => {
    // Ensure processed mode
    cy.get('body').then($body => {
      const btn = $body
        .find('button')
        .filter((_, b) =>
          (b.textContent || '').includes('Switch to Processed')
        );
      if (btn.length) cy.wrap(btn.first()).click();
    });

    cy.get('td.drill-down-cell')
      .filter(
        (_, el) => el.textContent?.trim() && el.textContent?.trim() !== '0'
      )
      .first()
      .click({ force: true });

    // Modal content is appended to body (outside shadow)
    cy.contains('div', 'Details:').should('be.visible');

    // Close via X button
    cy.get('body').then($body => {
      const closeBtn = $body
        .find('button')
        .filter((_, b) => b.textContent === '×');
      if (closeBtn.length) cy.wrap(closeBtn.first()).click({ force: true });
    });
  });
});
