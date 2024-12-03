import { create } from 'kubo-rpc-client'

export const uploadToIPFS = async (canvasBlob) => {
  const client = create({ url: "/ip4/127.0.0.1/tcp/5001" });

  try {
    const fileResult = await client.add(canvasBlob);
    const filePath = `/${fileResult.cid}`;

    let fileExists = false;
    for await (const file of client.files.ls("/")) {
      if (file.name === fileResult.cid.toString()) {
        fileExists = true;
        break;
      }
    }

    if (fileExists) {
      await client.files.rm(filePath, { recursive: true });
    }

    await client.files.cp(`/ipfs/${fileResult.cid}`, filePath);

    return fileResult.cid;
  } catch (error) {
    console.error("Error during upload:", error.message);
    throw new Error("Error uploading image to IPFS.");
  }
};

export const setFileIPFS = async (ipfsContract, signer, hash) => {
  const ipfsWithSigner = ipfsContract.connect(signer);
  const tx = await ipfsWithSigner.setFileIPFS(hash);
  await tx.wait();
  return hash;
};

export const readFileIPFS = async (ipfsContract, signer) => {
  const file = await ipfsContract.userFiles(signer.getAddress());
  return file;
};
