import { ethers } from "hardhat";

const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
const LOCKED_AMOUNT = "1";

async function main() {
    const currentTimestampInSeconds = Math.round(Date.now() / 1000);

    const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;

    const lockedAmount = ethers.utils.parseEther(LOCKED_AMOUNT);

    // deploying contract...
    const Lock = await ethers.getContractFactory("Lock");
    const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

    await lock.deployed();

    console.log(
        `Lock with ${LOCKED_AMOUNT} ETH and unlock timestamp ${unlockTime} deployed to ${lock.address}`
    );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
