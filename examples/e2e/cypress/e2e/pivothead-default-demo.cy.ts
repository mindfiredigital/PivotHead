/// <reference types="cypress" />

describe('PivotHead Default Web Component Demo', () => {
  beforeEach(() => {
    cy.visit('/index.html');
    cy.get('pivot-head').should('exist');
  });

  it('renders processed view and aggregates are present', () => {
    // Shadow DOM is used; use includeShadowDom
    cy.get('pivot-head', { includeShadowDom: true })
      .shadow()
      .find('table')
      .should('exist');

    // Check a header exists and some rows are rendered
    cy.get('pivot-head', { includeShadowDom: true })
      .shadow()
      .find('thead th')
      .its('length')
      .should('be.greaterThan', 0);

    cy.get('pivot-head', { includeShadowDom: true })
      .shadow()
      .find('tbody tr')
      .its('length')
      .should('be.greaterThan', 0);
  });

  it('drilldown opens on double-click of a data cell', () => {
    // Pick a populated drilldown cell within shadow DOM
    cy.get('pivot-head', { includeShadowDom: true })
      .shadow()
      .find('td.drill-down-cell')
      .first()
      .dblclick({ force: true });

    // Modal is appended to document.body (outside shadow DOM)
    cy.get('.drill-down-modal').should('exist');
  });

  it('sorts a measure by clicking its header twice', () => {
    // Re-query between clicks to avoid detached elements
    cy.get('pivot-head', { includeShadowDom: true })
      .shadow()
      .find('thead tr')
      .eq(1)
      .find('th.measure-header')
      .first()
      .click();

    cy.get('pivot-head', { includeShadowDom: true })
      .shadow()
      .find('thead tr')
      .eq(1)
      .find('th.measure-header')
      .first()
      .click();

    cy.get('pivot-head', { includeShadowDom: true })
      .shadow()
      .find('tbody tr')
      .its('length')
      .should('be.greaterThan', 0);
  });
});
