export const fetchScene = async (params) => {
  try {
    const response = await fetch(
      "https://allkits-server.onrender.com/getScene",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: params.id,
        }),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch scene");
    }
    const jsonData = await response.json();

    console.log(jsonData);
    return jsonData;
  } catch (error) {
    console.error("Error fetching scene:", error);
  }
};
