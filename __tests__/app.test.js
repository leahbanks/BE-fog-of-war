const request = require("supertest");
const app = require("../db/App.js");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/testData");
const { expect } = require("@jest/globals");
const { Console } = require("console");

beforeEach(() => {
  return seed(testData);
});

afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(() => db.end());

describe("app", () => {
  describe("GET /api/users endpoint", () => {
    it("responds with a status 200 if successful", () => {
      return request(app).get("/api/users").expect(200);
    });
    it("responds with an array of topic objects", () => {
      return request(app)
        .get("/api/users")
        .then((res) => {
          let users = res.body;
          expect(users).toBeInstanceOf(Array);
        });
    });
    it("responds with an array of topic objects with the correct length", () => {
      return request(app)
        .get("/api/users")
        .then((res) => {
          let users = res.body;
          expect(users.length).toBe(4);
        });
    });
    it("responds with an array of topic objects with expected properties and values", () => {
      return request(app)
        .get("/api/users")
        .then((res) => {
          let users = res.body;
          expect(users).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                username: expect.any(String),
                display_name: expect.any(String),
                avatar_url: expect.any(String),
              }),
            ])
          );
        });
    });
    it("responds with a status 500 when an issue occurs", () => {
      jest.spyOn(db, "query").mockImplementation(() => {
        throw new Error("Internal Server Error");
      });

      return Promise.all([request(app).get("/api/users").expect(500)]);
    });
  });
  describe("GET /api/users/:username endpoint", () => {
    it("responds with a status 200 if successful", () => {
      return request(app).get("/api/users/mallionaire").expect(200);
    });
    it("responds with only one user", () => {
      return request(app)
        .get("/api/users/mallionaire")
        .expect(200)
        .then((res) => {
          let user = res.body;
          expect(user.length).toBe(1);
        });
    });
    it("responds with a user object with the correct properties", () => {
      return request(app)
        .get("/api/users/mallionaire")
        .expect(200)
        .then((res) => {
          let user = res.body;
          expect(user).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                user_id: expect.any(Number),
                username: expect.any(String),
                display_name: expect.any(String),
                avatar_url: expect.any(String),
              }),
            ])
          );
        });
    });
    it("responds with a status 404 if user not found", () => {
      return Promise.all([request(app).get("/api/users/abi").expect(404)]).then(
        ([res1]) => {
          expect(res1.body.msg).toEqual("Not Found");
        }
      );
    });
  });
  describe("POST /api/users endpoint", () => {
    const testUser = {
      username: "testcoolname",
      display_name: "veryinsecurepassword",
      avatar_url: "https://www.coolpictures.com/reallycoolimage.jpeg",
    };
    it("responds with a status 201 if successful", () => {
      return request(app).post("/api/users").send(testUser).expect(201);
    });
    it("responds with the posted user", () => {
      return request(app)
        .post("/api/users")
        .send(testUser)
        .expect(201)
        .then((res) => {
          const user = res.body;
          expect(user).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                user_id: expect.any(Number),
                username: expect.any(String),
                display_name: expect.any(String),
                avatar_url: expect.any(String),
              }),
            ])
          );
        });
    });
    it("actually adds the user to the database", () => {
      return request(app)
        .post("/api/users")
        .send(testUser)
        .expect(201)
        .then((res) => {
          return request(app)
            .get("/api/users/testcoolname")
            .expect(200)
            .then((res) => {
              const user = res.body;
              expect(user).toEqual(
                expect.arrayContaining([
                  expect.objectContaining({
                    user_id: 5,
                    username: "testcoolname",
                    display_name: "veryinsecurepassword",
                    avatar_url:
                      "https://www.coolpictures.com/reallycoolimage.jpeg",
                  }),
                ])
              );
            });
        });
    });
  });
  describe("GET /api/users/:user_id/geodata endpoint", () => {
    it("responds with a status 200 if successful", () => {
      return request(app).get("/api/users/1/geodata").expect(200);
    });
    it("responds with an array of geodata objects associated with specific user", () => {
      return request(app)
        .get("/api/users/1/geodata")
        .then((res) => {
          let geodata = res.body;
          expect(geodata).toBeInstanceOf(Array);
        });
    });
    it("responds with an array of geodata objects associated with specified user, with the correct length", () => {
      return request(app)
        .get("/api/users/1/geodata")
        .then((res) => {
          let geodata = res.body;
          expect(geodata.length).toBe(2);
          return request(app).get("/api/users/2/geodata");
        })
        .then((res) => {
          let geodata = res.body;
          expect(geodata.length).toBe(1);
          return request(app).get("/api/users/3/geodata");
        })
        .then((res) => {
          let geodata = res.body;
          expect(geodata.length).toBe(0);
        });
    });
    it("responds with an array of geodata objects with expected properties and values", () => {
      return request(app)
        .get("/api/users/1/geodata")
        .then((res) => {
          let geodata = res.body;
          expect(geodata[0]).toEqual(
            expect.objectContaining({
              geodata_id: expect.any(Number),
              location: expect.arrayContaining([
                expect.any(Number),
                expect.any(Number),
              ]),
              img_url: expect.any(String),
              comment: expect.any(String),
              user_id: expect.any(Number),
            })
          );
        });
    });
    it("responds with a status 500 when an issue occurs", () => {
      jest.spyOn(db, "query").mockImplementation(() => {
        throw new Error("Internal Server Error");
      });

      return Promise.all([
        request(app).get("/api/users/:user_id/geodata").expect(500),
      ]);
    });
  });
  describe("GET /api/geodata endpoint", () => {
    it("responds with a status 200 if successful", () => {
      return request(app).get("/api/geodata").expect(200);
    });
    it("responds with an array of geodata objects", () => {
      return request(app)
        .get("/api/geodata")
        .then((res) => {
          let geodata = res.body;
          expect(geodata).toBeInstanceOf(Array);
        });
    });
    it("responds with an array of geodata objects with the correct length", () => {
      return request(app)
        .get("/api/geodata")
        .then((res) => {
          let geodata = res.body;
          expect(geodata.length).toBe(4);
        });
    });
    it("responds with an array of geodata objects with expected properties and values", () => {
      return request(app)
        .get("/api/geodata")
        .then((res) => {
          let geodata = res.body;
          expect(geodata).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                geodata_id: expect.any(Number),
                user_id: expect.any(Number),
              }),
            ])
          );
        });
    });
    it("responds with a status 500 when an issue occurs", () => {
      jest.spyOn(db, "query").mockImplementation(() => {
        throw new Error("Internal Server Error");
      });

      return Promise.all([request(app).get("/api/geodata").expect(500)]);
    });
  });
  describe("GET /api/geodata/:geodata_id endpoint", () => {
    it("responds with a status 200 if successful", () => {
      return request(app).get("/api/geodata/1").expect(200);
    });
    it("responds with only one piece of geodata", () => {
      return request(app)
        .get("/api/geodata/1")
        .expect(200)
        .then((res) => {
          let geodata = res.body;
          expect(geodata.length).toBe(1);
        });
    });
    it("responds with a geodata object with the correct properties", () => {
      return request(app)
        .get("/api/geodata/1")
        .expect(200)
        .then((res) => {
          let geodata = res.body;
          expect(geodata).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                geodata_id: expect.any(Number),
                location: expect.arrayContaining([
                  expect.any(Number),
                  expect.any(Number),
                ]),
                img_url: expect.any(String),
                comment: expect.any(String),
                user_id: expect.any(Number),
              }),
            ])
          );
        });
    });
    it("responds with a status 404 if drop not found", () => {
      return Promise.all([
        request(app).get("/api/geodata/99999").expect(404),
      ]).then(([res1]) => {
        expect(res1.body.msg).toEqual("Geodata not found with matching ID");
      });
    });
  });
  describe("POST /api/geodata endpoint", () => {
    const testGeodata = {
      location: [-75.1001345742366, 123.34633830198504],
      user_id: 1,
      comment: "Loving the weather",
      img_url: "https://i.imgur.com/KT5sbOH.jpeg",
    };
    it("responds with a status 201 if successful", () => {
      return request(app).post("/api/geodata").send(testGeodata).expect(201);
    });
    it("responds with the posted user", () => {
      return request(app)
        .post("/api/geodata")
        .send(testGeodata)
        .expect(201)
        .then((res) => {
          let geodata = res.body;
          expect(geodata).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                geodata_id: expect.any(Number),
                location: expect.arrayContaining([
                  expect.any(Number),
                  expect.any(Number),
                ]),
                img_url: expect.any(String),
                comment: expect.any(String),
                user_id: expect.any(Number),
              }),
            ])
          );
        });
    });
    it("actually adds the user to the database", () => {
      return request(app)
        .post("/api/geodata")
        .send(testGeodata)
        .expect(201)
        .then((res) => {
          return request(app)
            .get("/api/geodata/5")
            .expect(200)
            .then((res) => {
              let geodata = res.body;
              expect(geodata).toEqual(
                expect.arrayContaining([
                  expect.objectContaining({
                    geodata_id: expect.any(Number),
                    location: expect.arrayContaining([
                      expect.any(Number),
                      expect.any(Number),
                    ]),
                    img_url: expect.any(String),
                    comment: expect.any(String),
                    user_id: expect.any(Number),
                  }),
                ])
              );
            });
        });
    });
  });
  describe("DELETE /api/users/:user_id/geodata endpoint", () => {
    it("responds with a status 204 no content on successful deletion", () => {
      return request(app).delete("/api/users/1/geodata").expect(204);
    });
    it("actually deletes all user geodata", () => {
      return request(app)
        .delete("/api/users/1/geodata")
        .expect(204)
        .then(() => {
          return request(app)
            .get("/api/users/1/geodata")
            .expect(200)
            .then((res) => {
              const geodata = res.body;
              expect(geodata.length).toBe(0);
            })
            .then(() => {
              return request(app)
                .get("/api/geodata")
                .expect(200)
                .then((res) => {
                  const geodata = res.body;
                  geodata.forEach((geodata) => {
                    expect(geodata.user_id).not.toBe(1);
                  });
                });
            });
        });
    });
    it("responds with an error code of 404 and appropriate error message if no user is found with provided user_id", () => {
      return request(app).delete("/api/users/99/geodata").expect(404);
    });
    it("responds with an error code of 400 and appropriate error message if the id passed in is invalid", () => {
      return Promise.all([
        request(app).delete("/api/users/example/geodata").expect(400),
        request(app).delete("/api/users/example1/geodata").expect(400),
        request(app).delete("/api/users/[]/geodata").expect(400),
        request(app).delete("/api/users/{}/geodata").expect(400),
      ]).then(([res1, res2, res3, res4]) => {
        expect(res1.body.msg).toEqual("Bad Request");
        expect(res2.body.msg).toEqual("Bad Request");
        expect(res3.body.msg).toEqual("Bad Request");
        expect(res4.body.msg).toEqual("Bad Request");
      });
    });
  });
  describe("DELETE /api/geodata/:geodata_id endpoint", () => {
    it("responds with a status 204 no content on successful deletion", () => {
      return request(app).delete("/api/geodata/1").expect(204);
    });
    it("actually deletes specified geodata", () => {
      return request(app)
        .delete("/api/geodata/1")
        .expect(204)
        .then(() => {
          return request(app)
            .get("/api/geodata/1")
            .expect(404)
            .then((res) => {
              expect(res.body.msg).toEqual(
                "Geodata not found with matching ID"
              );
            })
            .then(() => {
              return request(app)
                .get("/api/geodata")
                .expect(200)
                .then((res) => {
                  const geodata = res.body;
                  geodata.forEach((geodata) => {
                    expect(geodata.geodata_id).not.toBe(1);
                  });
                });
            });
        });
    });
    it("responds with an error code of 400 and appropriate error message if the id passed in is invalid", () => {
      return Promise.all([
        request(app).delete("/api/geodata/example").expect(400),
        request(app).delete("/api/geodata/example1").expect(400),
        request(app).delete("/api/geodata/[]").expect(400),
        request(app).delete("/api/geodata/{}").expect(400),
      ]).then(([res1, res2, res3, res4]) => {
        expect(res1.body.msg).toEqual("Bad Request");
        expect(res2.body.msg).toEqual("Bad Request");
        expect(res3.body.msg).toEqual("Bad Request");
        expect(res4.body.msg).toEqual("Bad Request");
      });
    });
  });
  describe("GET /api/trips/:user_id endpoint", () => {
    it("responds with a status 200 if successful", () => {
      return request(app).get("/api/trips/1").expect(200);
    });
    it("responds with correct length of coordinates for trip", () => {
      return request(app)
        .get("/api/trips/1")
        .expect(200)
        .then((res) => {
          let trips = res.body.trips[0].points;
          expect(trips.length).toBe(6);
        });
    });
    it("responds with the expected trips for user 1", () => {
      return request(app)
        .get("/api/trips/1")
        .expect(200)
        .then((res) => {
          const trips = res.body.trips;
          expect(res.body.user_id).toBe(1);
          expect(trips).toHaveLength(2);
          const trip1 = trips.find((trip) => trip.trip_id === 1);
          expect(trip1.points).toHaveLength(6);
          expect(trip1.points[0].coordinates).toEqual([
            0.13138741600173248, 51.56144203807303,
          ]);
          expect(trip1.points[0].circleSize).toBe(0.5);
          const trip2 = trips.find((trip) => trip.trip_id === 2);
          expect(trip2.points).toHaveLength(2);
          expect(trip2.points[0].coordinates).toEqual([
            -0.1429489005651874, 51.50080870807764,
          ]);
          expect(trip2.points[0].circleSize).toBe(0.5);
        });
    });

    it("responds with the expected data for user 1 and trip 2", () => {
      return request(app)
        .get("/api/trips/1?trip_id=2")
        .expect(200)
        .then((res) => {
          const trip = res.body;
          expect(trip.user_id).toBe(1);
          expect(trip.trips[0].trip_id).toBe(2);
          expect(trip.trips[0].points).toHaveLength(2);
          expect(trip.trips[0].points[0].coordinates).toEqual([
            -0.1429489005651874, 51.50080870807764,
          ]);
          expect(trip.trips[0].points[0].circleSize).toBe(0.5);
        });
    });

    it("responds with a status 404 if user not found", () => {
      return Promise.all([request(app).get("/api/trips/999").expect(404)]).then(
        ([res1]) => {
          expect(res1.body.msg).toEqual("Not Found");
        }
      );
    });
  });
  describe("POST /api/trips/:user_id endpoint", () => {
    const testTrips = {
      user_id: 1,
      trips: [
        {
          trip_id: 2,
          points: [
            {
              coordinates: [-0.1429489005651874, 51.50080870807764],
              circleSize: 0.5,
            },
            {
              coordinates: [-0.15314146762585779, 51.534935924609954],
              circleSize: 0.5,
            },
          ],
        },
        {
          trip_id: 1,
          points: [
            {
              coordinates: [-0.1429489005651874, 51.50080870807764],
              circleSize: 0.5,
            },
            {
              coordinates: [-0.232332305651874, 51.777770807764],
              circleSize: 0.5,
            },
          ],
        },
      ],
    };

    it("responds with a status 201 if successful", () => {
      return request(app).post("/api/trips/1").send(testTrips).expect(201);
    });
    it("responds with the posted trips", () => {
      return request(app)
        .post("/api/trips/1")
        .send(testTrips)
        .expect(201)
        .then((res) => {
          let trips = res.body.trips;
          expect(res.body.user_id).toBe(1);
          expect(trips).toHaveLength(2);
          const trip1 = trips.find((trip) => trip.trip_id === 1);
          expect(trip1.points).toHaveLength(2);
          expect(trip1.points[0].coordinates).toEqual([
            -0.1429489005651874, 51.50080870807764,
          ]);
          expect(trip1.points[0].circleSize).toBe(0.5);
          const trip2 = trips.find((trip) => trip.trip_id === 2);
          expect(trip2.points).toHaveLength(2);
          expect(trip2.points[0].coordinates).toEqual([
            -0.1429489005651874, 51.50080870807764,
          ]);
          expect(trip2.points[0].circleSize).toBe(0.5);
        });
    });
    it("actually adds the trips to the database", () => {
      return request(app)
        .post("/api/trips/1")
        .send(testTrips)
        .expect(201)
        .then((res) => {
          return request(app)
            .get("/api/trips/1")
            .expect(200)
            .then((res) => {
              let trips = res.body.trips;
              console.log(trips);
              expect(trips[0].points.length).toBe(8),
                expect(trips[1].points.length).toBe(4);
            });
        });
    });
  });
});
