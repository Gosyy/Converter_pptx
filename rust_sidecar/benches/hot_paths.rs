use criterion::{criterion_group, criterion_main, Criterion};

fn parse_like_workload(input: &str) -> String {
    let mut out = format!("# bench\n\n{}", input.replace("\r\n", "\n"));
    while out.contains("\n\n\n") {
        out = out.replace("\n\n\n", "\n\n");
    }
    out
}

fn format_like_workload(input: &str) -> String {
    input
        .replace("\r\n", "\n")
        .lines()
        .map(|line| line.trim_end())
        .collect::<Vec<_>>()
        .join("\n")
}

fn bench_hot_paths(c: &mut Criterion) {
    let payload = "# Заголовок\n\nТекст\n\n- пункт 1\n- пункт 2\n".repeat(200);

    c.bench_function("parse_like_workload", |b| {
        b.iter(|| parse_like_workload(&payload))
    });

    c.bench_function("format_like_workload", |b| {
        b.iter(|| format_like_workload(&payload))
    });
}

criterion_group!(benches, bench_hot_paths);
criterion_main!(benches);
