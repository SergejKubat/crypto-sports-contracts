import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */

const GANACHE_RPC_URL = process.env.GANACHE_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

export const defaultNetwork = "hardhat";

export const networks = {
    ganache: {
        url: GANACHE_RPC_URL,
        accounts: [PRIVATE_KEY],
    },
};

export const gasReporter = {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
};

export const solidity = "0.8.17";
