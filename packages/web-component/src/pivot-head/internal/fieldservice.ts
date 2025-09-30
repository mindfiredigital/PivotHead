import { IField, EnhancedPivotEngine } from '../../types/types';

/**
 * Manages field-related operations for the PivotHead web component.
 *
 * @param engine - The PivotEngine instance.
 * @returns An object with methods to interact with the pivot table's fields.
 */
const fieldService = (engine: EnhancedPivotEngine<Record<string, unknown>>) => {
  return {
    /**
     * Retrieves the current list of fields from the pivot engine.
     * These fields are derived from the 'dimensions' in your configuration
     * and are available to be used in rows, columns, or as measures.
     *
     * @returns An array of IField objects, each representing a data field.
     */
    getFields: (): IField[] => {
      const state = engine.getState();
      return (
        state.selectedDimensions.map(d => ({
          uniqueName: d.field,
          caption: d.label,
          dataType: d.type,
        })) || []
      );
    },

    /**
     * Updates the fields available to the pivot engine. This is useful
     * for dynamically changing the data schema or available dimensions
     * without re-initializing the entire component.
     *
     * @param fields - An array of new IField objects to set.
     */
    setFields: (fields: IField[]): void => {
      engine.setDimensions(
        fields.map(f => ({
          field: f.uniqueName,
          label: f.caption || f.uniqueName,
          type: f.dataType as 'string' | 'date',
        }))
      );
    },

    /**
     * Adds a new field to the pivot table's list of available dimensions.
     *
     * @param field - The IField object to add.
     */
    addField: (field: IField): void => {
      const state = engine.getState();
      const currentFields = (state.selectedDimensions || []).map(d => ({
        uniqueName: d.field,
        caption: d.label,
        dataType: d.type,
      }));
      const newFields = [...currentFields, field];
      engine.setDimensions(
        newFields.map(f => ({
          field: f.uniqueName,
          label: f.caption || f.uniqueName,
          type: f.dataType as 'string' | 'date',
        }))
      );
    },

    /**
     * Removes a field from the pivot table's list of available dimensions
     * based on its unique name.
     *
     * @param fieldName - The unique name of the field to remove.
     */
    removeField: (fieldName: string): void => {
      const state = engine.getState();
      const currentFields = (state.selectedDimensions || []).map(d => ({
        uniqueName: d.field,
        caption: d.label,
        dataType: d.type,
      }));
      const newFields = currentFields.filter(f => f.uniqueName !== fieldName);
      engine.setDimensions(
        newFields.map(f => ({
          field: f.uniqueName,
          label: f.caption || f.uniqueName,
          type: f.dataType as 'string' | 'date',
        }))
      );
    },
  };
};

export default fieldService;
