use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};
use serde::Serialize;

#[derive(Serialize)]

struct BlazinglyFastResponse {
    result: f64,
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}

#[get("/")]
async fn safe_division_with_borrow_checker_approval(info: web::Query<std::collections::HashMap<String, String>>) -> impl Responder {
    let a_str = info.get("a");
    let b_str = info.get("b");

    if a_str.is_none() || b_str.is_none() {
        return HttpResponse::BadRequest().json(ErrorResponse {
            error: "Missing parameters 'a' and 'b'".to_string(),
        });
    }

    let left_operand_lifetime_static: f64 = match a_str.unwrap().parse() {
        Ok(v) => v,
        Err(_) => return HttpResponse::BadRequest().json(ErrorResponse {
            error: "Invalid parameter 'a'".to_string(),
        }),
    };

    let right_operand_guarded: f64 = match b_str.unwrap().parse() {
        Ok(v) => v,
        Err(_) => return HttpResponse::BadRequest().json(ErrorResponse {
            error: "Invalid parameter 'b'".to_string(),
        }),
    };

    if right_operand_guarded == 0.0 {
        return HttpResponse::BadRequest().json(ErrorResponse {
            error: "Division by zero".to_string(),
        });
    }

    HttpResponse::Ok().json(BlazinglyFastResponse { result: left_operand_lifetime_static / right_operand_guarded })
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(safe_division_with_borrow_checker_approval)
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}
