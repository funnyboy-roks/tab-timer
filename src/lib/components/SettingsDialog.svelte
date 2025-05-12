<script lang="ts">
    import { Button } from '$lib/shadcn/components/ui/button';
    import * as Dialog from '$lib/shadcn/components/ui/dialog';
    import { Label } from '$lib/shadcn/components/ui/label';
    import { Slider } from '$lib/shadcn/components/ui/slider';
    import type { Settings } from '$lib/types';
    import { sounds } from '$lib/types';
    import { PauseIcon, PlayIcon } from 'lucide-svelte';
    import { onDestroy } from 'svelte';

    let { settings = $bindable(), open = $bindable() }: { settings: Settings; open: boolean } =
        $props();

    let x = $state([settings.volume]);
    $effect(() => {
        settings.volume = x[0];
    });

    let playing = $state(false);
    let audio: HTMLAudioElement;

    const createAudio = () => {
        if (audio) {
            audio.pause();
            audio.remove();
        }
        audio = new Audio(`/${settings.audio}.mp3`);
        audio.loop = true;
        audio.volume = settings.volume;
    };

    // Initialize audio
    createAudio();

    // Update audio when sound changes
    $effect(() => {
        createAudio();
    });

    // Update volume when it changes
    $effect(() => {
        if (audio) {
            audio.volume = settings.volume;
        }
    });

    // Stop audio when dialog closes
    $effect(() => {
        if (!open && playing) {
            audio.pause();
            playing = false;
        }
    });

    const toggle_sound = () => {
        if (playing) {
            audio.pause();
            playing = false;
            console.log('stopped audio');
        } else {
            audio.play();
            playing = true;
            console.log('started audio', audio);
        }
    };

    // Cleanup on component destroy
    onDestroy(() => {
        if (audio) {
            audio.pause();
            audio.remove();
        }
    });
</script>

<Dialog.Content>
    <Dialog.Header>
        <Dialog.Title>Settings</Dialog.Title>
    </Dialog.Header>
    <Dialog.Description>
        <div class="flex flex-col space-y-6">
            <div class="flex w-full items-center space-x-4">
                <Label for="sound" class="min-w-24 text-nowrap">Alarm Sound</Label>
                <select
                    id="sound"
                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    bind:value={settings.audio}
                >
                    {#each sounds as sound}
                        <option value={sound}>
                            {sound.charAt(0).toUpperCase() + sound.slice(1)}
                        </option>
                    {/each}
                </select>
                <Button variant="ghost" size="icon" class="shrink-0 p-2" on:click={toggle_sound}>
                    {#if playing}
                        <PauseIcon class="h-4 w-4" />
                    {:else}
                        <PlayIcon class="h-4 w-4" />
                    {/if}
                </Button>
            </div>
            <div class="flex w-full items-center space-x-4">
                <Label for="volume" class="min-w-24 text-nowrap">Alarm Volume</Label>
                <Slider id="volume" bind:value={x} max={1} min={0} step={0.01} />
            </div>
        </div>
    </Dialog.Description>
</Dialog.Content>
