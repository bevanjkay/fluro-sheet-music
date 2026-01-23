import { useStorage  } from "@vueuse/core";
import type {RemovableRef} from "@vueuse/core";

const user: RemovableRef<User> = useStorage("_fluro_user", { token: "", refreshToken: "" });
const BASE_URL = "https://api.fluro.io";

const buildUrl = (contentType: string, id?: string | Array<string> | null): string => {
  if (!id) {
    return `${BASE_URL}/content/${contentType}`;
  }
  if (Array.isArray(id)) {
    return `${BASE_URL}/content/multiple?ids=${id.join("&ids=")}`;
  }
  if (typeof id === "string") {
    return `${BASE_URL}/content/${contentType}/${id}`;
  }
  throw new Error("Invalid ID type");
};

export const useFluroData = (contentType: string, id?: string | Array<string>, query?: object) => {
  if (!user.value.token) {
    console.error(`Error fetching ${contentType}, user not logged in`);
    return { data: [], error: "User not logged in" };
  }

  const url = buildUrl(contentType, id);
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${user.value.token}`,
  };

  return useLazyFetch(url, { headers, query });
};

export const useAsyncFluroData = async (contentType: string, id?: string | Array<string> | null, query?: object) => {
  if (!user.value.token) {
    console.error(`Error fetching ${contentType}, user not logged in`);
    return { data: [], error: "User not logged in" };
  }

  const url = buildUrl(contentType, id);
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${user.value.token}`,
  };

  const data = await useFetch(url, { headers, query });
  return data;
};
