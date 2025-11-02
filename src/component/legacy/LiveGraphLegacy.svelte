<script>
    import { supabase } from "$lib/supabase";
    import * as d3 from "d3";

    let { uuid } = $props();
    let svg;

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    async function getLivesData(uuid) {
        const { data, error } = await supabase
            .from("ranking")
            .select(`lives, episode`)
            .eq("uuid", uuid);

        if (error) {
            console.error("Supabase error:", error);
            return [];
        }
        return data;
    }

    function draw(data) {
        if (!svg || !data?.length) return;

        const g = d3.select(svg);
        g.selectAll("*").remove();

        const x = d3
            .scaleLinear()
            .domain(d3.extent(data, (d) => d.episode))
            .nice()
            .range([margin.left, width - margin.right]);

        const y = d3
            .scaleLinear()
            .domain([0, 10])
            .range([height - margin.bottom, margin.top]);

        const line = d3
            .line()
            .x((d) => x(d.episode))
            .y((d) => y(d.lives));

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
            .attr("cy", (d) => y(d.lives))
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
            .call(d3.axisLeft(y).ticks(10));
    }

    $effect(async () => {
        const data = await getLivesData(uuid);
        data.sort((a, b) => a.episode - b.episode);
        if (data.length) draw(data);
    });
</script>

<svg bind:this={svg} {width} {height}></svg>


