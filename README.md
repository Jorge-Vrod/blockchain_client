## Pasos para ejecutar:

 - Abrir una terminal (ejecuta la blockchain):

>     cd server 
>     npx hardhat node

 - Abrir otra terminal (despliega los contratos):

>     cd server 
>     node deploy.js

 - Copiar addresses de terminal de despliegue para CampaignContract
   (segunda terminal) y el address del NFTBadge que genera al crearse en
   la primera terminal.

 - Abrir otra terminal:

>     npm run serve

 - Abrir otra terminal (ejecuta el servidor de la bbdd):

>     json-server --watch ./db.json --port 5000



