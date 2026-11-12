const midtransClient = require("midtrans-client");

const getMidtransConfig = () => {
  const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim();
  const clientKey = process.env.MIDTRANS_CLIENT_KEY?.trim();
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

  return {
    serverKey,
    clientKey,
    isProduction,
    isConfigured: Boolean(serverKey && clientKey),
  };
};

const createSnapClient = () => {
  const config = getMidtransConfig();

  if (!config.isConfigured) {
    throw new Error("Midtrans belum dikonfigurasi.");
  }

  return new midtransClient.Snap({
    isProduction: config.isProduction,
    serverKey: config.serverKey,
    clientKey: config.clientKey,
  });
};

module.exports = {
  createSnapClient,
  getMidtransConfig,
};
