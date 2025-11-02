<script lang="ts">
    import { supabase } from "$lib/supabase";
    import { formatPercent } from "$utils/misc";
    import type { LeaderboardData } from "$utils/types";

    let pageSize = 15;
    let page = $state(1);

    let { episode } = $props();

    async function getData(page = 1) {
        let from = (page - 1) * pageSize;
        let to = page * pageSize - 1;
        const { data, error, count } = await supabase
            .from("response")
            .select(
                `
                uuid,
                player (
                    username
                ),
                response,
                average,
                std_dev,
                placement,
                vote_count
                `,
                { count: "exact" },
            )
            .eq("episode", episode)
            .order("placement", { ascending: true })
            .range(from, to);
        if (error) {
            console.error("Supabase error:", error);
            return { rows: [], count: 0 };
        }

        // There, Typescript, are you happy? Quick hack fix to shut up ts error, because it is NOT AN ARRAY!!!
        const normalized = (data ?? []).map((r: any) => ({
            ...r,
            player: Array.isArray(r.player) ? r.player[0] : r.player,
        })) as LeaderboardData[];
        return { normalized, count: count ?? 0 };
    }

    function getRankDisplay(rank: number) {
        if (Number.isInteger(rank)) {
            return `${rank}`;
        } else {
            return `-`;
        }
    }

    function prevPage() {
        if (page > 1) page -= 1;
    }
    function nextPage(totalPages: number) {
        if (page < totalPages) page += 1;
    }
</script>

<div class="table">
    <h1>Episode {episode} Leaderboard</h1>
    {#await getData(page)}
        <p>loading</p>
    {:then data}
        <table>
            <colgroup>
                <col style="width: 5%;" />
                <col style="width: 20%;" />
                <col style="width: 56%;" />
                <col style="width: 7%;" />
                <col style="width: 7%;" />
                <col style="width: 5%;" />
            </colgroup>
            <thead>
                <tr>
                    <th scope="col">Rank</th>
                    <th scope="col">Contestant</th>
                    <th scope="col">Response</th>
                    <th scope="col">Score</th>
                    <th scope="col">Std. Dev.</th>
                    <th scope="col">Voter</th>
                </tr>
            </thead>
            <tbody>
                {#each data.normalized as rows}
                    <tr>
                        <th scope="row" class="rank"
                            >{getRankDisplay(rows.placement)}</th
                        >
                        <td class="username">{rows.player.username}</td>
                        <td class="response">{rows.response}</td>
                        <td class="score">{formatPercent(rows.average)}</td>
                        <td class="standard-deviation"
                            >{formatPercent(rows.std_dev)}</td
                        >
                        <td class="votes">{rows.vote_count}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
        {@const totalPages = Math.max(1, Math.ceil(data.count / pageSize))}
        <!-- render table using result.rows ... -->
        <!-- add simple pagination controls -->
        <div class="page-nav">
            <button
                onclick={() => {
                    page = 1;
                }}
                disabled={page === 1}>Start</button
            >
            <button onclick={prevPage} disabled={page === 1}>Prev</button>
            <div>Page {page} / {totalPages}</div>
            <button
                onclick={() => nextPage(totalPages)}
                disabled={page === totalPages}
            >
                Next
            </button>
            <button
                onclick={() => {
                    page = totalPages;
                }}
                disabled={page === totalPages}>End</button
            >
        </div>
    {/await}
</div>

<style>
    .table {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: lightgray;
        font-family: "Overpass Variable";
    }
    .page-nav {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 1rem;
    }
    table {
        width: 98%;
        font-size: 1.5rem;
        table-layout: fixed;

        /* use separate so border-radius on cells works reliably */
        border-collapse: separate;
        border-spacing: 1; /* set >0 if you want gaps between cells */
        border-radius: 0.5rem; /* rounds outer corners */
        overflow: hidden; /* clip corners for outer table radius */
    }

    tbody {
        th,
        td {
            background-color: aquamarine;
            padding: 0.4rem;
            vertical-align: middle;
            white-space: normal;
            overflow-wrap: anywhere;
            word-break: break-word;
            text-align: center;
            background-clip: padding-box;
        }

        /* round left and right ends of each row */
        /* 
        tr th:first-child,
        tr td:first-child {
            border-top-left-radius: 0.5rem;
            border-bottom-left-radius: 0.5rem;
        }

        tr th:last-child,
        tr td:last-child {
            border-top-right-radius: 0.5rem;
            border-bottom-right-radius: 0.5rem;
        }
        */
    }
</style>
