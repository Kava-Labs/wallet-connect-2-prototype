// @ts-check
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import SignClient from "@walletconnect/sign-client";
import { initSignClient, establishSessionAndPairing, getSessionAccounts, addressFromNamespacedAddr, chainIdFromNamespacedAddr, web3Modal, checkForExistingSessionAndPairing, getSession } from './utils';

// @ts-ignore
const projectId = import.meta.env["VITE_WALLET_CONNECT_PROJECT_ID"];




const defaultWallet = { address: "", chainId: "", sessionTopic: "", pairingTopic: "" }
export const WalletContext = createContext(defaultWallet);




// util hooks

export const WalletProvider = ({ children }) => {
    /** @type {[SignClient, any]} */
    // @ts-ignore
    const [signClient, setSignClient] = useState(null);
    const [wallet, setWallet] = useState({ address: "", chainId: "", sessionTopic: "", pairingTopic: "" });

    // initializer effect
    useEffect(() => {
        initSignClient(projectId)
            .then((client) => {
                // @ts-ignore
                setSignClient(client);
            })
            .catch(err => {
                console.error(err);
            })
    }, []);

    useEffect(() => {
        setExistingWalletIfAvailable();
    }, [signClient]);


    useEffect(() => {
        if (!signClient) {
            return;
        }

        const sessionEventHandler = () => {
            console.info("session_event");
        };

        const sessionUpdateHandler = () => {
            console.info("session_update");
        };

        const sessionDestroyedHandler = () => {
            console.info("session_expire", "or", "session_delete");
            setWallet({ ...defaultWallet });
        };

        // proposal step expired closed
        const sessionProposalExpiredHandler = () => {
            console.info("proposal_expire");
            web3Modal.closeModal();
            setWallet({ ...defaultWallet });
            alert("proposal_expire");
        };

        const sessionPingHandler = async () => {
            console.info("session_ping");
            const res = await signClient.ping({ topic: wallet.sessionTopic });
            console.log("pong: ", res);
        };

        try {
            if (!wallet.sessionTopic) {
                return;
            }
            // small note(sah): signClient.session.get throws when key is not found
            const session = signClient.session.get(wallet.sessionTopic);
            console.log("got session", session);

            signClient.on("session_event", sessionEventHandler);
            signClient.on("session_update", sessionUpdateHandler);
            signClient.on("session_expire", sessionDestroyedHandler);
            signClient.on("proposal_expire", sessionProposalExpiredHandler);
            signClient.on("session_delete", sessionDestroyedHandler);
            signClient.on("session_ping", sessionPingHandler);

        } catch (err) {
            console.error(err);
        }

        return () => {
            if (!signClient) {
                return;
            }
            signClient.off("session_event", sessionEventHandler);
            signClient.off("session_update", sessionUpdateHandler);
            signClient.off("session_expire", sessionDestroyedHandler);
            signClient.off("proposal_expire", sessionProposalExpiredHandler);
            signClient.off("session_ping", sessionPingHandler);
        }

    }, [signClient, wallet.sessionTopic])




    useEffect(() => {
        if (!signClient) {
            return;
        }

        signClient.core.pairing.events.on("pairing_delete", () => {
            console.log("pairing_delete");
        });

        signClient.core.pairing.events.on("pairing_expire", () => {
            console.log("pairing_expire");
        });


        signClient.core.pairing.events.on("pairing_ping", () => {
            console.log("pairing_ping");
        });



    }, [signClient, wallet.pairingTopic])




    const setExistingWalletIfAvailable = useCallback(() => {
        if (!signClient) {
            return;
        }
        const existing = checkForExistingSessionAndPairing(signClient);
        if (existing) {
            const { session, pairing } = existing;
            updateWallet(session, pairing);
            return;
        }
    }, [signClient]);

    const updateWallet = useCallback((session, pairing) => {
        const addressWithNamespace = getSessionAccounts(session)[0];
        // TODO: event handlers must be added on those
        // @ts-ignore
        setWallet(() => ({
            ...wallet,
            address: addressFromNamespacedAddr(addressWithNamespace),
            chainId: chainIdFromNamespacedAddr(addressWithNamespace),
            pairingTopic: pairing.topic,
            sessionTopic: session?.topic,
        }))
    }, []);


    const connectWallet = async () => {
        if (signClient) {
            if (!wallet.address) {
                const existing = checkForExistingSessionAndPairing(signClient);
                if (existing) {
                    const { session, pairing } = existing;
                    updateWallet(session, pairing);
                    return;
                }
            }

            const results = await establishSessionAndPairing(signClient);
            if (results) {
                const { session, pairing } = results;
                updateWallet(session, pairing);
                web3Modal.closeModal();
            }
        }
    };


    const signTx = useCallback(async () => {
        try {
            const res = await signClient.request({
                topic: wallet.sessionTopic,
                chainId: `cosmos:${wallet.chainId}`,
                request: {
                    "method": "cosmos_signAmino",
                    "params": {
                        "signerAddress": wallet.address,
                        "signDoc": {
                            "chain_id": wallet.chainId,
                            "account_number": "7",
                            "sequence": "54",
                            "memo": "hello, world",
                            "msgs": [],
                            "fee": { "amount": [], "gas": "23" }
                        }
                    }
                },
            })
            console.log(res);

            alert("Success: You just signed a transaction check the console for details!")
        } catch (err) {
            alert("Error: check console for details!")
            console.log(err);
        }
    }, [signClient, wallet.sessionTopic, wallet.chainId, wallet.address])

    return (
        <WalletContext.Provider
            // @ts-ignore
            value={{
                wallet,
                connectWallet,
                signTx,
            }}>
            {children}
        </WalletContext.Provider>
    );
};


export function useWalletProvider() {
    const context = useContext(WalletContext);
    return context;
}
