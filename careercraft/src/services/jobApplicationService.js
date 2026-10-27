
import authAPI from "./authService";

const APPLICATIONS_ENDPOINT = "/job-applications";

export async function getApplications(status) {
  const response = await authAPI.get(APPLICATIONS_ENDPOINT, {
    params: status ? { status } : {},
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("careerCraftToken")}`,
    },
  });

  return response.data;
}

export async function createApplication(applicationData) {
  const response = await authAPI.post(
    APPLICATIONS_ENDPOINT,
    applicationData,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("careerCraftToken")}`,
      },
    }
  );

  return response.data;
}

export async function updateApplication(id, applicationData) {
  const response = await authAPI.put(
    `${APPLICATIONS_ENDPOINT}/${id}`,
    applicationData,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("careerCraftToken")}`,
      },
    }
  );

  return response.data;
}

export async function deleteApplication(id) {
  const response = await authAPI.delete(
    `${APPLICATIONS_ENDPOINT}/${id}`,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("careerCraftToken")}`,
      },
    }
  );

  return response.data;
}
