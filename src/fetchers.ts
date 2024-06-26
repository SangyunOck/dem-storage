import axios from "axios";

export const serverFetcher = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 1500,
});
