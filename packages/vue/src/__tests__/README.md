# Vue Wrapper Tests

This directory contains comprehensive test suites for the PivotHead Vue wrapper component.

## Test Files

### `PivotHead.test.ts`

Main test suite covering:

- ✅ **Basic Rendering**: Component mounting, mode attributes, class/style props
- ✅ **Slot Rendering**: Minimal mode slot functionality
- ✅ **Props and Reactivity**: Data, options, filters, pagination prop handling
- ✅ **Event Handling**: state-change, view-mode-change, pagination-change events
- ✅ **Template Refs**: Method exposure and functionality
- ✅ **Error Handling**: Graceful handling of invalid inputs
- ✅ **Performance & Memory**: Event cleanup, rapid updates
- ✅ **Integration Tests**: Complete workflows and state synchronization

### `PivotHead.types.test.ts`

Type validation tests covering:

- ✅ **Prop Type Validation**: Ensuring all prop combinations are valid
- ✅ **Component Structure**: Vue component requirements
- ✅ **Complex Data Structures**: Nested objects, arrays, various data types
- ✅ **Flexible Configuration**: Options and filter configurations

### `setup.ts`

Test environment setup:

- Mocks web component imports
- Configures custom elements registry
- Sets up DOM environment
- Manages console output for clean test runs

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Type checking
pnpm typecheck
```

## Test Coverage

The test suite covers:

### ✅ **Core Functionality**

- Component rendering and mounting
- Prop passing and reactivity
- Event emission and handling
- Template ref method exposure

### ✅ **Edge Cases**

- Invalid/null/undefined props
- Rapid prop changes
- Component lifecycle management
- Error conditions

### ✅ **Performance**

- Memory leak prevention
- Event listener cleanup
- Concurrent updates
- Large dataset handling

### ✅ **TypeScript**

- Type safety validation
- Prop type checking
- Method signature validation
- Interface compliance

## Mock Strategy

Tests use a sophisticated mock strategy:

- **MockPivotHeadElement**: Simulates the underlying web component
- **Event System**: Proper event emission and listening
- **State Management**: Realistic state tracking
- **Method Mocking**: All exposed methods are mocked with realistic behavior

## Key Test Patterns

### Component Testing

```typescript
it('should render correctly', () => {
  const wrapper = mount(PivotHead, {
    props: { data: sampleData, options: sampleOptions },
  });

  expect(wrapper.exists()).toBe(true);
});
```

### Event Testing

```typescript
it('should emit events', async () => {
  const wrapper = mount(PivotHead, { props: { data, options } });

  const events = wrapper.emitted('stateChange');
  expect(events).toBeTruthy();
});
```

### Method Testing

```typescript
it('should expose methods', async () => {
  const wrapper = mount(PivotHead, { props: { data, options } });
  const methods = getExposedMethods(wrapper);

  expect(typeof methods.refresh).toBe('function');
});
```

### Type Testing

```typescript
it('should accept valid types', () => {
  const props: PivotHeadProps = { mode: 'default', data: [] };
  expect(props).toBeDefined();
});
```

## Best Practices

1. **Async Handling**: Use `flushPromises()` and `nextTick()` for async operations
2. **Cleanup**: Always unmount components to prevent memory leaks
3. **Mocking**: Use realistic mocks that match actual component behavior
4. **Type Safety**: Include TypeScript validation in tests
5. **Coverage**: Test both happy paths and edge cases
6. **Performance**: Include performance-related test scenarios

## Dependencies

- **Vitest**: Test runner and assertion library
- **@vue/test-utils**: Vue component testing utilities
- **jsdom**: DOM environment for testing
- **TypeScript**: Type checking and compilation
