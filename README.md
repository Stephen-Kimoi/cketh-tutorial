# Getting Started with ckETH: A Step-by-Step Guide

This tutorial will guide you through the process of working with ckETH, from generating a subaccount for ETH deposits to minting ckETH and verifying transactions on-chain. By the end of this tutorial, you will have a basic understanding of how to interact with the ckETH protocol using a Rust backend and a React frontend.

Slides on ckETH explanation can be found [here](https://www.canva.com/design/DAGNHEG_n-Y/Z8vo3oZsTnxMINLBlyizYw/edit)

## Prerequisites

Before we begin, ensure you have the following:

- You've installed [necessary environment requirements](https://internetcomputer.org/docs/current/developer-docs/getting-started/install/)
- [MetaMask installed in your browser](https://metamask.io/download/) with [Sepolia ETH (testnet) tokens](https://www.alchemy.com/faucets/ethereum-sepolia)
- Basic knowledge of Rust and React

## Install project template

We have created a simple template that comes with the configurations for calling the helper smart contract on Ethereum, allowing you to focus on the backend logic for integrating ckETH.

Here's the [link to the repo](https://github.com/Stephen-Kimoi/starter-template)

![UI Screenshot](UI.png)

## Future Updates

We are continuously working on improving this project. Here are some exciting updates to look forward to:

1. **Plugin Development**: We are in the process of converting this template into a plugin. This will make it even easier to integrate ckETH functionality into your existing projects.

2. **Additional Features**: We plan to add more features to enhance the functionality of the ckETH integration. These may include:
    - Advanced transaction monitoring
    - Enhanced error handling and recovery mechanisms
    - Integration with additional Ethereum networks
    - Improved user interface for better transaction management

3. **Documentation and Tutorials**: We will be expanding our documentation and creating more in-depth tutorials to cover advanced use cases and best practices.

4. **Community Contributions**: We encourage community involvement and will be setting up contribution guidelines for those who want to help improve and expand this project.

Stay tuned for these updates, and feel free to star and watch the repository for the latest developments!

## Step 0(a): Setting Up the Project

Clone the project template from the link provided above.


git clone https://github.com/Stephen-Kimoi/starter-template.git


 
cd starter-template && npm install


Give permissions to the script
 
chmod +x ./did.sh


Start the local replica for dfx 

dfx start --clean --background


Deploy the backend canister

./did.sh && dfx generate cketh_starter_backend && dfx deploy cketh_starter_backend


Start the frontend 
 
npm run start 


## Step 0(b): Understanding the frontend logic

[The rest of the tutorial content remains the same...]

## Conclusion

You have now successfully created a ckETH integration with Rust and React, including depositing ETH, minting ckETH, and verifying the transaction on-chain. This tutorial provides a solid foundation for working with ckETH and can be expanded to include more features as needed.

We're excited about the future developments of this project, including its transformation into a plugin and the addition of new features. Stay connected with our repository for updates and new releases!
