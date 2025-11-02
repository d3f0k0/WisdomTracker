// amount of contestant in every ewow episode
export const ContestantsAmount : Record<number, number> = {
    1: 16607,
    2: 8623,
    3: 8062,
    4: 5626,
    5: 4016,
    6: 2767,
    7: 2152,
    8: 1479,
    9: 1095,
    10: 830,
    11: 600,
    12: 452,
    13: 358,
    14: 278,
    15: 213
}

// rank barrier, use to determine the table color, and the dots color
// less than or equal to rankbarrier.fi, you are within a prize range
// more than or equal to rankbarrier.se, you are within a death range
export const RankBarrier : Record<number, number[]> = {
    1: [830, 8471],
    2: [431, 4398],
    3: [403, 4112],
    4: [281, 2870],
    5: [201, 2049],
    6: [138, 1412],
    7: [108, 1099],
    8: [74, 755],
    9: [55, 559],
    10: [42, 424],
    11: [30, 307], 
    12: [22, 231.1], // starting with life decay mechanics, barrier can have decimal
    13: [18, 184],
    14: [14, 143],
    15: [11, 110]
}
