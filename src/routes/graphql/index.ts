import depthLimit from 'graphql-depth-limit';
import { graphql, parse, validate } from 'graphql';
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { schema } from './schema-graphql/schema.graphql.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req, reply) {
      const { query, variables } = req.body;

      try {
        const graphqlErrors = validate(schema, parse(query), [depthLimit(5)]);

        if (graphqlErrors.length) {
          return reply.code(400).send({ errors: graphqlErrors });
        }

        const result = await graphql({
          schema,
          source: query,
          variableValues: variables,
          contextValue: { prisma },
        });

        if (result.errors) {
          return reply.code(400).send({ errors: result.errors });
        }

        return reply.send(result);
      } catch {
        return reply.code(500).send({
          errors: [{ message: 'Internal server error' }],
        });
      }
    },
  });
};

export default plugin;
