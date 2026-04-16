class ApiResponse {
  static success(data = null, message = '操作成功') {
    return {
      code: 200,
      message,
      data,
      timestamp: Date.now()
    };
  }

  static error(message = '操作失败', code = 500) {
    return {
      code,
      message,
      data: null,
      timestamp: Date.now()
    };
  }

  static notFound(message = '资源不存在') {
    return this.error(message, 404);
  }

  static badRequest(message = '请求参数错误') {
    return this.error(message, 400);
  }
}

module.exports = ApiResponse;
