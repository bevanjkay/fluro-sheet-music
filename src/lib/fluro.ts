import { User } from "@/types";

const base = "https://api.fluro.io";

export const fetchFluroData = async (
  contentType: string, 
  user: User,
  id?: string | Array<string>,
  query?: Record<string, string>
) => {
  if (!user.token) {
    console.error(`Error fetching ${contentType}, user not logged in`);
    throw new Error("User not logged in");
  }

  let url;
  if (!id) {
    url = `${base}/content/${contentType}`;
  }
  else if (Array.isArray(id)) {
    url = `${base}/content/multiple?ids=${id.join("&ids=")}`;
  }
  else if (typeof id === "string") {
    url = `${base}/content/${contentType}/${id}`;
  }
  else {
    throw new Error("Invalid ID type");
  }

  // Use query string authentication for sheet content types
  const useQueryAuth = contentType === "sheet";
  
  if (useQueryAuth) {
    // Add access_token to query params
    const queryParams = new URLSearchParams(query || {});
    queryParams.set("access_token", user.token);
    const queryString = "?" + queryParams.toString();
    
    const response = await fetch(url + queryString, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${contentType}: ${response.statusText}`);
    }
    
    return await response.json();
  } else {
    // Use Bearer token authentication for other content types
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${user.token}`,
    };

    const queryString = query ? "?" + new URLSearchParams(query).toString() : "";
    const response = await fetch(url + queryString, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${contentType}: ${response.statusText}`);
    }
    
    return await response.json();
  }
};