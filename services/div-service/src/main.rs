use actix_web::{get, web, App, HttpResponse, HttpServer, Responder};
use serde::Serialize;

#[derive(Serialize)]
struct Response {
    result: f64,
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}

#[get("/")]
async fn div(info: web::Query<std::collections::HashMap<String, String>>) -> impl Responder {
    let a_str = info.get("a");
    let b_str = info.get("b");

    if a_str.is_none() || b_str.is_none() {
        return HttpResponse::BadRequest().json(ErrorResponse {
            error: "Missing parameters 'a' and 'b'".to_string(),
        });
    }

    let a: f64 = match a_str.unwrap().parse() {
        Ok(v) => v,
        Err(_) => return HttpResponse::BadRequest().json(ErrorResponse {
            error: "Invalid parameter 'a'".to_string(),
        }),
    };

    let b: f64 = match b_str.unwrap().parse() {
        Ok(v) => v,
        Err(_) => return HttpResponse::BadRequest().json(ErrorResponse {
            error: "Invalid parameter 'b'".to_string(),
        }),
    };

    if b == 0.0 {
        return HttpResponse::BadRequest().json(ErrorResponse {
            error: "Division by zero".to_string(),
        });
    }

    HttpResponse::Ok().json(Response { result: a / b })
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(div)
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}
