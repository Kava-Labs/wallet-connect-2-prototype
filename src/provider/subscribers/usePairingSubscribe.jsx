//@ts-check
import { useEffect } from 'react';
import { isSignClientInitialized, defaultWallet } from '../utils';
import SignClient from "@walletconnect/sign-client";

/**
 * subscribes to Wallet Connect 2 pairing events
 * Warning: only for use inside WalletProvider
 * @param {SignClient} signClient 
 * @param {string} pairingTopic 
 * @param {React.Dispatch<{ address: string, chainId: string, sessionTopic: string, pairingTopic: string  }>} setWalletCB 
 */

export const usePairingSubscribe = (signClient, pairingTopic, setWalletCB) => {

    useEffect(() => {
        if (!isSignClientInitialized(signClient) || !pairingTopic) {
            return;
        }

        const handlePairingDelete = (ev) => {
            console.log("received event: pairing_delete", ev);
            setWalletCB({ ...defaultWallet });
        };

        const handlePairingExpired = (ev) => {
            console.log("received event: pairing_expired", ev);
            setWalletCB({ ...defaultWallet });
        };


        const handlePairingPing = () => {
            console.log("received event: pairing_ping");
        };

        console.log("subscribing to events on pairing topic: ", pairingTopic);
        signClient.core.pairing.events.on("pairing_delete", handlePairingDelete);
        signClient.core.pairing.events.on("pairing_expire", handlePairingExpired);
        signClient.core.pairing.events.on("pairing_ping", handlePairingPing);

        return () => {
            if (!isSignClientInitialized(signClient) || !pairingTopic) {
                return;
            }

            console.log("unsubscribing to events on pairing topic: ", pairingTopic);
            signClient.core.pairing.events.off("pairing_delete", handlePairingDelete);
            signClient.core.pairing.events.off("pairing_expire", handlePairingExpired);
            signClient.core.pairing.events.off("pairing_ping", handlePairingPing);
        }


    }, [signClient, pairingTopic])

};
