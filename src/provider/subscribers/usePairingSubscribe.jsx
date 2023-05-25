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
        if (!isSignClientInitialized(signClient)) {
            return;
        }

        const handlePairingDestroyed = () => {
            console.log("pairing_delete", "or", "pairing_expired");
            setWalletCB({ ...defaultWallet });
        };

        const handlePairingPing = () => {
            console.log("pairing_ping");
        };

        signClient.core.pairing.events.on("pairing_delete", handlePairingDestroyed);
        signClient.core.pairing.events.on("pairing_expire", handlePairingDestroyed);
        signClient.core.pairing.events.on("pairing_ping", handlePairingPing);

        return () => {
            if (!isSignClientInitialized(signClient)) {
                return;
            }

            signClient.core.pairing.events.off("pairing_delete", handlePairingDestroyed);
            signClient.core.pairing.events.off("pairing_expire", handlePairingDestroyed);
            signClient.core.pairing.events.off("pairing_ping", handlePairingPing);
        }


    }, [signClient, pairingTopic])

};
