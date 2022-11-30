const { ethers } = require("hardhat");

async function main() {
    const [owner, organizer, admin] = await ethers.getSigners();

    const sportEventRegistry = await ethers.getContractAt("SportEventRegistry", "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512", owner);

    const SPORT_EVENT_CREATOR_ROLE = await sportEventRegistry.SPORT_EVENT_CREATOR_ROLE();

    const transactionResponse = await sportEventRegistry.grantRole(SPORT_EVENT_CREATOR_ROLE, admin.address);

    const transactionReceipt = await transactionResponse.wait();

    console.log(transactionReceipt);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
