function buildMovieFilter(query) {
    const filter = {};

    // Genre filter (supports single or array)
    if (query.genre) {
        filter.genre = { $in: Array.isArray(query.genre) ? query.genre : [query.genre] };
    }

    // Minimum rating filter
    if (query.rating) {
        filter.rating = { $gte: Number(query.rating) };
    }

    // Title search (legacy — exact param name)
    if (query.title) {
        filter.title = { $regex: query.title, $options: "i" };
    }

    // General search — searches title (same as title but uses 'search' param)
    if (query.search) {
        filter.title = { $regex: query.search, $options: "i" };
    }

    // Language filter
    if (query.language) {
        filter.language = query.language;
    }

    // Status filter (now / soon)
    if (query.status) {
        filter.status = query.status;
    }

    return filter;
}

module.exports = { buildMovieFilter };