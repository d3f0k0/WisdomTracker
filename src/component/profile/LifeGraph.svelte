<script lang="ts">
    import * as d3 from "d3";
    import { onMount } from "svelte";
    import { supabase } from "$lib/supabase";
    import type { LivesStats } from "$utils/types";

    let { uuid } = $props();

    let livesData = $state<LivesStats[]>([]);
    onMount(async () => {
        const { data, error } = await supabase
            .from("ranking")
            .select(`lives, episode`)
            .eq("uuid", uuid);

        if (error) {
            console.error("Supabase error:", error);
            return [];
        }
        livesData = data;
        livesData.sort((a, b) => a.episode - b.episode)
    });

    let width = $state(800);
    const height = 350;
    const margin = { top: 50, right: 20, bottom: 30, left: 75 };

    let xScale = $derived(
        d3
            .scaleLinear()
            .domain(
                d3.extent(livesData, (d) => d.episode) as [number, number],
            )
            .nice()
            .range([margin.left, width - margin.right]),
    );

    let yScale = d3
        .scaleLinear()
        .domain([0, 10])
        .range([height - margin.bottom, margin.top]);

    let path = $derived(
        d3
            .line<LivesStats>()
            .x((d) => xScale(d.episode))
            .y((d) => yScale(d.lives))(livesData),
    );
</script>

<div class="life-graph">
    <svg
    {width}
    {height}
    viewBox={`0 0 ${width} ${height}`}
    style="max-width: 100%; height: auto;"
>
    <g class="axis">
        <g class="x-axis" transform={`translate(0,${height - margin.bottom})`}>
            <line
                    x1={margin.left}
                    y1={0}
                    x2={width - margin.right}
                    y2={0}
                    stroke="black"
            />
            {#each xScale.ticks() as tick}
                <line
                    x1={xScale(tick)}
                    y1={0}
                    x2={xScale(tick)}
                    y2={6}
                    stroke="black"
                />
                <text
                    x={xScale(tick)}
                    y={20}
                    text-anchor="middle"
                    font-size="1rem"
                >
                    {tick}
                </text>
            {/each}
        </g>

        <g class="y-axis" transform={`translate(${margin.left},0)`}>
            <line
                x1={0}
                y1={margin.top}
                x2={0}
                y2={height - margin.bottom}
                stroke="black"
            />
            {#each yScale.ticks() as tick}
                <line
                    x1={-6}
                    y1={yScale(tick)}
                    x2={0}
                    y2={yScale(tick)}
                    stroke="black"
                />
                <text
                    x={-10}
                    y={yScale(tick)}
                    text-anchor="end"
                    alignment-baseline="middle"
                    font-size="1rem"
                >
                    {tick}
                </text>
            {/each}
            <text
                x={-margin.left / 2}
                y={25}
                font-size="1rem"
                text-anchor="center"
                alignment-baseline="middle"
            >
                Life Count ↑
            </text>
        </g>
    </g>
    <g class="data">
        <path d={path} fill="none" stroke="steelblue" stroke-width="4" />
        {#each livesData as d}
            <circle
                cx={xScale(d.episode)}
                cy={yScale(d.lives)}
                r="6"
                fill="tomato"
            />
        {/each}
    </g>
</svg>
</div>

<style>
    :global(.y-axis) {
        text {
            font-family: "Overpass Variable";
        }
    }

    :global(.x-axis) {
        text {
            font-family: "Overpass Variable";
        }
    }
</style>
