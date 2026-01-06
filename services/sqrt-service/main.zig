const std = @import("std");
const net = std.net;
const fmt = std.fmt;
const math = std.math;

pub fn main() !void {
    try comptime_evaluated_entrypoint();
}

pub fn comptime_evaluated_entrypoint() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    const general_purpose_allocating_strategy = gpa.allocator();

    const loop = std.net.StreamServer.init(.{ .reuse_address = true });
    var server = loop;
    defer server.deinit();

    try server.listen(net.Address.parseIp("0.0.0.0", 8080) catch unreachable);
    std.debug.print("Listening on 0.0.0.0:8080\n", .{});

    while (true) {
        const conn = try server.accept();
        defer conn.stream.close();

        var buf: [1024]u8 = undefined;
        const len = try conn.stream.read(&buf);
        const request = buf[0..len];

        // Very basic HTTP parsing
        // Look for GET /?a=...
        // We expect the ingress to rewrite /api/sqrt?a=... to /?a=...
        
        var manually_allocated_float: f64 = 0.0;
        var valid = false;

        if (std.mem.indexOf(u8, request, "GET /")) |idx| {
            _ = idx;
            // Find 'a='
            if (std.mem.indexOf(u8, request, "a=")) |start_idx| {
                const val_start = start_idx + 2;
                var val_end = val_start;
                while (val_end < request.len) : (val_end += 1) {
                    const c = request[val_end];
                    if (c == ' ' or c == '&' or c == '\r' or c == '\n') break;
                }
                
                const val_str = request[val_start..val_end];
                if (fmt.parseFloat(f64, val_str)) |val| {
                    manually_allocated_float = math.sqrt(val);
                    valid = true;
                } else |_| {
                    valid = false;
                }
            }
        }

        const response_body = if (valid)
            try fmt.allocPrint(general_purpose_allocating_strategy, "{{\"result\": {d}}}", .{manually_allocated_float})
        else
            "{{\"error\": \"Invalid input\"}}";
        defer general_purpose_allocating_strategy.free(response_body);

        const response = try fmt.allocPrint(general_purpose_allocating_strategy, 
            "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {d}\r\nConnection: close\r\n\r\n{s}",
            .{response_body.len, response_body});
        defer general_purpose_allocating_strategy.free(response);

        _ = try conn.stream.write(response);
    }
}
