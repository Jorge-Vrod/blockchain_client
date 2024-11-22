## Pasos para ejecutar:

 - Abrir una terminal (ejecuta la blockchain):

    cd src/hardhat 
    npx node 

 - Abrir otra terminal (despliega los contratos):

    cd src/hardhat 
    npx hardhat run scripts/deploy.js --network localhost 

 - Copiar addresses de terminal de despliegue para CampaignContract
   (segunda terminal) y el address del NFTBadge que genera al crearse en
   la primera terminal.

 - Abrir otra terminal:

    npm run serve
