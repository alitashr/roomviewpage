import { getJsonFromUrl } from "../utils/domUtils";
import HttpClient from "./httpClient";

export const build = "v3";

const LOCAL_SERVER = "http://localhost:61960";
const REMOTE_SERVER = `https://${build}.explorug.com`;
const isLocalEnv = process.env.REACT_APP_LOCAL_SERVER === "true";
export const domain = isLocalEnv ? LOCAL_SERVER : REMOTE_SERVER;
let provider = "appproviderv3.aspx";
const API_KEY = "apikey";

export const assetsDomain =
  build === "v3" && domain === REMOTE_SERVER
    ? "https://assets.explorug.com" //"https://d1tvaiszosdaib.cloudfront.net"
    : `${domain}/Assets`;

const getPageName = () => {
  let page;
  let relogin = true;
  page = getJsonFromUrl().page;
  if (!page) {
    page = sessionStorage.getItem("page");
    relogin = sessionStorage.getItem("relogin");
  }
  return { page, relogin };
};

const postHttpClient = (data, config, sendErrorReport = true) => {
  return new Promise((resolve, reject) => {
    HttpClient.post(`${domain}/${provider}`, data, config)
      .then(response => resolve(response.data))
      .catch(error => {
        //if (sendErrorReport) postErrorReport(error, data);
        reject(error);
      });
  });
};
const postWithRetry = data => {
  return new Promise((resolve, reject) => {
    let numtries = 0;
    const fetchData = () => {
      postHttpClient(data, {}, false)
        .then(resolve)
        .catch(error => {
          numtries++;
          if (numtries <= 5) fetchData();
          else {
            //postErrorReport(error, data);
            reject(error);
          }
        });
    };
    fetchData();
  });
};


const fetchApiKey = ({ username, password, encrypted = false }) => {
  let data = new FormData();
  data.append("action", "login");
  data.append("username", username);
  data.append("password", password);
  if (encrypted) {
    data.append("encrypted", encrypted);
  }
  return new Promise((resolve, reject) => {
    postWithRetry(data)
      .then(res => {
        const key = res.Key;
        if (!key) reject("INVALUD CREDENTIALS");
        else {
          sessionStorage.setItem("page", username);
          sessionStorage.setItem(API_KEY, key);
          sessionStorage.setItem("relogin", false);
          sessionStorage.setItem("multiplelogin", true);
          resolve(key);
        }
      })
      .catch(reject);
  });
};

export const autoLogin = () => {
  const { page, relogin } = getPageName();
  console.log("autoLogin -> page", page)
  const username = sessionStorage.getItem("username") || "";
  const password = sessionStorage.getItem("password") || "";

  return new Promise((resolve, reject)=>{
    if (page && page !== "undefined") {
      HttpClient.post(`${domain}/login/app${page}.aspx`)
        .then(response => {
          if (!response.data) {
            reject("INVALID_CREDENTIALS");
            return;
          }
          sessionStorage.setItem("relogin", false);
          sessionStorage.setItem(API_KEY, response.data.Key);
          sessionStorage.setItem("multiplelogin", false);
          resolve(response.data);
          return;
        })
        .catch(reject);
    } else if (username && username !== "" && password && password !== "") {
      fetchApiKey(username, password, true)
        .then(key => {
          return;
        })
        .catch(reject("NO_LOGIN_PAGE"));
    } else {
      const key = sessionStorage.getItem(API_KEY);
      if (key) resolve(key);
      else reject("NO_LOGIN_PAGE");
      return;
    }
  })
};
