<script lang="ts">
  import '../app.css';
  import { onMount, setContext } from 'svelte';
  import { writable } from 'svelte/store';

  let dark = $state(true);
  let lang = writable<'es' | 'gl' | 'en'>('es');

  setContext('lang', lang);

  onMount(() => {
    dark = localStorage.getItem('wike_theme') !== 'light';
    const savedLang = localStorage.getItem('wike_lang') as 'es' | 'gl' | 'en' | null;
    if (savedLang) lang.set(savedLang);
    applyDark();
  });

  function toggleDark() {
    dark = !dark;
    localStorage.setItem('wike_theme', dark ? 'dark' : 'light');
    applyDark();
  }

  function cycleLang() {
    lang.update(l => {
      const next = l === 'es' ? 'gl' : l === 'gl' ? 'en' : 'es';
      localStorage.setItem('wike_lang', next);
      return next;
    });
  }

  function applyDark() {
    document.documentElement.classList.toggle('dark', dark);
  }
</script>

<slot />

<div class="fixed bottom-4 right-4 z-50 flex items-center gap-1">
  <button
    onclick={cycleLang}
    class="h-7 px-2 rounded-md text-xs font-semibold bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
    title="Cambiar idioma / Change language"
  >
    {$lang.toUpperCase()}
  </button>
  <button
    onclick={toggleDark}
    class="h-7 w-7 rounded-md flex items-center justify-center bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
    title={dark ? 'Modo claro' : 'Modo oscuro'}
  >
    {#if dark}
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
    {:else}
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    {/if}
  </button>
</div>
