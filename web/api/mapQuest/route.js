const mapQuest = require('./mapQuest');

const route = async (from, to) => {
    from = from.join(',');
    to = to.join(',');
    const response = await mapQuest.get('/directions/v2/alternateroutes', {
        params: {
            from,
            to,
            maxRoutes: 5
        }
    });
    const route = response.data.route;
    const { distance, formattedTime, shape, alternatesRoutes } = route;
    return { distance, formattedTime, shape, alternatesRoutes};
};

module.exports = route;