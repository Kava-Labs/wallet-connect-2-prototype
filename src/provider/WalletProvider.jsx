// @ts-check
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import SignClient from "@walletconnect/sign-client";
import {
    defaultWallet,
    initSignClient,
    establishSessionAndPairing,
    getSessionAccounts,
    addressFromNamespacedAddr,
    chainIdFromNamespacedAddr,
    web3Modal,
    checkForExistingSessionAndPairing,
    isSignClientInitialized
} from './utils';
import { useSessionSubscribe } from './subscribers/useSessionSubscribe';
import { usePairingSubscribe } from './subscribers/usePairingSubscribe';

// @ts-ignore
const projectId = import.meta.env["VITE_WALLET_CONNECT_PROJECT_ID"];

export const WalletContext = createContext(defaultWallet);


export const WalletProvider = ({ children }) => {
    /** @type {[SignClient, any]} */
    // @ts-ignore
    const [signClient, setSignClient] = useState(null);
    const [wallet, setWallet] = useState({ address: "", chainId: "", sessionTopic: "", pairingTopic: "" });

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


    useSessionSubscribe(signClient, wallet.sessionTopic, setWallet);
    usePairingSubscribe(signClient, wallet.pairingTopic, setWallet);


    const setExistingWalletIfAvailable = useCallback(() => {
        if (!isSignClientInitialized(signClient)) {
            return;
        }
        const existing = checkForExistingSessionAndPairing(signClient);
        if (existing) {
            const { session, pairing } = existing;
            updateWalletFromSessionAndPairing(session, pairing);
            return;
        }
    }, [signClient]);

    const updateWalletFromSessionAndPairing = useCallback((session, pairing) => {
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


    const connectWallet = async (namespace) => {
        if (signClient) {
            if (!wallet.address) {
                const existing = checkForExistingSessionAndPairing(signClient);
                if (existing) {
                    const { session, pairing } = existing;
                    updateWalletFromSessionAndPairing(session, pairing);
                    return;
                }
            }

            const results = await establishSessionAndPairing(signClient, namespace);
            if (results) {
                const { session, pairing } = results;
                updateWalletFromSessionAndPairing(session, pairing);
                web3Modal.closeModal();
            }
        }
    };

    const disconnectWallet = useCallback(async () => {
        try {
            signClient.session.getAll().forEach(async (session) => {
                await signClient.disconnect({
                    topic: session.topic,
                    reason: {
                        code: 6000,
                        message: "user disconnected",
                    }
                })

            });

        } catch (err) {
            console.warn('disconnectWallet', err);
        }

        setWallet({ ...defaultWallet });

    }, [signClient, wallet.sessionTopic]);

    const signAmino = useCallback(async (aminoDoc) => {
        try {
            const res = await signClient.request({
                topic: wallet.sessionTopic,
                chainId: `cosmos:${wallet.chainId}`,
                request: {
                    "method": "cosmos_signAmino",
                    "params": aminoDoc,
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
                signAmino,
                disconnectWallet,
            }}>
            {children}
        </WalletContext.Provider>
    );
};


export function useWalletProvider() {
    const context = useContext(WalletContext);
    return context;
}
