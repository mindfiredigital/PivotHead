import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { PivotHeadWrapperComponent } from '@mindfiredigital/pivothead-angular';

const meta: Meta = {
  title: 'PivotHead',
  // The component property is not needed if you use a custom render function
  decorators: [
    moduleMetadata({
      // Import the module that makes your component available
      imports: [PivotHeadWrapperComponent],
      // Allow the use of the custom <pivot-head> tag in the template
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }),
  ],
  argTypes: {
    data: {
      control: 'object',
      description: 'The raw dataset to be processed.',
    },
    options: {
      control: 'object',
      description: 'Configuration options for the pivot table.',
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  // Use the render function to provide a template with the component's selector
  render: args => ({
    props: args,
    template: `<pivot-head [data]="data" [options]="options"></pivot-head>`,
  }),
  args: {
    data: [
      {
        product: 'Product A',
        category: 'Category 1',
        value: 100,
      },
      {
        product: 'Product B',
        category: 'Category 2',
        value: 150,
      },
      {
        product: 'Product A',
        category: 'Category 2',
        value: 200,
      },
    ],
    options: {
      rows: [{ uniqueName: 'product', caption: 'Product' }],
      columns: [{ uniqueName: 'category', caption: 'Category' }],
      measures: [
        { uniqueName: 'value', caption: 'Total Value', aggregation: 'sum' },
      ],
    },
  },
};
