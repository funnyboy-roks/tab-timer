<script lang="ts">
    import { Button } from '$lib/shadcn/components/ui/button';
    import * as Dialog from '$lib/shadcn/components/ui/dialog';
    import { Label } from '$lib/shadcn/components/ui/label';
    import { Slider } from '$lib/shadcn/components/ui/slider';
    import type { Settings } from '$lib/types';
    import { PauseIcon, PlayIcon } from 'lucide-svelte';

    let { settings = $bindable() }: { settings: Settings } = $props();

    let x = $state([settings.volume]);
    $effect(() => {
        settings.volume = x[0];
    });

    let playing = $state(false);
    let audio = new Audio(`/${settings.audio}.mp3`);
    audio.loop = true;
    $effect(() => {
        audio.volume = settings.volume;
    });
    const toggle_sound = () => {
        if (playing) {
            audio.pause();
            audio.fastSeek(0);
            playing = false;
            console.log('stopped audio');
        } else {
            audio.play();
            playing = true;
            console.log('started audio', audio);
        }
    };
</script>

<Dialog.Content>
    <Dialog.Header>
        <Dialog.Title>Settings</Dialog.Title>
    </Dialog.Header>
    <Dialog.Description>
        <div class="flex w-full items-center space-x-4">
            <Label for="volume" class="text-nowrap">Alarm Volume</Label>
            <Slider id="volume" bind:value={x} max={1} min={0} step={0.01} />
            <Button variant="ghost" size="icon" class="p-2" onclick={toggle_sound}>
                {#if playing}
                    <PauseIcon fill="currentColor" class="h-4 w-4" />
                {:else}
                    <PlayIcon fill="currentColor" class="h-4 w-4" />
                {/if}
            </Button>
        </div>
    </Dialog.Description>
</Dialog.Content>
