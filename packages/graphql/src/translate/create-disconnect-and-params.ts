import { Context, Node } from "../classes";
import { RelationField } from "../types";
import createWhereAndParams from "./create-where-and-params";
import createAuthAndParams from "./create-auth-and-params";
import { AUTH_FORBIDDEN_ERROR } from "../constants";

interface Res {
    disconnects: string[];
    params: any;
}

function createDisconnectAndParams({
    withVars,
    value,
    varName,
    relationField,
    parentVar,
    refNode,
    context,
    labelOverride,
    parentNode,
    insideDoWhen,
}: {
    withVars: string[];
    value: any;
    varName: string;
    relationField: RelationField;
    parentVar: string;
    context: Context;
    refNode: Node;
    labelOverride?: string;
    parentNode: Node;
    insideDoWhen?: boolean;
}): [string, any] {
    function reducer(res: Res, disconnect: any, index): Res {
        const _varName = `${varName}${index}`;
        const inStr = relationField.direction === "IN" ? "<-" : "-";
        const outStr = relationField.direction === "OUT" ? "->" : "-";
        const relVarName = `${_varName}_rel`;
        const relTypeStr = `[${relVarName}:${relationField.type}]`;

        res.disconnects.push(`WITH ${withVars.join(", ")}`);
        res.disconnects.push(
            `OPTIONAL MATCH (${parentVar})${inStr}${relTypeStr}${outStr}(${_varName}:${
                labelOverride || relationField.typeMeta.name
            })`
        );

        if (disconnect.where) {
            const where = createWhereAndParams({
                varName: _varName,
                whereInput: disconnect.where,
                node: refNode,
                context,
            });
            res.disconnects.push(where[0]);
            res.params = { ...res.params, ...where[1] };
        }

        const preAuth = [parentNode, refNode].reduce(
            (result: Res, node, i) => {
                if (!node.auth) {
                    return result;
                }

                const [str, params] = createAuthAndParams({
                    entity: node,
                    operation: "disconnect",
                    context,
                    escapeQuotes: Boolean(insideDoWhen),
                    allow: { parentNode: node, varName: _varName, chainStr: `${_varName}${node.name}${i}_allow` },
                });

                if (!str) {
                    return result;
                }

                result.disconnects.push(str);
                result.params = { ...result.params, ...params };

                return result;
            },
            { disconnects: [], params: {} }
        ) as Res;

        if (preAuth.disconnects.length) {
            const quote = insideDoWhen ? `\\"` : `"`;
            res.disconnects.push(`WITH ${[...withVars, _varName, relVarName].join(", ")}`);
            res.disconnects.push(
                `CALL apoc.util.validate(NOT(${preAuth.disconnects.join(
                    " AND "
                )}), ${quote}${AUTH_FORBIDDEN_ERROR}${quote}, [0])`
            );
            res.params = { ...res.params, ...preAuth.params };
        }

        /* 
           Replace with subclauses https://neo4j.com/developer/kb/conditional-cypher-execution/
           https://neo4j.slack.com/archives/C02PUHA7C/p1603458561099100 
        */
        res.disconnects.push(`FOREACH(_ IN CASE ${_varName} WHEN NULL THEN [] ELSE [1] END | `);
        res.disconnects.push(`DELETE ${_varName}_rel`);
        res.disconnects.push(`)`); // close FOREACH

        if (disconnect.disconnect) {
            const disconnects = (Array.isArray(disconnect.disconnect)
                ? disconnect.disconnect
                : [disconnect.disconnect]) as any[];

            disconnects.forEach((c) => {
                const reduced = Object.entries(c).reduce(
                    (r: Res, [k, v]) => {
                        const relField = refNode.relationFields.find((x) => k.startsWith(x.fieldName));
                        let newRefNode: Node;

                        if (relationField.union) {
                            const [modelName] = k.split(`${relationField.fieldName}_`).join("").split("_");
                            newRefNode = context.neoSchema.nodes.find((x) => x.name === modelName) as Node;
                        } else {
                            newRefNode = context.neoSchema.nodes.find(
                                (x) => x.name === (relField as RelationField).typeMeta.name
                            ) as Node;
                        }

                        const recurse = createDisconnectAndParams({
                            withVars: [...withVars, _varName],
                            value: v,
                            varName: `${_varName}_${k}`,
                            relationField: relField as RelationField,
                            parentVar: _varName,
                            context,
                            refNode: newRefNode as Node,
                            parentNode: refNode,
                        });
                        r.disconnects.push(recurse[0]);
                        r.params = { ...r.params, ...recurse[1] };

                        return r;
                    },
                    { disconnects: [], params: {} }
                ) as Res;

                res.disconnects.push(reduced.disconnects.join("\n"));
                res.params = { ...res.params, ...reduced.params };
            });
        }

        const postAuth = [parentNode, refNode].reduce(
            (result: Res, node, i) => {
                if (!node.auth) {
                    return result;
                }

                const [str, params] = createAuthAndParams({
                    entity: node,
                    operation: "disconnect",
                    context,
                    escapeQuotes: Boolean(insideDoWhen),
                    skipRoles: true,
                    skipIsAuthenticated: true,
                    bind: { parentNode: node, varName: _varName, chainStr: `${_varName}${node.name}${i}_bind` },
                });

                if (!str) {
                    return result;
                }

                result.disconnects.push(str);
                result.params = { ...result.params, ...params };

                return result;
            },
            { disconnects: [], params: {} }
        ) as Res;

        if (postAuth.disconnects.length) {
            const quote = insideDoWhen ? `\\"` : `"`;
            res.disconnects.push(`WITH ${[...withVars, _varName].join(", ")}`);
            res.disconnects.push(
                `CALL apoc.util.validate(NOT(${postAuth.disconnects.join(
                    " AND "
                )}), ${quote}${AUTH_FORBIDDEN_ERROR}${quote}, [0])`
            );
            res.params = { ...res.params, ...postAuth.params };
        }

        return res;
    }

    const { disconnects, params } = ((relationField.typeMeta.array ? value : [value]) as any[]).reduce(reducer, {
        disconnects: [],
        params: {},
    });

    return [disconnects.join("\n"), params];
}

export default createDisconnectAndParams;
