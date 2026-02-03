
import { mockService } from './mockService';
import { supabaseService } from './supabaseService';

// Ativado para utilizar a integração real com Supabase
const USE_REAL_API = true;

export const api = USE_REAL_API ? supabaseService : mockService;
