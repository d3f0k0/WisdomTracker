<script lang="ts">
    import * as d3 from "d3";
    import { supabase } from "$lib/supabase";
    import { ContestantsAmount, RankBarrier } from "$utils/constants";
    import { formatPercent } from "$utils/misc";

    import type { NormalizedStats } from "$utils/types";

    let { uuid } = $props();

    let normalizedData = $state<NormalizedStats[]>([]);
    async function getNormalizedData() {
        const { data, error } = await supabase
            .from("ranking")
            .select(`rank, episode`)
            .eq("uuid", uuid);

        if (error) {
            console.error("Supabase error:", error);
            return [];
        }
        normalizedData = data.map((d) => ({
            rank: d.rank,
            normalized: Math.max(
                (ContestantsAmount[d.episode] - d.rank) /
                    (ContestantsAmount[d.episode] - 1),
                0,
            ),
            episode: d.episode,
        }));
        normalizedData.sort((a, b) => a.episode - b.episode);
        return normalizedData;
    }

    let width = $state(800);
    const height = 350;
    const margin = { top: 50, right: 20, bottom: 30, left: 75 };

    let xScale = $derived(
        d3
            .scaleLinear()
            .domain(
                d3.extent(normalizedData, (d) => d.episode) as [number, number],
            )
            .nice()
            .range([margin.left, width - margin.right]),
    );

    let yScale = d3
        .scaleLinear()
        .domain([0, 1])
        .range([height - margin.bottom, margin.top]);

    let path = $derived(
        d3
            .line<NormalizedStats>()
            .x((d) => xScale(d.episode))
            .y((d) => yScale(d.normalized))(normalizedData),
    );
</script>

<div class="nr-graph">
{#await getNormalizedData()}
<p>Pending</p>
{:then data}
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
            />
            {#each xScale.ticks() as tick}
                <line
                    x1={xScale(tick)}
                    y1={0}
                    x2={xScale(tick)}
                    y2={6}
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
            {#each [0, 0.25, 0.5, 0.75, 1] as tick}
                {#if tick != 0}
                    <line
                        class="line-tick"
                        x1={0}
                        y1={yScale(tick)}
                        x2={width - (margin.left + margin.right)}  
                        y2={yScale(tick)}
                    />
                {/if}
                <!-- width - (margin.left + margin.right) to compensate translate -->
                <text
                    x={-10}
                    y={yScale(tick)}
                    text-anchor="end"
                    alignment-baseline="middle"
                    font-size="1rem"
                >
                    {formatPercent(tick)}
                </text>
            {/each}
            <text
                x={-margin.left}
                y={20}
                font-size="1rem"
                text-anchor="center"
                alignment-baseline="middle"
            >
                Normalized Rank (%) ↑
            </text>
            <line
                x1={0}
                y1={margin.top}
                x2={0}
                y2={height - margin.bottom}
            />
        </g>
    </g>
    <g class="data">
        <path d={path} fill="none" stroke="steelblue" stroke-width="4" />
        {#each normalizedData as d}
            <circle class={{
                            prize: d.rank <= RankBarrier[d.episode][0],
                            survive:
                                RankBarrier[d.episode][1] > d.rank &&
                                d.rank > RankBarrier[d.episode][0],
                            lose: d.rank >= RankBarrier[d.episode][1],
                        }}
                cx={xScale(d.episode)}
                cy={yScale(d.normalized)}
                r="6"
            />
        {/each}
    </g>
</svg>
{/await}
</div>

<style>
    :global(line) {
        stroke: black;
        vector-effect: non-scaling-stroke;
        shape-rendering: crispEdges;
        stroke-width: 2;
    }
    :global(.y-axis) {
        text {
            font-family: "Overpass Variable";
        }
        .line-tick {
            stroke: gray;
            stroke-dasharray: 6 4; 
            
        }
    }
    :global(.x-axis) {
        text {
            font-family: "Overpass Variable";
        }
    }

    :global(circle) {
        fill: var(--highlight-odd);
    }
</style>
