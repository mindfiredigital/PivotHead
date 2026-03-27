import { describe, it, expect } from 'vitest';
import { ActionParser } from '../ActionParser.js';

describe('ActionParser', () => {
  const parser = new ActionParser();

  describe('parse() — valid action types', () => {
    it('parses a filter action', () => {
      const result = parser.parse(
        '{"type":"filter","field":"category","operator":"equals","value":"Electronics"}'
      );
      expect(result).toEqual({
        type: 'filter',
        field: 'category',
        operator: 'equals',
        value: 'Electronics',
      });
    });

    it('parses a removeFilter action', () => {
      const result = parser.parse('{"type":"removeFilter","field":"category"}');
      expect(result).toEqual({ type: 'removeFilter', field: 'category' });
    });

    it('parses a sort action', () => {
      const result = parser.parse(
        '{"type":"sort","field":"sales","direction":"desc"}'
      );
      expect(result).toEqual({
        type: 'sort',
        field: 'sales',
        direction: 'desc',
      });
    });

    it('parses a groupBy action', () => {
      const result = parser.parse('{"type":"groupBy","field":"region"}');
      expect(result).toEqual({ type: 'groupBy', field: 'region' });
    });

    it('parses a topN action', () => {
      const result = parser.parse(
        '{"type":"topN","n":5,"measure":"revenue","order":"desc"}'
      );
      expect(result).toEqual({
        type: 'topN',
        n: 5,
        measure: 'revenue',
        order: 'desc',
      });
    });

    it('parses an aggregate action', () => {
      const result = parser.parse(
        '{"type":"aggregate","field":"sales","func":"sum"}'
      );
      expect(result).toEqual({
        type: 'aggregate',
        field: 'sales',
        func: 'sum',
      });
    });

    it('parses a resetAll action', () => {
      const result = parser.parse('{"type":"resetAll"}');
      expect(result).toEqual({ type: 'resetAll' });
    });

    it('parses an export action', () => {
      const result = parser.parse('{"type":"export","format":"csv"}');
      expect(result).toEqual({ type: 'export', format: 'csv' });
    });

    it('parses a switchTab action', () => {
      const result = parser.parse('{"type":"switchTab","tab":"analytics"}');
      expect(result).toEqual({ type: 'switchTab', tab: 'analytics' });
    });

    it('parses a chartType action', () => {
      const result = parser.parse('{"type":"chartType","chartType":"bar"}');
      expect(result).toEqual({ type: 'chartType', chartType: 'bar' });
    });

    it('parses an answer action', () => {
      const result = parser.parse(
        '{"type":"answer","text":"Total sales is 5000"}'
      );
      expect(result).toEqual({ type: 'answer', text: 'Total sales is 5000' });
    });

    it('parses a clarify action', () => {
      const result = parser.parse(
        '{"type":"clarify","question":"Which field do you mean?"}'
      );
      expect(result).toEqual({
        type: 'clarify',
        question: 'Which field do you mean?',
      });
    });

    it('parses an error action', () => {
      const result = parser.parse(
        '{"type":"error","message":"Something failed"}'
      );
      expect(result).toEqual({ type: 'error', message: 'Something failed' });
    });

    it('parses a style action', () => {
      const result = parser.parse(
        '{"type":"style","target":"row","value":"Electronics","property":"backgroundColor","style":"red"}'
      );
      expect(result).toEqual({
        type: 'style',
        target: 'row',
        value: 'Electronics',
        property: 'backgroundColor',
        style: 'red',
      });
    });

    it('parses a resetStyle action', () => {
      const result = parser.parse('{"type":"resetStyle"}');
      expect(result).toEqual({ type: 'resetStyle' });
    });
  });

  describe('parse() — JSON extraction from prose', () => {
    it('extracts JSON embedded in surrounding text', () => {
      const result = parser.parse(
        'Here is the action you need: {"type":"sort","field":"sales","direction":"asc"} Hope that helps!'
      );
      expect(result).toEqual({
        type: 'sort',
        field: 'sales',
        direction: 'asc',
      });
    });

    it('extracts the first JSON object when multiple are present', () => {
      const result = parser.parse(
        '{"type":"sort","field":"a","direction":"asc"} {"type":"groupBy","field":"b"}'
      );
      expect(result).toEqual({ type: 'sort', field: 'a', direction: 'asc' });
    });

    it('handles JSON with nested objects', () => {
      const result = parser.parse(
        '{"type":"filter","field":"price","operator":"greaterThan","value":{"amount":100}}'
      );
      expect(result.type).toBe('filter');
    });
  });

  describe('parse() — error cases', () => {
    it('returns error action when no JSON is found', () => {
      const result = parser.parse('Sort by sales please');
      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.message).toContain('No JSON object found');
      }
    });

    it('returns error action when JSON is malformed', () => {
      const result = parser.parse('{type: sort, field: sales}');
      expect(result.type).toBe('error');
    });

    it('returns answer action when action type is unknown', () => {
      const result = parser.parse('{"type":"format","field":"date"}');
      expect(result.type).toBe('answer');
      if (result.type === 'answer') {
        expect(result.text).toContain('format');
      }
    });

    it('returns error action for empty string', () => {
      const result = parser.parse('');
      expect(result.type).toBe('error');
    });
  });
});
