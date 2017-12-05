const db = require('../database/ratios/index.js');
const { addDoc } = require('../database/dashboard/dashboardData.js');

module.exports = (query) => {
  const row = {};
  row.userId = query.userId;
  row.groupId = query.groupId;
  row.ratio = Number(query.recs) / (Number(query.recs) + Number(query.nonRecs));
  return addDoc('user-ratios', 'user-ratio', row)
    .then(() => (db.UserRatio.create(row)));
};
