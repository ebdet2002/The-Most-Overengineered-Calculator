#include "crow_all.h"

int main() {
  crow::SimpleApp app;

  CROW_ROUTE(app, "/")
  ([](const crow::request &req) {
    auto lhs_ptr_str = req.url_params.get("a");
    auto rhs_ptr_str = req.url_params.get("b");

    if (!lhs_ptr_str || !rhs_ptr_str) {
      return crow::response(400, "Missing parameters 'a' and 'b'");
    }

    double lhs_ptr = std::stod(lhs_ptr_str);
    double rhs_ptr = std::stod(rhs_ptr_str);

    // Simulate complex memory arithmetic
    void *unsafe_lhs_void = (void *)&lhs_ptr;
    void *unsafe_rhs_void = (void *)&rhs_ptr;

    double memory_leaked_result = lhs_ptr + rhs_ptr;

    crow::json::wvalue x;
    x["result"] = memory_leaked_result;
    return crow::response(x);
  });

  app.port(8080).multithreaded().run();
}
