import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(
    supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes('your-supabase-project') &&
    !supabaseKey.includes('your_supabase_service_role_key')
  );
}

export const supabase = isSupabaseConfigured()
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Resilient In-Memory & Local Fallback Store if Supabase credentials are not provided
class LocalDataStore {
  constructor() {
    this.interactions = [];
    this.forms = [];
    this.documents = [];
    this.profiles = [
      {
        id: 'default-user',
        full_name: 'Accessible User',
        preferred_language: 'en-US',
        speech_rate: 1.0,
        font_scale: 'large',
        high_contrast: false,
        created_at: new Date().toISOString()
      }
    ];
  }

  async saveInteraction({ raw_transcript, ai_response_text, intent_category, language_code, user_id }) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('voice_interactions')
          .insert([{ raw_transcript, ai_response_text, intent_category, language_code, user_id: user_id || null }])
          .select();
        if (!error && data) return data[0];
      } catch (e) {
        console.warn('Supabase insert failed, using local store:', e.message);
      }
    }
    const record = {
      id: 'local-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      raw_transcript,
      ai_response_text,
      intent_category,
      language_code: language_code || 'en-US',
      created_at: new Date().toISOString()
    };
    this.interactions.unshift(record);
    return record;
  }

  async getInteractions(limit = 20) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('voice_interactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase select failed, using local store:', e.message);
      }
    }
    return this.interactions.slice(0, limit);
  }

  async saveForm({ form_title, form_data, is_completed, user_id }) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('saved_forms')
          .insert([{ form_title, form_data, is_completed, user_id: user_id || null }])
          .select();
        if (!error && data) return data[0];
      } catch (e) {
        console.warn('Supabase form insert failed, using local store:', e.message);
      }
    }
    const record = {
      id: 'form-' + Date.now(),
      form_title,
      form_data,
      is_completed,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.forms.unshift(record);
    return record;
  }

  async getForms(limit = 20) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('saved_forms')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase get forms failed, using local store:', e.message);
      }
    }
    return this.forms.slice(0, limit);
  }

  async saveDocument({ original_text, simplified_summary, key_action_items, language_code, user_id }) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('simplified_documents')
          .insert([{ original_text, simplified_summary, key_action_items, language_code, user_id: user_id || null }])
          .select();
        if (!error && data) return data[0];
      } catch (e) {
        console.warn('Supabase document insert failed, using local store:', e.message);
      }
    }
    const record = {
      id: 'doc-' + Date.now(),
      original_text,
      simplified_summary,
      key_action_items,
      language_code: language_code || 'en-US',
      created_at: new Date().toISOString()
    };
    this.documents.unshift(record);
    return record;
  }

  async getDocuments(limit = 20) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('simplified_documents')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase get documents failed, using local store:', e.message);
      }
    }
    return this.documents.slice(0, limit);
  }
}

export const db = new LocalDataStore();
