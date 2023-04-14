const chai = require("chai");
const chaiHttp = require("chai-http");
let server = require("../app");

chai.should();
chai.use(chaiHttp);

describe("Role unit testing", () => {
	it("Role get route", (done) => {
		chai.request(server)
			.get("/v1/role/")
			.end((err, response) => {
				if (err) {
					console.log(err);
				} else {
					response.should.have.status(200);
					response.body.should.be.a("object");
				}
			});
		done();
	});
});
describe("Community unit testing", () => {
	describe("Community get routes", () => {
		it("/v1/community/", (done) => {
			chai.request(server)
				.get("/v1/community/")
				.end((err, response) => {
					if (err) {
						console.log(err);
					} else {
						response.should.have.status(200);
						response.body.should.be.a("object");
					}
				});
			done();
		});
		it("/v1/community/:id/member", (done) => {
			//community name:
			const id = "hello";
			chai.request(server)
				.get("/v1/community/" + id + "/members")
				.end((err, response) => {
					if (err) {
						console.log(err);
					} else {
						response.should.have.status(200);
						response.body.should.be.a("object");
					}
				});
			done();
		});
	});
});
