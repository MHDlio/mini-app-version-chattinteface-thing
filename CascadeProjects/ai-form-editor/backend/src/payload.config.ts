import { buildConfig } from 'payload/config';
import { webpackBundler } from '@payloadcms/bundler-webpack';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { slateEditor } from '@payloadcms/richtext-slate';
import path from 'path';
import { Forms } from './collections/Forms';
import { FormSubmissions } from './collections/FormSubmissions';
import { Media } from './collections/Media';
import { Users } from './collections/Users';

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
  },
  editor: slateEditor({}),
  collections: [Forms, FormSubmissions, Media, Users],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  db: mongooseAdapter({
    url: process.env.MONGODB_URI as string,
  }),
  cors: [
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  csrf: [
    'http://localhost:3000',
    'http://localhost:3001',
  ],
});
