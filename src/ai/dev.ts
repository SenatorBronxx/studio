
import { config } from 'dotenv';
config();

import '@/ai/flows/save-user-preferences.ts';
import '@/ai/flows/search-music.ts';
import '@/ai/flows/get-song-insights.ts';
import '@/ai/flows/search-artists.ts';
import '@/ai/flows/get-artist-albums.ts';
import '@/ai/flows/admin/make-admin';
import '@/ai/flows/admin/generate-driver-code';
import '@/ai/flows/admin/list-users';
import '@/ai/flows/admin/delete-user';
import '@/ai/flows/admin/delete-driver';
import '@/ai/flows/admin/list-drivers';
import '@/ai/flows/admin/create-new-user';
