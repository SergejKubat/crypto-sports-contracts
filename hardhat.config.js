require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */

const GANACHE_RPC_URL = process.env.GANACHE_RPC_URL;
const SUPER_ADMIN_PRIVATE_KEY = process.env.SUPER_ADMIN_PRIVATE_KEY;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const USER1_PRIVATE_KEY = process.env.USER1_PRIVATE_KEY;
const USER2_PRIVATE_KEY = process.env.USER2_PRIVATE_KEY;

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        ganache: {
            url: GANACHE_RPC_URL,
            accounts: [SUPER_ADMIN_PRIVATE_KEY, ADMIN_PRIVATE_KEY, USER1_PRIVATE_KEY, USER2_PRIVATE_KEY],
        },
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
    },
    solidity: {
        version: "0.8.9",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
};
