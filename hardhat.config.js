require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */

const GANACHE_RPC_URL = process.env.GANACHE_RPC_URL;

const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;
const ORGANIZER_PRIVATE_KEY = process.env.ORGANIZER_PRIVATE_KEY;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const USER_PRIVATE_KEY = process.env.USER_PRIVATE_KEY;

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        ganache: {
            url: GANACHE_RPC_URL,
            accounts: [OWNER_PRIVATE_KEY, ORGANIZER_PRIVATE_KEY, ADMIN_PRIVATE_KEY, USER_PRIVATE_KEY]
        }
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true
    },
    solidity: {
        version: "0.8.9",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    }
};
