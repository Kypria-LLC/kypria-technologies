exports.handler = async (event) => {
  console.log("Oracle invoked:", event.body);
  return {
    statusCode: 200,
    body: JSON.stringify({ 
      message: "Oracle received proposal",
      timestamp: new Date().toISOString(),
      ritual: "active"
    })
  };
};
