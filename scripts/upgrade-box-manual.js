// we are going to do it the manual way to learn about the functions that we need to call to upgrade this process
//However, hh  deploy also comes with an API to make it really easy to actually just upgrade the box Contracts
//
const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../helper-hardhat-config")
const { network, deployments, deployer, ethers } = require("hardhat")
const { verify } = require("../utils/verify")

async function main() {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    log("----------------------------------------------------")

    const boxV2 = await deploy("BoxV2", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(boxV2.address, [])
    }

    // Upgrade!
    // Not "the hardhat-deploy way"
    const boxProxyAdmin = await ethers.getContract("BoxProxyAdmin")
    const transparentProxy = await ethers.getContract("Box_Proxy")
    //const boxV2 = await ethers.getContract("BoxV2")
    const upgradeTx = await boxProxyAdmin.upgrade(transparentProxy.address, boxV2.address)
    await upgradeTx.wait(1)
    //to work with the functions on our BoxV2:
    const proxyBoxV2 = await ethers.getContractAt("BoxV2", transparentProxy.address) // we are going to load ABI at the tansparentProxy.address
    //this way ethers know that we are calling all our function transparentProxy but this proxyBoxV2 variable is gonna have the ABI of the BoxV2

    const version2 = await proxyBoxV2.version()
    console.log(version2.toString())
    log("----------------------------------------------------")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
