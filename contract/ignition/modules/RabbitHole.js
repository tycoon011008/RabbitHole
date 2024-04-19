const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("RabbitHoleModule", (m) => {

  const rabbitHole = m.contract("RabbitHole", ["0x058182b7B61dF92b5A7d9c57B3C6b537aA45E22D"]);

  return { rabbitHole };
});
