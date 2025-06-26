import { supabase } from './config/supabase';

async function testSupabaseConnection() {
  try {
    // Testar a conexão com o Supabase
    const { data, error } = await supabase.from('users').select('*').limit(1);
    
    if (error) {
      console.error('Erro ao conectar com o Supabase:', error);
    } else {
      console.log('Conexão com o Supabase estabelecida com sucesso!');
      console.log('Dados retornados:', data);
    }
  } catch (err) {
    console.error('Erro inesperado:', err);
  }
}

testSupabaseConnection();