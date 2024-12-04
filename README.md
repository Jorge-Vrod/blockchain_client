## Pasos para ejecutar:

 - Abrir una terminal (ejecuta la blockchain):

>     cd server 
>     ganache-cli --db ./data --mnemonic "split mind despair volume hen account reform buddy version hobby tourist duty" --i 1337 --defaultBalanceEther 100000

 - Abrir otra terminal (despliega los contratos):

>     cd server 
>     npx hardhat run scripts/deploy.js --network ganache

 - Copiar addresses de terminal de despliegue para CampaignContract
   (segunda terminal) y el address del NFTBadge que genera al crearse en
   la primera terminal.

 - Abrir otra terminal:

>     npm run serve

 - Abrir otra terminal (ejecuta el servidor de la bbdd):

>     json-server --watch ./db.json --port 5000



