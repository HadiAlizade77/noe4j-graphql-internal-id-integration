/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Driver } from "neo4j-driver";
import { graphql } from "graphql";
import { generate } from "randomstring";
import Neo4j from "../../../neo4j";
import { Neo4jGraphQL } from "../../../../../src/classes";

describe("aggregations-where-node-datetime", () => {
    let driver: Driver;
    let neo4j: Neo4j;

    beforeAll(async () => {
        neo4j = new Neo4j();
        driver = await neo4j.getDriver();
    });

    afterAll(async () => {
        await driver.close();
    });

    test("should return posts where a like DateTime is EQUAL to", async () => {
        const session = await neo4j.getSession();

        const typeDefs = `
            type User {
                testString: String!
                someDateTime: DateTime!
            }

            type Post {
              testString: String!
              likes: [User!]! @relationship(type: "LIKES", direction: IN)
            }
        `;

        const testString = generate({
            charset: "alphabetic",
            readable: true,
        });

        const someDateTime = new Date();

        const neoSchema = new Neo4jGraphQL({ typeDefs });

        try {
            await session.run(
                `
                    CREATE (:Post {testString: "${testString}"})<-[:LIKES]-(:User {testString: "${testString}", someDateTime: dateTime("${someDateTime.toISOString()}")})
                    CREATE (:Post {testString: "${testString}"})
                `
            );

            const query = `
                {
                    posts(where: { testString: "${testString}", likesAggregate: { node: { someDateTime_EQUAL: "${someDateTime.toISOString()}" } } }) {
                        testString
                        likes {
                            testString
                            someDateTime
                        }
                    }
                }
            `;

            const gqlResult = await graphql({
                schema: await neoSchema.getSchema(),
                source: query,
                contextValue: { driver, driverConfig: { bookmarks: [session.lastBookmark()] } },
            });

            if (gqlResult.errors) {
                console.log(JSON.stringify(gqlResult.errors, null, 2));
            }

            expect(gqlResult.errors).toBeUndefined();

            expect((gqlResult.data as any).posts).toEqual([
                {
                    testString,
                    likes: [{ testString, someDateTime: someDateTime.toISOString() }],
                },
            ]);
        } finally {
            await session.close();
        }
    });

    test("should return posts where a like DateTime is GT than", async () => {
        const session = await neo4j.getSession();

        const typeDefs = `
            type User {
                testString: String!
                someDateTime: DateTime!
            }

            type Post {
              testString: String!
              likes: [User!]! @relationship(type: "LIKES", direction: IN)
            }
        `;

        const testString = generate({
            charset: "alphabetic",
            readable: true,
        });

        const someDateTime = new Date();
        const someDateTimeGT = new Date();
        someDateTimeGT.setDate(someDateTimeGT.getDate() - 1);

        const neoSchema = new Neo4jGraphQL({ typeDefs });

        try {
            await session.run(
                `
                    CREATE (:Post {testString: "${testString}"})<-[:LIKES]-(:User {testString: "${testString}", someDateTime: datetime("${someDateTime.toISOString()}")})
                    CREATE (:Post {testString: "${testString}"})
                `
            );

            const query = `
                {
                    posts(where: { testString: "${testString}", likesAggregate: { node: { someDateTime_GT: "${someDateTimeGT.toISOString()}" } } }) {
                        testString
                        likes {
                            testString
                            someDateTime
                        }
                    }
                }
            `;

            const gqlResult = await graphql({
                schema: await neoSchema.getSchema(),
                source: query,
                contextValue: { driver, driverConfig: { bookmarks: [session.lastBookmark()] } },
            });

            if (gqlResult.errors) {
                console.log(JSON.stringify(gqlResult.errors, null, 2));
            }

            expect(gqlResult.errors).toBeUndefined();

            expect((gqlResult.data as any).posts).toEqual([
                {
                    testString,
                    likes: [{ testString, someDateTime: someDateTime.toISOString() }],
                },
            ]);
        } finally {
            await session.close();
        }
    });

    test("should return posts where a like DateTime is GTE than", async () => {
        const session = await neo4j.getSession();

        const typeDefs = `
            type User {
                testString: String!
                someDateTime: DateTime!
            }

            type Post {
              testString: String!
              likes: [User!]! @relationship(type: "LIKES", direction: IN)
            }
        `;

        const testString = generate({
            charset: "alphabetic",
            readable: true,
        });

        const someDateTime = new Date();

        const neoSchema = new Neo4jGraphQL({ typeDefs });

        try {
            await session.run(
                `
                    CREATE (:Post {testString: "${testString}"})<-[:LIKES]-(:User {testString: "${testString}", someDateTime: datetime("${someDateTime.toISOString()}")})
                    CREATE (:Post {testString: "${testString}"})
                `
            );

            const query = `
                {
                    posts(where: { testString: "${testString}", likesAggregate: { node: { someDateTime_GTE: "${someDateTime.toISOString()}" } } }) {
                        testString
                        likes {
                            testString
                            someDateTime
                        }
                    }
                }
            `;

            const gqlResult = await graphql({
                schema: await neoSchema.getSchema(),
                source: query,
                contextValue: { driver, driverConfig: { bookmarks: [session.lastBookmark()] } },
            });

            if (gqlResult.errors) {
                console.log(JSON.stringify(gqlResult.errors, null, 2));
            }

            expect(gqlResult.errors).toBeUndefined();

            expect((gqlResult.data as any).posts).toEqual([
                {
                    testString,
                    likes: [{ testString, someDateTime: someDateTime.toISOString() }],
                },
            ]);
        } finally {
            await session.close();
        }
    });

    test("should return posts where a like DateTime is LT than", async () => {
        const session = await neo4j.getSession();

        const typeDefs = `
            type User {
                testString: String!
                someDateTime: DateTime!
            }

            type Post {
              testString: String!
              likes: [User!]! @relationship(type: "LIKES", direction: IN)
            }
        `;

        const testString = generate({
            charset: "alphabetic",
            readable: true,
        });

        const someDateTime = new Date();
        const someDateTimeLT = new Date();
        someDateTimeLT.setDate(someDateTimeLT.getDate() + 1);

        const neoSchema = new Neo4jGraphQL({ typeDefs });

        try {
            await session.run(
                `
                    CREATE (:Post {testString: "${testString}"})<-[:LIKES]-(:User {testString: "${testString}", someDateTime: datetime("${someDateTime.toISOString()}")})
                    CREATE (:Post {testString: "${testString}"})
                `
            );

            const query = `
                {
                    posts(where: { testString: "${testString}", likesAggregate: { node: { someDateTime_LT: "${someDateTimeLT.toISOString()}" } } }) {
                        testString
                        likes {
                            testString
                            someDateTime
                        }
                    }
                }
            `;

            const gqlResult = await graphql({
                schema: await neoSchema.getSchema(),
                source: query,
                contextValue: { driver, driverConfig: { bookmarks: [session.lastBookmark()] } },
            });

            if (gqlResult.errors) {
                console.log(JSON.stringify(gqlResult.errors, null, 2));
            }

            expect(gqlResult.errors).toBeUndefined();

            expect((gqlResult.data as any).posts).toEqual([
                {
                    testString,
                    likes: [{ testString, someDateTime: someDateTime.toISOString() }],
                },
            ]);
        } finally {
            await session.close();
        }
    });

    test("should return posts where a like DateTime is LTE than", async () => {
        const session = await neo4j.getSession();

        const typeDefs = `
            type User {
                testString: String!
                someDateTime: DateTime!
            }

            type Post {
              testString: String!
              likes: [User!]! @relationship(type: "LIKES", direction: IN)
            }
        `;

        const testString = generate({
            charset: "alphabetic",
            readable: true,
        });

        const someDateTime = new Date();

        const neoSchema = new Neo4jGraphQL({ typeDefs });

        try {
            await session.run(
                `
                    CREATE (:Post {testString: "${testString}"})<-[:LIKES]-(:User {testString: "${testString}", someDateTime: datetime("${someDateTime.toISOString()}")})
                    CREATE (:Post {testString: "${testString}"})
                `
            );

            const query = `
                {
                    posts(where: { testString: "${testString}", likesAggregate: { node: { someDateTime_LTE: "${someDateTime.toISOString()}" } } }) {
                        testString
                        likes {
                            testString
                            someDateTime
                        }
                    }
                }
            `;

            const gqlResult = await graphql({
                schema: await neoSchema.getSchema(),
                source: query,
                contextValue: { driver, driverConfig: { bookmarks: [session.lastBookmark()] } },
            });

            if (gqlResult.errors) {
                console.log(JSON.stringify(gqlResult.errors, null, 2));
            }

            expect(gqlResult.errors).toBeUndefined();

            expect((gqlResult.data as any).posts).toEqual([
                {
                    testString,
                    likes: [{ testString, someDateTime: someDateTime.toISOString() }],
                },
            ]);
        } finally {
            await session.close();
        }
    });
});
