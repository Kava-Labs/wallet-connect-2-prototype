//@ts-check
import React, { useEffect } from 'react';
import { web3Modal, isSignClientInitialized, defaultWallet } from '../utils';
import SignClient from "@walletconnect/sign-client";


/**
 * subscribes to Wallet Connect 2 session events
 * Warning: only for use inside WalletProvider
 * @param {SignClient} signClient 
 * @param {string} sessionTopic 
 * @param {React.Dispatch<{ address: string, chainId: string, sessionTopic: string, pairingTopic: string  }>} setWalletCB 
 */

export const useSessionSubscribe = (signClient, sessionTopic, setWalletCB) => {
    useEffect(() => {
        if (!isSignClientInitialized(signClient)) {
            return;
        }

        const sessionEventHandler = () => {
            console.info("session_event");
        };

        const sessionUpdateHandler = () => {
            console.info("session_update");
        };

        const sessionDestroyedHandler = () => {
            console.info("session_expire", "or", "session_delete", "or", "proposal_expire");
            setWalletCB({ ...defaultWallet });
        };



        const sessionPingHandler = async () => {
            console.info("session_ping");

        };
        let eventsSet = false;
        try {
            if (!isSignClientInitialized(signClient)) {
                return;
            }
            
            if (!sessionTopic) {
                return;
            }
            // small note(sah): signClient.session.get throws when key is not found
            const session = signClient.session.get(sessionTopic);
            console.log("got session", session);

            signClient.on("session_event", sessionEventHandler);
            signClient.on("session_update", sessionUpdateHandler);
            signClient.on("session_expire", sessionDestroyedHandler);
            signClient.on("proposal_expire", sessionDestroyedHandler);
            signClient.on("session_delete", sessionDestroyedHandler);
            signClient.on("session_ping", sessionPingHandler);
            eventsSet = true;
        } catch (err) {
            console.warn(err);
            setWalletCB({...defaultWallet});
        }

        return () => {
            if (!eventsSet) {
                return;
            }
            signClient.off("session_event", sessionEventHandler);
            signClient.off("session_update", sessionUpdateHandler);
            signClient.off("session_expire", sessionDestroyedHandler);
            signClient.off("session_delete", sessionDestroyedHandler);
            signClient.off("proposal_expire", sessionDestroyedHandler);
            signClient.off("session_ping", sessionPingHandler);
        }

    }, [signClient, sessionTopic])


};
