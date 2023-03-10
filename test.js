const jwt = require("jsonwebtoken");

let expiredToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NDBhYjkxODlmYzk4YTlmNjEwMWQxNTciLCJpYXQiOjE2Nzg0MjQ0NzYsImV4cCI6MTY3ODQyNDUzNn0.tK0pWvuhDvZY1UxWU75BHMzyTzHEqgEhqUBZZMHn_aQ";
let secret = "dc96f5096e3166281257b571e47329df67ffb611fb5ded68e5e0a993b82a0e62e6822828ae5219cecb4cbe970c0bb0f7ed5422de8069f9a692dc4f76454ad6cc";
try {
    jwt.verify(expiredToken, secret);
} catch (err) {
    console.log(err instanceof jwt.JsonWebTokenError);
}
