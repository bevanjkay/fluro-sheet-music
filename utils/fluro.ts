// Write a composable that extends the useAsyncData method, taking in a content type and an optional ID
//
// The composable should:
// - Accept a content type and an optional ID
// - Fetch the data from the Fluro API
// - Return the data
// - Handle errors
// - Handle loading states
// - Handle refreshing the data

import { useStorage } from "@vueuse/core";

export const useFluroData = (contentType: string, id?: string | Array<string>, query?: object) => {
  const user = useStorage("_fluro_user", { token: null }).value;
  const data = ref(null);
  const base = "https://api.fluro.io";
  let url;
  if (!id) {
    url = `${base}/content/${contentType}`;
  } else if (Array.isArray(id)) {
    url = `${base}/content/multiple?ids=${id.join("&ids=")}`;
  } else if (typeof id == "string") {
    url = `${base}/content/${contentType}/${id}`;
  } else {
    throw new Error("Invalid ID type");
  }
  
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${user.token}`,
  }

  return useLazyFetch(url, { headers, query });
};