import axios, { type AxiosInstance } from "axios";
import type { NextPageContext } from "next";

export default function buildClient(
  ctx?: Pick<NextPageContext, "req">,
): AxiosInstance {
  if (typeof window === "undefined") {
    return axios.create({
      baseURL:
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      headers: ctx?.req?.headers,
    });
  }

  return axios.create({ baseURL: "/" });
}
