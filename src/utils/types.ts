export type NormalizedStats = {
    episode: number,
    normalized: number,
    rank: number
}

export type LivesStats = {
    episode: number,
    lives: number
}

export type LeaderboardData = {
    uuid: number,
    response: string,
    average: number,
    std_dev: number,
    placement: number,
    vote_count: number,
    player: {
        username: string
    }
}