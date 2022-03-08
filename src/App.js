import "./App.css";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ThemeProvider } from "styled-components";
import { theme } from "./components/styles/theme";
import { LocationContextProvider } from "./services/location/location.context";
import { MintingContextProvider } from "./services/minting/minting.context";

import { Button } from "@mui/material";
import {
  Text,
  Card,
  Descriptor,
  Number,
  BackGround,
  BackDrop,
} from "./components/styles/padding";
import { Address } from "./components/location.component";
import { Mint } from "./components/mint.component";

function App() {
  const [address, setUserAddress] = React.useState("");
  const [receiver, setReceiver] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [addressResponse, setAddressResponse] = React.useState("");
  const [amountResponse, setamountResponse] = React.useState("");

  const [wallet, setWallet] = React.useState("");
  const [usdcamount, setUsdcamount] = React.useState("");

  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

  const usdc = {
    address: "0x68ec573C119826db2eaEA1Efbfc2970cDaC869c4",
    abi: [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function gimmeSome() external",
      "function balanceOf(address _owner) public view returns (uint256 balance)",
      "function transfer(address _to, uint256 _value) public returns (bool success)",
    ],
  };

  // const _checkProvider=(operation)=>{
  //   if (!provider) { logger.throwError("missing provider", Logger.errors.UNSUPPORTED_OPERATION, {
  //       operation: (operation || "_checkProvider") });
  //   }

  async function getUsdc() {
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const usdcContract = new ethers.Contract(usdc.address, usdc.abi, signer);
    const userAddress = await signer.getAddress();
    usdcContract.balanceOf(userAddress).then((usdcBalance) => {
      let newUsdcBalance = ethers.utils.formatUnits(usdcBalance, 6);
      setUsdcamount(newUsdcBalance);
    });
  }

  async function transferUsdc() {
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    let userAddress = await signer.getAddress();

    const usdcContract = new ethers.Contract(usdc.address, usdc.abi, signer);

    try {
      ethers.utils.getAddress(receiver);
    } catch {
      setAddressResponse(`Invalid address: ${receiver}`);
    }

    try {
      ethers.utils.parseUnits(amount, 6).then((val) => {
        if (val.isNegative()) {
          throw new Error();
        }
      });
    } catch {
      console.error(`Invalid amount: ${amount}`);
      setamountResponse(`Invalid amount: ${amount}`);
    }

    const balance = await usdcContract.balanceOf(userAddress);
    if (balance.lt(amount)) {
      let amountFormatted = ethers.utils.formatUnits(amount, 6);
      let balanceFormatted = ethers.utils.formatUnits(balance, 6);
      console.error(
        `Insufficient balance receiver send ${amountFormatted} (You have ${balanceFormatted})`
      );
    }
    let amountFormatted = ethers.utils.formatUnits(amount, 6);

    // response = `Transferring ${amountFormatted} USDC receiver ${receiver.slice(
    //   0,
    //   6
    // )}...`;
    // document.getElementById("transferResponse").innerText = response;
    // document.getElementById("transferResponse").style.display = "block";

    const tx = await usdcContract.transfer(receiver, amount, {
      gasPrice: 20e9,
    });
    // document.getElementById(
    //   "transferResponse"
    // ).innerText += `Transaction hash: ${tx.hash}`;

    const receipt = await tx.wait();
    // document.getElementById(
    //   "transferResponse"
    // ).innerText += `Transaction confirmed in block ${receipt.blockNumber}`;
  }

  useEffect(() => {
    // getAddress();
    getUsdc();
  }, [usdc, wallet]);

  // })

  return (
    <ThemeProvider theme={theme}>
      <LocationContextProvider>
        <MintingContextProvider>
          <Mint></Mint>
          <Address></Address>
        </MintingContextProvider>

        <BackGround>
          <Card>
            <input
              type="text"
              placeholder="Address to send"
              onChange={(e) => setReceiver(e.target.value)}
            />
            <input
              type="text"
              placeholder="amount"
              onChange={(e) => setAmount(e.target.value)}
            />
          </Card>
          {amountResponse && (
            <Card>
              <Number>{amountResponse}</Number>{" "}
            </Card>
          )}

          <Button variant="contained" onClick={transferUsdc}>
            Transfer
          </Button>
        </BackGround>
      </LocationContextProvider>
    </ThemeProvider>
  );
}

export default App;
