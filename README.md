## Wallet Connect 2 

this is a demo/repro repository to track issues & progress for connecting to different cosmos chains using Wallet Connect 2

1. obtain a project id from [Wallet Connect Cloud](https://cloud.walletconnect.com/)
2. create a `.env` file and add `VITE_WALLET_CONNECT_PROJECT_ID='your_project_id'`
3. run `npm install`
4. run `npm run dev`
5. interact with the 3 buttons that connect to different cosmos chains 
    - a modal should open, use trust wallet to scan the QR code
    - if a connection was established you should see an alert in the webapp telling you to check the console for session data
