
import { config } from 'dotenv';
config();

import '@/ai/flows/save-user-preferences.ts';
import '@/ai/flows/search-music.ts';
import '@/ai/flows/get-song-insights.ts';
import '@/ai/flows/search-artists.ts';
import '@/ai/flows/get-artist-albums.ts';
import '@/ai/flows/admin/make-admin.ts';
import '@/ai/flows/admin/on-create-user.ts';
import '@/ai/flows/admin/list-users.ts';
import '@/ai/flows/admin/generate-driver-code.ts';
import '@/ai/flows/admin/list-drivers.ts';
import '@/ai/flows/admin/delete-user.ts';
import '@/ai/flows/admin/delete-driver.ts';
