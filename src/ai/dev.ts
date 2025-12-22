
import { config } from 'dotenv';
config();

import '@/ai/flows/on-create-user.ts';
import '@/ai/flows/make-admin.ts';
import '@/ai/flows/generate-driver-code.ts';
import '@/ai/flows/list-users.ts';
import '@/ai/flows/list-drivers.ts';
