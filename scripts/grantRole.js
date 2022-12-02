const { ethers } = require("hardhat");

const SportEventRegistry = require("../abi/SportEventRegistry.json");

async function main() {
    const [owner, organizer, admin] = await ethers.getSigners();

    const sportEventRegistry = await ethers.getContractAt("SportEventRegistry", SportEventRegistry.address, owner);

    const SPORT_EVENT_CREATOR_ROLE = await sportEventRegistry.SPORT_EVENT_CREATOR_ROLE();

    const transactionResponse = await sportEventRegistry.grantRole(SPORT_EVENT_CREATOR_ROLE, admin.address);

    const transactionReceipt = await transactionResponse.wait();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
