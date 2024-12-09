import { CollectionConfig } from 'payload/types';

export const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['form', 'createdAt', 'status'],
  },
  access: {
    read: () => true,
    create: () => true,
  },
  fields: [
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
    },
    {
      name: 'data',
      type: 'json',
      required: true,
    },
    {
      name: 'files',
      type: 'array',
      fields: [
        {
          name: 'field',
          type: 'text',
          required: true,
        },
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    {
      name: 'aiAnalysis',
      type: 'group',
      fields: [
        {
          name: 'confidence',
          type: 'number',
          min: 0,
          max: 100,
        },
        {
          name: 'suggestions',
          type: 'array',
          fields: [
            {
              name: 'field',
              type: 'text',
              required: true,
            },
            {
              name: 'value',
              type: 'text',
              required: true,
            },
            {
              name: 'confidence',
              type: 'number',
              min: 0,
              max: 100,
              required: true,
            },
            {
              name: 'reason',
              type: 'text',
            },
          ],
        },
        {
          name: 'errors',
          type: 'array',
          fields: [
            {
              name: 'field',
              type: 'text',
              required: true,
            },
            {
              name: 'message',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'metadata',
      type: 'json',
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation === 'create') {
          // Here you can add logic to trigger AI analysis
          // For example, sending to a queue or processing directly
        }
      },
    ],
  },
  timestamps: true,
};
