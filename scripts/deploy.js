const { ethers } = require("hardhat");

async function main() {
    const [owner] = await ethers.getSigners();
    const ownerBalance = await owner.getBalance();

    console.log("####################################################\n");
    console.log(`Owner account address: ${owner.address}`);
    console.log(`Owner balance: ${ownerBalance.toString()} ETH\n`);

    // deploying factory
    const SportEventFactory = await ethers.getContractFactory("SportEventFactory");

    console.log("Deploying SportEventFactory contract...");

    const sportEventFactory = await SportEventFactory.deploy();

    await sportEventFactory.deployed();

    const sportEventFactoryAddress = sportEventFactory.address;

    console.log(`SportEventFactory contract deployed to: ${sportEventFactoryAddress}\n`);

    console.log("####################################################\n");

    // deploying registry
    const SportEventRegistry = await ethers.getContractFactory("SportEventRegistry");

    console.log("Deploying SportEventRegistry contract...");

    const sportEventRegistry = await SportEventRegistry.deploy(sportEventFactoryAddress);

    await sportEventRegistry.deployed();

    const sportEventRegistryAddress = sportEventRegistry.address;

    console.log(`SportEventRegistry contract deployed to: ${sportEventRegistryAddress}\n`);

    // grant role for registry
    const SPORT_EVENT_CREATOR_ROLE = await sportEventFactory.SPORT_EVENT_CREATOR_ROLE();

    await sportEventFactory.grantRole(SPORT_EVENT_CREATOR_ROLE, sportEventFactoryAddress);

    console.log("Role granted!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
