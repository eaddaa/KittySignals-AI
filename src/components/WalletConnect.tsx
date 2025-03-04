// useWalletConnection.ts
const refreshWalletState = useCallback(async () => {
  if (!checkIfEthereumExists()) return;

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.listAccounts();

    if (accounts.length === 0) {
      setWalletState({
        account: null,
        balance: null,
        chainId: null,
        isConnected: false,
        tokenBalance: null,
        provider: null,
      });
      return;
    }

    const account = accounts[0];
    const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
    const chainId = parseInt(chainIdHex, 16).toString();
    const balance = await provider.getBalance(account.address);
    const formattedBalance = ethers.formatEther(balance);

    // Token bakiyesini al
    let tokenBalance = null;
    if (chainId === NETWORK_CONFIG.chainId) {
      try {
        const tokenContract = new ethers.Contract(
          TOKEN_CONTRACT.address,
          TOKEN_CONTRACT.abi,
          provider
        );
        const rawTokenBalance = await tokenContract.balanceOf(account.address);
        tokenBalance = ethers.formatEther(rawTokenBalance);
        console.log("Token balance fetched:", tokenBalance); // Debug log
      } catch (error) {
        console.error("Token balance fetch error:", error);
      }
    }

    setWalletState({
      account: account.address,
      balance: formattedBalance,
      chainId,
      isConnected: true,
      tokenBalance,
      provider,
    });
  } catch (error) {
    console.error("Wallet state refresh error:", error);
    setWalletState({
      account: null,
      balance: null,
      chainId: null,
      isConnected: false,
      tokenBalance: null,
      provider: null,
    });
  }
}, [checkIfEthereumExists]);

