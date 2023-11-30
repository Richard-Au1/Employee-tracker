const sequelize = require("../connection");
const Profession = require("../models/profession");

const professionSeedData = require("./professionsSeedData.json");

const seedProfessionData = async () => {
  await sequelize.sync({ force: true });
  const profession = await Profession.bulkCreate(professionSeedData);
  process.exit(0);
};

seedProfessionData();