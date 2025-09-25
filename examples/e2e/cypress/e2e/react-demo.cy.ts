/// <reference types="cypress" />

describe('React Demo App', () => {
  it('loads Default UI and can sort and filter', () => {
    cy.visit('/');

    // Should render Default UI page
    cy.contains('h1', 'Default UI').should('be.visible');

    // Controls should exist
    cy.contains('button', 'Sort by Sales (DESC)').should('be.visible');
    cy.contains('button', 'Filter Electronics').should('be.visible');

    // Ensure the pivot element is mounted before interacting
    cy.get('pivot-head').should('exist');

    // Click sort then filter
    cy.contains('button', 'Sort by Sales (DESC)').click();
    cy.contains('button', 'Filter Electronics').click();

    // Validate via web component API
    cy.get('pivot-head').then($el => {
      const el = $el.get(0) as HTMLElement & {
        getGroupedData?: () => Array<{
          key?: string;
          aggregates?: Record<string, unknown>;
        }>;
      };
      const groups = el.getGroupedData?.() || [];
      expect(groups.length).to.be.greaterThan(0);

      // All row keys should be Electronics after filter
      const rowKeys = groups.map(g => (g.key ? g.key.split('|')[0] : ''));
      expect(rowKeys.every(k => k === 'Electronics')).to.eq(true);

      // Electronics | Laptops aggregate should be 4500 for sum_Sales
      const laptopsGroup = groups.find(
        g =>
          (g.key || '').includes('Electronics') &&
          (g.key || '').includes('Laptops')
      );
      expect(laptopsGroup, 'found laptops group').to.exist;
      const aggVal = Number(laptopsGroup?.aggregates?.['sum_Sales'] ?? 0);
      expect(aggVal).to.eq(4500);
    });
  });
});
