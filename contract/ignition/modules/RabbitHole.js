const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("RabbitHoleModule", (m) => {

  const rabbitHole = m.contract("RabbitHole");

  return { rabbitHole };
});
