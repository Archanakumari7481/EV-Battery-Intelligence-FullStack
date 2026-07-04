// Keeps every successful response in the same shape: { success, message, data }
const sendResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

module.exports = sendResponse;
