// Template for functionSchema used by the generator loaders
// Copy this file when creating new script schemas and update values.

functionSchema = {
  // Human readable name shown in the UI
  functionName: 'Template Function',
  // Short description displayed under the title
  description: 'A short description of what this function does.',
  // Fields define the inputs shown in the UI. Each field supports several types.
  fields: [
    {
      // Unique key for the field
      name: 'exampleField',
      // Label shown above the input
      label: 'Example Field',
      // Type: 'input' | 'multiline' | 'rows' | 'pairs' | 'triples' | 'checkboxGroup' | 'dropdown' | 'radio'
      type: 'input',
      // Single placeholder for simple inputs or textareas
      placeholder: 'Enter value here',
      // Whether this field accepts multiple entries (multiple lines/rows). Default: false
      allowMultiple: false,
      // Optional maximum entries when allowMultiple is true. Omit or set 0 for unlimited.
      maxEntries: 0,
      // For multi-column editors, provide an array of placeholders (length determines columns)
      // placeholders: ['Col A','Col B','Col C'],
      // Optional help text shown under the control
      tips: 'Helpful hint for editors.',
      // Default value (string) shown in the input
      default: ''
    }
  ],
  // Example options: used to pre-populate list/textarea or rows editor. For rows use '|' as column separator.
  options: [
    'alpha|beta|gamma',
    'one|two|three'
  ]
};
