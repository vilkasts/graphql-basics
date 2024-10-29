import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql } from 'graphql';
import { schema } from './schema.graphql.js';
import depthLimit from 'graphql-depth-limit';

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
    async handler(req) {
      const { query, variables } = req.body;

      try {
        const result = await graphql({
          schema,
          source: query,
          variableValues: variables,
          contextValue: { prisma },
          // TODO fix and remove after
          // @ts-ignore
          validationRules: [depthLimit(5)],
        });

        if (result.errors) {
          return { errors: result.errors };
        } else {
          return result;
        }
      } catch {
        return {
          errors: [{ message: 'Internal server error' }],
        };
      }
    },
  });
};

export default plugin;
