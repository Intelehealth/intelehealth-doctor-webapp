export function keepOnlyPairedEvents(eventLog: { type: string, timestamp: string }[]): { type: string, timestamp: string }[] {
    // Sort by timestamp
    const sortedLog = [...eventLog].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const openIndices: number[] = [];
    const closeIndices: number[] = [];
    const pairedIndices: Set<number> = new Set();

    // Collect indices of opens and closes
    sortedLog.forEach((event, idx) => {
        if (event.type === "visit-summary open") openIndices.push(idx);
        else if (event.type === "back from visit summary") closeIndices.push(idx);
    });

    // Pair up opens and closes
    let openIdx = 0, closeIdx = 0;
    while (openIdx < openIndices.length && closeIdx < closeIndices.length) {
        if (openIndices[openIdx] < closeIndices[closeIdx]) {
            // Pair found, mark both as paired
            pairedIndices.add(openIndices[openIdx]);
            pairedIndices.add(closeIndices[closeIdx]);
            openIdx++;
            closeIdx++;
        } else {
            // Unmatched close, move to next close
            closeIdx++;
        }
    }

    // Return only paired events
    return sortedLog.filter((_, idx) => pairedIndices.has(idx));
}