const { ethers } = require("hardhat");

const lastCreatedEvent = require("../data/lastCreatedEvent.json");

async function main() {
    const [owner, organizer, admin, user] = await ethers.getSigners();

    const sportEventRegistry = await ethers.getContractAt("SportEventRegistry", "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512", user);

    const sportEventAddress = lastCreatedEvent.sportEventAddress;
    const TICKET_TYPES = [0, 0, 1];
    const TOTAL_PRICE_ETH = "0.2";

    const transactionResponse = await sportEventRegistry.buyTickets(sportEventAddress, TICKET_TYPES, {
        value: ethers.utils.parseEther(TOTAL_PRICE_ETH)
    });

    const transactionReceipt = await transactionResponse.wait();

    const eventArgs = transactionReceipt.events[transactionReceipt.events.length - 1].args;

    console.log(eventArgs);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
