
import authAPI from "./authService";

export async function getProfile() {
  const token = sessionStorage.getItem("careerCraftToken");

  const response = await authAPI.get("/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function updateProfile(profileData) {
  const token = sessionStorage.getItem("careerCraftToken");

  const response = await authAPI.put("/profile", profileData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
