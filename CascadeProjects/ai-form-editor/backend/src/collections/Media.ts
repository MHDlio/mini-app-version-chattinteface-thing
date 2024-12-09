import { CollectionConfig } from 'payload/types';

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: '../media',
    staticURL: '/media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'preview',
        width: 800,
        height: 600,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'metadata',
      type: 'group',
      fields: [
        {
          name: 'fileType',
          type: 'text',
        },
        {
          name: 'fileSize',
          type: 'number',
        },
        {
          name: 'dimensions',
          type: 'group',
          fields: [
            {
              name: 'width',
              type: 'number',
            },
            {
              name: 'height',
              type: 'number',
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (req.files?.file) {
          const file = req.files.file;
          data.metadata = {
            fileType: file.mimetype,
            fileSize: file.size,
          };
        }
        return data;
      },
    ],
  },
};
