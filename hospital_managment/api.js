
const CarePlusAPI = {
  async save(entity, data) {
    const response = await fetch(
      `api/index.php?entity=${encodeURIComponent(entity)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Data save nahi hua");
    }

    return result;
  },

  async getAll(entity) {
    const response = await fetch(
      `api/index.php?entity=${encodeURIComponent(entity)}`
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Data load nahi hua");
    }

    return result;
  }
};
