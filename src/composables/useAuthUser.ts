import { onMounted, onUnmounted, ref } from 'vue';
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '../lib/supabase';

export function useAuthUser() {
  const user = ref<User | null>(null);
  let unsubscribe: (() => void) | undefined;

  onMounted(async () => {
    const supabase = getSupabaseClient();
    const { data } = await supabase.auth.getUser();
    user.value = data.user;

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null;
    });
    unsubscribe = () => authListener.subscription.unsubscribe();
  });

  onUnmounted(() => unsubscribe?.());

  return { user };
}
