const sequelize = require("../connection");
const Profession = require("../models/profession");

const professionSeedData = require("./professionsSeedData.json");

const seedProfessionData = async () => {
  await sequelize.sync({ force: true });
  const professions = await Profession.bulkCreate(professionSeedData);
  process.exit(0);
};

seedProfessionData();