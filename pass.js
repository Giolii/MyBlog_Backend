const bcrypt = require("bcryptjs");
const saltRounds = 12;

const main = async () => {
  const hash = await bcrypt.hash("password", saltRounds);
  console.log(hash);
};

main();
