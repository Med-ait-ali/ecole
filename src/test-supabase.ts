import { supabase } from './lib/supabase';

async function testConnection() {
  console.log('🔍 جاري اختبار الاتصال بـ Supabase...');
  
  const { data, error } = await supabase.from('users').select('*').limit(1);
  
  if (error) {
    console.error('❌ خطأ في الاتصال:', error.message);
  } else {
    console.log('✅ الاتصال ناجح!', data);
  }
}

testConnection();