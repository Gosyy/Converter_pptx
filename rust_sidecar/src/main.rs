use axum::{extract::Json, routing::post, Router};
use pulldown_cmark::{Event, HeadingLevel, Parser, Tag, TagEnd};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct ParseReq {
    filename: String,
    content: String,
}

#[derive(Serialize)]
struct ParseResp {
    markdown: String,
}

#[derive(Deserialize)]
struct AstReq {
    markdown: String,
}

#[derive(Serialize)]
struct AstNode {
    node_type: String,
    value: String,
}

#[derive(Serialize)]
struct AstResp {
    nodes: Vec<AstNode>,
}

#[derive(Deserialize)]
struct FormatReq {
    chunk: String,
}

#[derive(Serialize)]
struct FormatResp {
    chunk: String,
}

fn heading_marker(level: &HeadingLevel) -> &'static str {
    match level {
        HeadingLevel::H1 => "#",
        HeadingLevel::H2 => "##",
        HeadingLevel::H3 => "###",
        HeadingLevel::H4 => "####",
        HeadingLevel::H5 => "#####",
        HeadingLevel::H6 => "######",
    }
}

fn parse_to_markdown(req: &ParseReq) -> String {
    // Базовая быстрая нормализация:
    // - убираем CRLF
    // - добавляем заголовок документа
    // - схлопываем 3+ пустых строк в 2
    let mut md = format!("# {}\n\n{}", req.filename, req.content.replace("\r\n", "\n"));
    while md.contains("\n\n\n") {
        md = md.replace("\n\n\n", "\n\n");
    }
    md
}

fn markdown_to_ast(markdown: &str) -> Vec<AstNode> {
    let parser = Parser::new(markdown);
    let mut nodes = Vec::new();
    let mut in_heading = false;
    let mut heading_prefix = String::new();

    for event in parser {
        match event {
            Event::Start(Tag::Heading { level, .. }) => {
                in_heading = true;
                heading_prefix = heading_marker(&level).to_string();
            }
            Event::End(TagEnd::Heading(..)) => {
                in_heading = false;
                heading_prefix.clear();
            }
            Event::Text(text) => {
                if in_heading {
                    nodes.push(AstNode {
                        node_type: "heading".to_string(),
                        value: format!("{} {}", heading_prefix, text),
                    });
                } else {
                    nodes.push(AstNode {
                        node_type: "text".to_string(),
                        value: text.to_string(),
                    });
                }
            }
            _ => {}
        }
    }

    nodes
}

fn format_chunk_fast(chunk: &str) -> String {
    chunk
        .replace("\r\n", "\n")
        .lines()
        .map(|line| line.trim_end())
        .collect::<Vec<_>>()
        .join("\n")
}

async fn parse(Json(req): Json<ParseReq>) -> Json<ParseResp> {
    Json(ParseResp {
        markdown: parse_to_markdown(&req),
    })
}

async fn ast(Json(req): Json<AstReq>) -> Json<AstResp> {
    Json(AstResp {
        nodes: markdown_to_ast(&req.markdown),
    })
}

async fn format_chunk(Json(req): Json<FormatReq>) -> Json<FormatResp> {
    Json(FormatResp {
        chunk: format_chunk_fast(&req.chunk),
    })
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/parse", post(parse))
        .route("/ast", post(ast))
        .route("/format", post(format_chunk));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:7001")
        .await
        .expect("bind failed");
    axum::serve(listener, app).await.expect("server failed");
}
