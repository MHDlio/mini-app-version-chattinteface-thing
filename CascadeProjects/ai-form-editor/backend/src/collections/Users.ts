import { CollectionConfig } from 'payload/types';

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 7200, // 2 hours
    verify: true,
    maxLoginAttempts: 5,
    lockTime: 600 * 1000, // 10 minutes
    useAPIKey: true,
    depth: 2,
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: process.env.COOKIE_DOMAIN,
    },
  },
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
    defaultColumns: ['email', 'name', 'roles', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.roles?.includes('admin')) {
        return true;
      }
      return { id: { equals: user?.id } };
    },
    create: () => true,
    update: ({ req: { user } }) => {
      if (user?.roles?.includes('admin')) {
        return true;
      }
      return { id: { equals: user?.id } };
    },
    delete: ({ req: { user } }) => {
      return Boolean(user?.roles?.includes('admin'));
    },
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      validate: (val) => {
        if (!validateEmail(val)) {
          throw new Error('Please enter a valid email address');
        }
        return true;
      },
    },
    {
      name: 'password',
      type: 'password',
      required: true,
      minLength: 8,
      maxLength: 128,
      validate: (val) => {
        if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(val)) {
          throw new Error('Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character');
        }
        return true;
      },
    },
    {
      name: 'name',
      type: 'group',
      fields: [
        {
          name: 'first',
          type: 'text',
          required: true,
        },
        {
          name: 'last',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      defaultValue: ['editor'],
      required: true,
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
        {
          label: 'User',
          value: 'user',
        },
      ],
      access: {
        create: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
        update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
      },
    },
    {
      name: 'organization',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'profile',
      type: 'group',
      fields: [
        {
          name: 'profilePicture',
          type: 'upload',
          relationTo: 'media',
          required: false,
          filterOptions: {
            mimeType: { contains: 'image' },
          },
        },
        {
          name: 'bio',
          type: 'textarea',
          required: false,
          maxLength: 500,
        },
        {
          name: 'contactNumber',
          type: 'text',
          required: false,
          validate: (val) => {
            if (val && !validatePhoneNumber(val)) {
              throw new Error('Please enter a valid phone number in international format');
            }
            return true;
          },
        },
        {
          name: 'socialLinks',
          type: 'array',
          fields: [
            {
              name: 'platform',
              type: 'select',
              options: [
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'Twitter', value: 'twitter' },
                { label: 'GitHub', value: 'github' },
              ],
            },
            {
              name: 'url',
              type: 'text',
              validate: (val) => {
                if (!/^https?:\/\//.test(val)) {
                  throw new Error('Please enter a valid URL starting with http:// or https://');
                }
                return true;
              },
            },
          ],
        },
      ],
    },
    {
      name: 'settings',
      type: 'group',
      fields: [
        {
          name: 'language',
          type: 'select',
          defaultValue: 'en',
          options: [
            { label: 'English', value: 'en' },
            { label: 'German', value: 'de' },
            { label: 'Arabic', value: 'ar' },
          ],
        },
        {
          name: 'theme',
          type: 'select',
          defaultValue: 'system',
          options: [
            { label: 'System', value: 'system' },
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
          ],
        },
        {
          name: 'notifications',
          type: 'group',
          fields: [
            {
              name: 'email',
              type: 'checkbox',
              defaultValue: true,
              label: 'Email Notifications',
            },
            {
              name: 'inApp',
              type: 'checkbox',
              defaultValue: true,
              label: 'In-App Notifications',
            },
            {
              name: 'marketing',
              type: 'checkbox',
              defaultValue: false,
              label: 'Marketing Communications',
            },
          ],
        },
        {
          name: 'twoFactorAuth',
          type: 'group',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: false,
              label: 'Enable Two-Factor Authentication',
            },
            {
              name: 'method',
              type: 'select',
              defaultValue: 'email',
              options: [
                { label: 'Email', value: 'email' },
                { label: 'SMS', value: 'sms' },
                { label: 'Authenticator App', value: 'authenticator' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'consent',
      type: 'group',
      fields: [
        {
          name: 'termsAccepted',
          type: 'checkbox',
          required: true,
          label: 'I accept the Terms of Service and Privacy Policy',
        },
        {
          name: 'dataProcessing',
          type: 'checkbox',
          required: true,
          label: 'I agree to the processing of my personal data',
        },
        {
          name: 'marketingConsent',
          type: 'checkbox',
          required: false,
          label: 'I agree to receive marketing communications',
        },
      ],
    },
    {
      name: 'lastLogin',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'loginAttempts',
      type: 'number',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Suspended', value: 'suspended' },
      ],
      access: {
        update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ req, operation, data }) => {
        if (operation === 'create') {
          data.loginAttempts = 0;
        }
        return data;
      },
    ],
    afterLogin: [
      async ({ req, doc }) => {
        await req.payload.update({
          collection: 'users',
          id: doc.id,
          data: {
            lastLogin: new Date(),
            loginAttempts: 0,
          },
        });
      },
    ],
    afterOperation: [
      async ({ operation, doc }) => {
        if (operation === 'create') {
          // Send welcome email
          // Implement email sending logic here
        }
      },
    ],
  },
  indexes: [
    {
      fields: { email: 1 },
      unique: true,
    },
    {
      fields: { organization: 1 },
    },
    {
      fields: { status: 1 },
    },
  ],
};
