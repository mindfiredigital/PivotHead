// import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
// // import { PivotheadAngularModule } from './pivothead-angular.module';
// import { PivotHeadWrapperComponent } from './pivothead-wrapper.component';
// import { sampleData, sampleOptions } from '../../../../examples/pivot-head-angular-demo/src/app/sample-data';

// const meta: Meta<PivotHeadWrapperComponent> = {
//   title: 'PivotHead/PivotHeadWrapperComponent',
//   component: PivotHeadWrapperComponent,
//   tags: ['autodocs'],

//   argTypes: {},
// };

// export default meta;
// type Story = StoryObj<PivotHeadWrapperComponent>;

// export const Default: Story = {
//   args: {
//     data: sampleData,
//     options: sampleOptions,
//   },
// };

// import type { Meta, StoryObj } from '@storybook/angular';
// import { applicationConfig } from '@storybook/angular';
// import { importProvidersFrom } from '@angular/core'; // 1. Import this function
// import { PivotHeadWrapperComponent } from './pivothead-wrapper.component';
// import { sampleData, sampleOptions } from '../../../../examples/pivot-head-angular-demo/src/app/sample-data';
// import { StandaloneComponentModule } from './standalone-component.module'; // 2. Create and import a helper module

// const meta: Meta<PivotHeadWrapperComponent> = {
//   title: 'PivotHead/PivotHeadWrapperComponent',
//   component: PivotHeadWrapperComponent,
//   tags: ['autodocs'],
//   decorators: [
//     applicationConfig({
//       // 3. Provide the component via this array
//       providers: [importProvidersFrom(StandaloneComponentModule)],
//     }),
//   ],
//   argTypes: {},
// };

// export default meta;
// type Story = StoryObj<PivotHeadWrapperComponent>;

// export const Default: Story = {
//   args: {
//     data: sampleData,
//     options: sampleOptions,
//   },
// };

// import type { Meta, StoryObj } from '@storybook/angular';
// import { moduleMetadata } from '@storybook/angular';
// import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
// import { PivotHeadWrapperComponent } from './pivothead-wrapper.component';
// import { sampleData, sampleOptions } from '../../../../examples/pivot-head-angular-demo/src/app/sample-data';

// const meta: Meta<PivotHeadWrapperComponent> = {
//   title: 'PivotHead/PivotHeadWrapperComponent',
//   component: PivotHeadWrapperComponent, // <-- MAKE SURE THIS LINE EXISTS
//   tags: ['autodocs'],
//   decorators: [
//     moduleMetadata({
//       schemas: [CUSTOM_ELEMENTS_SCHEMA],
//     }),
//   ],
//   argTypes: {},
// };

// export default meta;
// type Story = StoryObj<PivotHeadWrapperComponent>;

// export const Default: Story = {
//   args: {
//     data: sampleData,
//     options: sampleOptions,
//   },
// };

// pivothead-wrapper.stories.ts

// pivothead-wrapper.stories.ts

import type { Meta, StoryObj } from '@storybook/angular';
import { PivotHeadWrapperComponent } from './pivothead-wrapper.component';
import { applicationConfig } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  PaginationConfig,
  PivotTableState,
} from '../../../core/dist/types/interfaces';
import { PivotDataRecord } from '../../../web-component/dist';

// Define the type for the data items
interface DataItem {
  id: number;
  name: string;
  department: string;
  salary: number;
  hireDate: string;
  [key: string]: any; // Allow additional properties
}

// Define the type for the component props
interface PivotHeadWrapperProps {
  data: DataItem[];
  options: {
    columns: Array<{
      uniqueName: string;
      caption: string;
      width?: string;
      sortable?: boolean;
      filter?: boolean;
      type?: string;
      format?: any;
    }>;
    rowSelection: 'single' | 'multiple' | boolean;
    pagination: boolean | object;
    pageSize?: number;
    showToolbar?: boolean;
  };
  mode: 'default' | 'minimal' | 'none';
  filters?: any[];
  pagination?: any;
}

// Common args for all stories
const commonArgs: PivotHeadWrapperProps = {
  data: [
    {
      id: 1,
      name: 'John Doe',
      department: 'Engineering',
      salary: 85000,
      hireDate: '2020-01-15',
    },
    {
      id: 2,
      name: 'Jane Smith',
      department: 'Marketing',
      salary: 78000,
      hireDate: '2019-05-22',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      department: 'Engineering',
      salary: 92000,
      hireDate: '2018-11-03',
    },
    {
      id: 4,
      name: 'Sarah Williams',
      department: 'HR',
      salary: 68000,
      hireDate: '2021-03-10',
    },
    {
      id: 5,
      name: 'David Brown',
      department: 'Marketing',
      salary: 75000,
      hireDate: '2020-07-18',
    },
  ],
  options: {
    columns: [
      { uniqueName: 'id', caption: 'ID', width: '80px' },
      { uniqueName: 'name', caption: 'Name', sortable: true },
      { uniqueName: 'department', caption: 'Department', filter: true },
      {
        uniqueName: 'salary',
        caption: 'Salary',
        type: 'currency',
        format: { currency: 'USD' },
      },
      { uniqueName: 'hireDate', caption: 'Hire Date', type: 'date' },
    ],
    rowSelection: 'multiple',
    pagination: true,
    pageSize: 10,
    showToolbar: true,
  },
  mode: 'default',
};

const meta: Meta<PivotHeadWrapperComponent> = {
  title: 'Components/PivotHeadWrapper',
  component: PivotHeadWrapperComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  args: commonArgs,
  render: args => ({
    props: {
      data: args['data'],
      options: args['options'],
      filters: args['filters'],
      pagination: args['pagination'],
      mode: args['mode'],
      onStateChange: (event: CustomEvent<PivotTableState<PivotDataRecord>>) =>
        console.log('State changed:', event.detail),
      onViewModeChange: (event: CustomEvent<{ mode: 'raw' | 'processed' }>) =>
        console.log('View mode changed:', event.detail),
      onPaginationChange: (event: CustomEvent<PaginationConfig>) =>
        console.log('Pagination changed:', event.detail),
    },
    template: `
      <div style="height: 600px; width: 100%;">
        <pivot-head-wrapper
          [data]="data"
          [options]="options"
          [filters]="filters"
          [pagination]="pagination"
          [mode]="mode"
          (stateChange)="onStateChange($event)"
          (viewModeChange)="onViewModeChange($event)"
          (paginationChange)="onPaginationChange($event)"
        >
          <div slot="header">
            <h2>Custom Header Content</h2>
            <p>This is a custom header that appears in minimal mode</p>
          </div>
          <div slot="body">
            <p>Custom body content can go here in minimal mode</p>
          </div>
        </pivot-head-wrapper>
      </div>
    `,
  }),
  argTypes: {
    mode: {
      control: 'select',
      options: ['default', 'minimal', 'none'],
      description: 'Display mode of the pivot table',
    },
  },
};

export default meta;
type Story = StoryObj<PivotHeadWrapperComponent>;

export const Default: Story = {
  args: { ...commonArgs },
};

export const WithGrouping: Story = {
  args: {
    ...commonArgs,
    options: {
      ...commonArgs.options,
      groupConfig: {
        rowFields: ['department'],
        columnFields: [],
        grouper: (item: any, fields: string[]) =>
          fields.map(field => item[field]).join('-'),
      },
    },
  },
};

export const WithFilters: Story = {
  args: {
    ...commonArgs,
    filters: [
      { field: 'department', operator: 'equals', value: 'Engineering' },
      { field: 'salary', operator: 'greaterThan', value: 80000 },
    ],
  },
};

export const MinimalMode: Story = {
  args: {
    ...commonArgs,
    mode: 'minimal',
  },
};

export const WithPagination: Story = {
  args: {
    ...commonArgs,
    pagination: {
      pageSize: 2,
      currentPage: 1,
      totalPages: 3,
    },
  },
};

// This story demonstrates how to use the component methods
export const WithMethods: Story = {
  args: {
    ...commonArgs,
  },
  render: args => ({
    props: {
      data: args['data'],
      options: args['options'],
      filters: args['filters'],
      pagination: args['pagination'],
      mode: args['mode'],
      onRefresh: () => {
        const pivotTable = document.querySelector('pivot-head-wrapper') as any;
        if (pivotTable) {
          pivotTable.refresh();
          console.log('Table refreshed');
        }
      },
      onExportToExcel: () => {
        const pivotTable = document.querySelector('pivot-head-wrapper') as any;
        if (pivotTable) {
          pivotTable.exportToExcel('pivot-data');
        }
      },
    },
    template: `
      <div>
        <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem;">
          <button (click)="onRefresh()" style="padding: 0.5rem 1rem; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Refresh Table
          </button>
          <button (click)="onExportToExcel()" style="padding: 0.5rem 1rem; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Export to Excel
          </button>
        </div>
        <div style="height: 500px; width: 100%;">
          <pivot-head-wrapper
            [data]="data"
            [options]="options"
            [mode]="mode"
          ></pivot-head-wrapper>
        </div>
      </div>
    `,
  }),
};
