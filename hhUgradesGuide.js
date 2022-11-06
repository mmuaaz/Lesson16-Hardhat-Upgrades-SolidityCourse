;/In this lesson we are going to learn whether our SCs are truely immutable or not and what happens when we feel the need to implement some functionality to our already deployed SC/

// There are 3 types of the SC upgrades:
// 1. Parameter   2. Social Migrate     3.Proxy
;/Parameter/ //these are not truely upgrades; dont know why they are called upgrades though; example is that If we have a function lets say it is programmed to reward the users with 2%
//then another function is set to change this reward to 3% in x amount of times lets say a month; then its already programmed to do so; we are actually not doing any upgrade here
;/Social Yeet or Migrate/ // this is very hectic kind of upgrade in which you create another SC similar to your last SC but not connected to it; in this new SC you assign it a version, and
//include all the functionality that you wanted to incorporate, this way you would have to tell the users to stop using old contract and migrate to the new one; but this leaves an important
//task for the devs as they have to migrate all the mappings for example to this new version
//DISADVANTAGE:     Now you are going to end up having a new contract address;
//ADVANTAGE:    truest of the BC values; keeping the immutablity intact
;/Proxy/ //this type of the upgrade is truely and upgrade and it comes with some trade offs, it involves a lot of low level coding
//in order to have a  really robust upgrading mentality or philosophy we need to have some type of methodology or framework that can update our state, keep our Contract Address and
//allow us to update any of the logic of our SC in an easy way
//proxies use a lot of low level functionality and the main one is /**delegatecall */ functionality
;/Delegatecall/ //is a low level function is identical to a message call apart from the fact that the code at the target address is executed in the context of calling contract and
//msg.sender and msg.value do not change their values
//this delegatecall combined with the fallback function allow us to delegate all calls through a proxy contract address to some other contract;
//it means that I can have one proxy contract that has the same contract address forever and I can route and point people to these correct location of the SC that has the logic
//whenever I want to upgrade I simply implement new implementation contract and point my proxy to that new implementation;
// when a user calls on a proxy contract i am going to delegate call it to the new contract
//Also we can call admin only function on our contract
// ?    Teminologies:
// 1. implementation Contract > has all code of our protocol. When we upgrade, we launch a brand new implementation contract
// 2. The proxy contract > points to which implementation is the "correct" one and routes everyones' function calls to that contract
// 3. The user > they make calls to the proxy
// 4. The admin > this is the user(or group of users) who vote to upgrade to new implementation contract
//also important thing to note about the proxies is that all the storage variables are stored in the proxy contract and not in the implementation contract
//this will allow us to have the  same contract address even when we upgrade then the logic is implemented in the implementation contract while the storage variables are intact and we
//dont nee to migrate our mappings and that such
;/Gotchas/ //if you have an admin that is a governance contract then its good and decentralized but if that admin is a single entity then its a big problem as it is centralized
// 1. Storage Clashes  > Your functions actually points to the storage spots in solidity, not to the value names
//      uint256 value
//      uint256 differentValue
//      function setValue(uint256) {value=2}
// in the above example; Value is at storage spot 0 while differentValue is at spot 1; so setValue function will update the value of whatever is present at the 0th spot
//this means we can only append new storage variables in new implementation contracts and we cant reorder or change the old ones

// 2. Function Selector Clashes  > whenever we tell our proxies to delegate calls to implementation for a function, it uses /**function selector */ to find a function
;/function selector/ //is a 4 byte hash of a function name and function signature that define a function
//its possible that a function in the implementation contract has the same function selector as an admin function in the proxy contract which will cause a clash and cause whole bunch of errors
// and what not
;/====== methodologies to avoid clashes/
//this leads to our first of the three implementations of the proxy contracts. This is called transparent proxy pattern
;/ 1. transparent proxy pattern*/
// this is a methodology where admins are only allowed to call admin functions, and thereby not allowed to call implementation contract functions
;/admin functions/ // these functions are the functions that govern upgrades
//while users can call the functions on the implementation contracts as they are harmless and the users are not allowed to call admin functions
;/ 2. Universal Upgradeable proxies */ //or UUPS
// adminOnly upgrade functions are in the  implementation contracts instead of the proxy
//the version of the methodology puts all the logic in the implementation itself, this way solidity compiler will actually kick out and say we have two function here that have the same
// function selector
// ADVANTAGE: >>>> it helps save the gas as well; because this way we have to do 1 less read; we no longer have to check in the proxy contract if someone is an admin or not; proxies are
//smaller because of this
// DISADVANTAGE: >>>> if you deploy an implementation contract without any upgradeable functionality, you're stuck!!!
;/ 3. diamond proxy Pattern*/
//this allows multiple implementation contracts
// it also allows us to upgrades little pieces of the SC, and necessarily doesnt force you to upgrade and deploy the whole contract
;/improvement proposals/ // all the methodologies mentioned have some type of ETH improvement proposals; most of them are in the draft phase
;/delegatecall example/ //see the delegatecallexample.sol for more info
;/proxy contract example/
//shows how a contract can be used as a singular address but the undelying code can actually change
//follow along the guide in smallproxy.sol and comeback
;/Important Points to note in smallProxy.sol/ //so we have a SC smallProxy which inheriting an openzeppelin contract; that openzepplein contract allows us to have a boileplate code for
// setting up a proxy contract; that contract has a receive function which can receive data and calls the fallback fuction; if the data is not relevant to any function call in the smallProxy
//its going to  borrow the function in the implementation contract
// >>>>> what we do is that we deploy smallPrxoy contract and implementationA contract in remix; copy the address of implementationA; so the smallProxy has a function called setImplementation;
//this function takes an address to set the implementation contract for smallProxy; you pass the address you copied to setImplementation function > you have set implementationA as the
//implementation contract for smallProxy
// now you can save a number by call calling getDataTransact function on smallProxy; you will be returned with low level bytes code version of the same number you saved
//copy that bytes code data and paste in the "lowLevel interaction column" call transact; you should now be able to run the "readStorage" function on smallProxy and get the same number you saved
;/Result/ // 1.  this is incredible as you have borrowed a setValue function on ImplementationA contract when you passed that lowlevel bytes code data;
// 2. Now deploy implementationB; copy the address of the implementationB and pasted for passing to the function call of setImplmentation in smallProxy; now you have upgraded the logic
// if you use the same bytes code data to pass in lowlevel data and transact it still will be able to delegatecall function of impelementationB;
;/note/ //the important point to note here: if a single person has the admin keys to upgrade the contract then he can upgrade at any time and the contract is not decentralized at all
;/next section/
// RUN COMM : yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers @nomiclabs/hardhat-etherscan @nomiclabs/hardhat-waffle chai ethereum-waffle hardhat hardhat-contract-sizer hardhat-deploy hardhat-gas-reporter prettier prettier-plugin-solidity solhint solidity-coverage dotenv
;/==================Upgrading Proxies /

//1. Upgrade Box ====>>>>> BoxV2
// 2. Proxy =====> Box
// =====> BoxV2

// 3.  Deploy Proxy manually                <<<< not going to work on this as its been already done with delegatecallExample.sol
// or using Hardhat Deploy's built-in Proxies
// or using openZappelin Upgrade Plugins                       << Allows us to use plugins to write really simple scripts having simple API : upgrade.deployProxy and upgrade.upgradeProxy
//
// For this lesson Patrick used only hardhat proxies while the course repo includes example of openzappelin proxies
;/Starting/
// so we have two contracts in the contracts folder
// we would want to upgrade the simple Box SC to our version 2 SC named as BoxV2
//for that we created two contracts in the contracts folder
// then we write a deploy script
//  we have used OpenZeppelinTransparentProxy so we will modify the deploy script such that it takes into account for this
// creating a folder in contracts folder named as Proxy
// we write a BoxProxyAdmin.sol contract which is going to be openzeppelin admin contract for proxies that has some functions which will help us set a recommended level proxies; this way our Box contract is deployed behind a proxy that is owned by
// BoxProxyAdmin contract
// when we deploy these contracts, hardhat deploy deploys Box   contract and renamed it to Box_implementation then it deploy Box_Proxy so anytime we call our Box_proxy contract address we get from logs after deploying,
// its gonna point towards Box contract which is renamed to Box_Impelementation
