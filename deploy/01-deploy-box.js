const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../helper-hardhat-config")

const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    log("----------------------------------------------------")

    const box = await deploy("Box", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: waitBlockConfirmations,
        //we can tell our hardhat deploy to deploy Box SC behind this our proxy
        proxy: {
            //using openzepplin proxies
            proxyContract: "OpenZeppelinTransparentProxy",
            //instead of having an admin address for the proxy contract we are going to have proxy contract owned by an admin contract
            //doing it this way is considered as the best practice for a number of reasons
            viaAdminContract: {
                // we need to create a BoxProxyAdmin Contract to be the admin of our box
                name: "BoxProxyAdmin",
                artifact: "BoxProxyAdmin",
            },
        },
    })

    // Be sure to check out the hardhat-deploy examples to use UUPS proxies!
    // https://github.com/wighawag/template-ethereum-contracts

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        const boxAddress = (await ethers.getContract("Box_Implementation")).address
        await verify(boxAddress, [])
    }
    log("----------------------------------------------------")
}

module.exports.tags = ["all", "box"]
