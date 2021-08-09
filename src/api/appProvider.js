export const build = "v3";

const LOCAL_SERVER = "http://localhost:61960";
const REMOTE_SERVER = `https://${build}.explorug.com`;
const isLocalEnv = process.env.REACT_APP_LOCAL_SERVER === "true";
export const domain = isLocalEnv ? LOCAL_SERVER : REMOTE_SERVER;

export const assetsDomain =
  build === "v3" && domain === REMOTE_SERVER
    ? "https://assets.explorug.com" //"https://d1tvaiszosdaib.cloudfront.net"
    : `${domain}/Assets`;

