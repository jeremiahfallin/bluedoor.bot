function calculateBradleyTerryRatings(gameRecords) {
  const teams = Object.keys(gameRecords);

  let ratings = Array(teams.length).fill(1);

  for (let record of gameRecords) {
    console.log(record);
  }
}

module.exports = {
  calculateBradleyTerryRatings,
};
