import { useRouter } from 'vue-router';
import { getSupabaseClient } from '../lib/supabase';

export function useLogout() {
  const router = useRouter();

  async function logout() {
    try {
      const { error } = await getSupabaseClient().auth.signOut();

      if (error) {
        throw error;
      }

      await router.replace('/home');
    } catch (error) {
      console.error('Unable to log out.', error);
      window.alert(error instanceof Error ? error.message : 'Unable to log out. Please try again.');
    }
  }

  return { logout };
}
