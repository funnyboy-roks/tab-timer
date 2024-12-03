<script lang="ts">
    import DisplayMode from '$lib/components/DisplayMode.svelte';
    import * as AlertDialog from '$lib/shadcn/components/ui/alert-dialog';
    import { Button } from '$lib/shadcn/components/ui/button';
    import { Input } from '$lib/shadcn/components/ui/input';

    let timeout: undefined | (() => void);
    let time_remaining = $state(0);
    let target: Date | null = $state(null);
    let seconds: number = $state(0);
    type ActiveItem = 'countdown' | 'alarm' | 'stopwatch' | null;
    let active: ActiveItem = $state(null);

    let dialog_state: {
        shown: boolean;
        target: Date | null;
        active: ActiveItem;
        seconds: number;
    } = $state({
        shown: false,
        target: null,
        active: null,
        seconds: 0,
    });

    const audio = new Audio('/alarm.mp3');
    audio.loop = true;

    const show_alert = () => {
        dialog_state.active = $state.snapshot(active);
        dialog_state.target = $state.snapshot(target);
        dialog_state.seconds = $state.snapshot(seconds);
        active = null;
        dialog_state.shown = true;

        audio.fastSeek(0);
        audio.play();
    };

    $effect(() => {
        if (!dialog_state.shown) {
            audio.pause();
        }
    });

    let countdown: { h: number | ''; m: number | ''; s: number | '' } = $state({
        h: '',
        m: '',
        s: '',
    });
    let alarm: { h: number | ''; m: number | ''; s: number | '' } = $state({
        h: '',
        m: '',
        s: '',
    });

    const sleep = (delay: number) => new Promise<void>((res) => setTimeout(() => res(), delay));

    const time_until = (date: Date) => Math.round((date.valueOf() - Date.now()) / 1000);

    const update_delay = 500;

    const update = () => {
        let kill = false;
        (async () => {
            do {
                if (!target) break;
                time_remaining = time_until(target);
                await sleep(update_delay);
            } while (!kill && time_remaining > 0);
            if (!kill) {
                show_alert();
            }
        })();
        return () => (kill = true);
    };

    const update_stopwatch = () => {
        let kill = false;
        (async () => {
            while (!kill) {
                if (!target) break;
                const remaining = Date.now() - target.valueOf();
                time_remaining = Math.floor(remaining / 1000);
                await sleep(remaining % 1000 || 1000);
            }
        })();
        return () => (kill = true);
    };

    const clamp = (n: number, min: number, max: number) => (n < min ? min : n > max ? max : n);

    const update_input = () => {
        if (countdown.h) countdown.h = clamp(countdown.h, 0, Infinity);
        if (countdown.m) countdown.m = clamp(countdown.m, 0, 59);
        if (countdown.s) countdown.s = clamp(countdown.s, 0, 59);

        if (alarm.h) alarm.h = clamp(alarm.h, 0, 23);
        if (alarm.m) alarm.m = clamp(alarm.m, 0, 59);
        if (alarm.s) alarm.s = clamp(alarm.s, 0, 59);
    };

    const reset = () => {
        time_remaining = 0;
        active = null;
        dialog_state.shown = false;
        if (timeout !== undefined) timeout();
        timeout = undefined;
    };

    const start_countdown = () => {
        reset();
        active = 'countdown';
        console.log(countdown);
        seconds = (countdown.h || 0) * 60 * 60 + (countdown.m || 0) * 60 + (countdown.s || 0);
        target = new Date(Date.now() + seconds * 1000);
        timeout = update();

        console.log(time_remaining);
    };

    const start_alarm = () => {
        reset();
        active = 'alarm';
        console.log(alarm);

        let date = new Date();
        date.setHours(alarm.h || 0);
        date.setMinutes(alarm.m || 0);
        date.setSeconds(alarm.s || 0);

        // if time set after, then do the future
        if (date.valueOf() < Date.now()) {
            date = new Date(date.valueOf() + 24 * 60 * 60 * 1000);
        }

        console.log(date);

        target = date;

        timeout = update();
        console.log(time_remaining);
    };

    const start_stopwatch = () => {
        reset();
        active = 'stopwatch';
        console.log('stopwatch');

        target = new Date();
        time_remaining = 0;

        timeout = update_stopwatch();
    };

    const format_time = (n: number, letters = false) => {
        const s = n % 60;
        n = Math.floor(n / 60);
        const m = n % 60;
        n = Math.floor(n / 60);
        const h = n % 60;

        if (letters) {
            let out = '';
            if (h) out += (h + '').padStart(2, '0') + 'h';
            if (m) out += (m + '').padStart(2, '0') + 'm';
            if (s) out += (s + '').padStart(2, '0') + 's';

            return out || '00s';
        } else {
            let out = [];
            if (h) out.push((h + '').padStart(2, '0'));
            if (h || m) out.push((m + '').padStart(2, '0'));
            out.push((s + '').padStart(2, '0'));

            return out.join(':');
        }
    };

    const title_case = (s: string) => {
        return s
            .split(/[ _-]/g)
            .map((s) => s[0].toUpperCase() + s.substring(1).toLowerCase())
            .join(' ');
    };

    const dtf = Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    const format_date = (date: Date | number) => dtf.format(date);
</script>

<svelte:head>
    {#if active}
        <title>{format_time(time_remaining, true)}</title>
    {:else if dialog_state.shown && dialog_state.active}
        <title>{title_case(dialog_state.active)} done!</title>
    {:else}
        <title>Tab Timer</title>
    {/if}
</svelte:head>

<AlertDialog.Root bind:open={dialog_state.shown}>
    <AlertDialog.Content>
        {#if dialog_state.active}
            <AlertDialog.Header>
                <AlertDialog.Title>
                    {title_case(dialog_state.active)} is complete!
                </AlertDialog.Title>
                <AlertDialog.Description>
                    {#if dialog_state.active === 'countdown'}
                        Your countdown for {format_time(dialog_state.seconds, true)} has completed.
                    {:else if dialog_state.active === 'alarm'}
                        Your alarm for {format_date(dialog_state.target || 0)} has completed.
                    {/if}
                </AlertDialog.Description>
            </AlertDialog.Header>
            <AlertDialog.Footer>
                <AlertDialog.Action>Dismiss</AlertDialog.Action>
            </AlertDialog.Footer>
        {/if}
    </AlertDialog.Content>
</AlertDialog.Root>

<div class="flex h-[100vh] flex-col justify-evenly">
    <div class="absolute left-1 top-1">
        <DisplayMode />
    </div>
    <div class="flex w-full flex-row justify-evenly text-center">
        <div class="flex flex-col justify-center gap-8">
            <h1 class="text-4xl">Countdown</h1>
            <div class="flex flex-row items-center justify-center">
                <Input
                    class="max-w-12"
                    placeholder="h"
                    type="number"
                    min="0"
                    oninput={update_input}
                    bind:value={countdown.h}
                />
                <span class="mx-1">:</span>
                <Input
                    class="max-w-12"
                    placeholder="m"
                    type="number"
                    min="0"
                    max="59"
                    oninput={update_input}
                    bind:value={countdown.m}
                />
                <span class="mx-1">:</span>
                <Input
                    class="max-w-12"
                    placeholder="s"
                    type="number"
                    min="0"
                    max="59"
                    oninput={update_input}
                    bind:value={countdown.s}
                />
            </div>
            <Button variant="secondary" onclick={start_countdown}>Start</Button>
        </div>

        <div class="flex flex-col justify-center gap-8 text-center">
            <h1 class="text-4xl">Alarm</h1>
            <div class="flex flex-row items-center justify-center">
                <Input
                    class="max-w-12"
                    placeholder="h"
                    type="number"
                    min="0"
                    oninput={update_input}
                    bind:value={alarm.h}
                />
                <span class="mx-1">:</span>
                <Input
                    class="max-w-12"
                    placeholder="m"
                    type="number"
                    min="0"
                    max="59"
                    oninput={update_input}
                    bind:value={alarm.m}
                />
                <span class="mx-1">:</span>
                <Input
                    class="max-w-12"
                    placeholder="s"
                    type="number"
                    min="0"
                    max="59"
                    oninput={update_input}
                    bind:value={alarm.s}
                />
            </div>
            <Button variant="secondary" onclick={start_alarm}>Start</Button>
        </div>

        <div class="flex flex-col justify-center gap-8 text-center">
            <h1 class="text-4xl">Stopwatch</h1>
            {#if active === 'stopwatch'}
                <Button variant="secondary" onclick={reset}>Stop</Button>
            {:else}
                <Button variant="secondary" onclick={start_stopwatch}>Start</Button>
            {/if}
        </div>
    </div>
    <div class="flex w-full flex-row justify-center font-mono">
        <h1 class="text-[20vh]" class:text-secondary={!active && !dialog_state.shown}>
            {format_time(time_remaining)}
        </h1>
    </div>
</div>

<style>
    :global(input[type='number']) {
        appearance: textfield;
    }
</style>
