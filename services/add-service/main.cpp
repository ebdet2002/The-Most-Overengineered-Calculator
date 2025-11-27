#include "crow_all.h"

int main() {
  crow::SimpleApp app;

  CROW_ROUTE(app, "/")
  ([](const crow::request &req) {
    auto a_str = req.url_params.get("a");
    auto b_str = req.url_params.get("b");

    if (!a_str || !b_str) {
      return crow::response(400, "Missing parameters 'a' and 'b'");
    }

    double a = std::stod(a_str);
    double b = std::stod(b_str);
    double result = a + b;

    crow::json::wvalue x;
    x["result"] = result;
    return crow::response(x);
  });

  app.port(8080).multithreaded().run();
}
