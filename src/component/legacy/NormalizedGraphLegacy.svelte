<script lang="ts">
    import { supabase } from "$lib/supabase";
    import { ContestantsAmount } from "$utils/constants";
    import type { NormalizedStats } from "$utils/types";
    import * as d3 from "d3";

    let { uuid } = $props();
    let svg : SVGSVGElement;

    const width = 800;
    const height = 350;
    const margin = { top: 20, right: 20, bottom: 30, left: 70 };

    async function getNormalizedData(uuid : string) : Promise<NormalizedStats[]> {
        const { data, error } = await supabase
            .from("ranking")
            .select(`rank, episode`)
            .eq("uuid", uuid);

        if (error) {
            console.error("Supabase error:", error);
            return [];
        }

        return data.map((d) => ({
            normalized: Math.max(
                (ContestantsAmount[d.episode] - d.rank) /
                    (ContestantsAmount[d.episode] - 1),
                0,
            ), // count for DNP
            episode: d.episode,
        }));
    }

    function draw(data : NormalizedStats[]) {
        if (!svg || !data?.length) return;

        const g = d3.select(svg);
        g.selectAll("*").remove();

        const x = d3
            .scaleLinear()
            .domain(d3.extent(data, (d) => d.episode) as [number, number])
            .nice()
            .range([margin.left, width - margin.right]);

        const y = d3
            .scaleLinear()
            .domain([0, 1])
            .range([height - margin.bottom, margin.top]);
        
        // y ticks
        const yTicks = [0.25, 0.5, 0.75, 1];
        g.append("g")
            .attr("class", "y-grid")
            .selectAll("line")
            .data(yTicks)
            .join("line")
            .attr("x1", margin.left)
            .attr("x2", width - margin.right)
            .attr("y1", (d) => y(d))
            .attr("y2", (d) => y(d))
            .attr("stroke", "#000")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "6 4")
            .attr("shape-rendering", "crispEdges")
            ;

        const line = d3
            .line<NormalizedStats>()
            .x((d) => x(d.episode))
            .y((d) => y(d.normalized));

        // line
        g.selectAll("path.line")
            .data([data])
            .join("path")
            .attr("class", "line")
            .attr("d", line)
            .attr("fill", "none")
            .attr("stroke", "#2b8cbe")
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round");

        // dots
        g.selectAll("circle")
            .data(data)
            .join("circle")
            .attr("cx", (d) => x(d.episode))
            .attr("cy", (d) => y(d.normalized))
            .attr("r", 6)
            .attr("fill", "orange");

        // axes
        g.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .style("font-size", "1rem")
            .call(d3.axisBottom(x).ticks(10));

         g.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .style("font-size", "1rem")
            .call(
                d3
                    .axisLeft(y)
                    .tickValues(yTicks)
                    .tickFormat(d3.format(".2%"))
                    .tickSize(0) // prevent axis from drawing lines (we have grid)
            );
    }

    $effect(() => {
        (async () => {
            const data = await getNormalizedData(uuid);
            data.sort((a, b) => a.episode - b.episode);
            if (data.length) draw(data);
        })()
    });
</script>

<svg bind:this={svg} {width} {height}></svg>

