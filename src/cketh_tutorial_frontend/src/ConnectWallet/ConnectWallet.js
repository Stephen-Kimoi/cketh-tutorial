const { ethereum } = window; 

export const connectWallet = async () => {
    try {

        const accounts = await ethereum.request({
            method: 'eth_requestAccounts',
        });

        const account = accounts[0]

        // Change chain id to Mumbai 
        const chainId = await ethereum.request({ method: "eth_chainId" })
        console.log("Chain id is: ", chainId)

        if (chainId !== "0xaa36a7"){
            switchChainIds()
        } 

        return account;  
    } catch (error){
        console.error(error)
    }
}

//  Switching chainId to Sepolia
const switchChainIds = async () => {
   await ethereum.request({
        method: "wallet_switchEthereumChain", 
        params: [{ chainId: "0xaa36a7" }], // Change this to your preferred chain ID
   })
}