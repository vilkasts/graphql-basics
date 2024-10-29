import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLList,
  GraphQLSchema,
  GraphQLOutputType,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { MemberTypeId } from '../member-types/schemas.js';
import {
  PrismaClient,
  User as PrismaUser,
  Profile as PrismaProfile,
} from '@prisma/client';

const MemberTypeIdEnum = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: { value: MemberTypeId.BASIC },
    BUSINESS: { value: MemberTypeId.BUSINESS },
  },
});

const MemberType = new GraphQLObjectType({
  name: 'Member',
  fields: () => ({
    id: { type: new GraphQLNonNull(MemberTypeIdEnum) },
    discount: { type: new GraphQLNonNull(GraphQLFloat) },
    postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});

const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    memberType: {
      type: new GraphQLNonNull(MemberType),
      async resolve(parent: PrismaProfile, _, context: { prisma: PrismaClient }) {
        return context.prisma.memberType.findUnique({
          where: { id: parent.memberTypeId },
        });
      },
    },
  }),
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: {
      type: ProfileType,
      async resolve(parent: PrismaUser, _, context: { prisma: PrismaClient }) {
        return context.prisma.profile.findUnique({
          where: { userId: parent.id },
        });
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostType))),
      async resolve(parent: PrismaUser, _, context: { prisma: PrismaClient }) {
        return context.prisma.post.findMany({
          where: { authorId: parent.id },
        });
      },
    },
    userSubscribedTo: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      async resolve(parent: PrismaUser, _, context: { prisma: PrismaClient }) {
        return context.prisma.user.findMany({
          where: {
            subscribedToUser: {
              some: {
                subscriberId: parent.id,
              },
            },
          },
          include: {
            subscribedToUser: true,
          },
        });
      },
    },
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      async resolve(parent: PrismaUser, _, context: { prisma: PrismaClient }) {
        return context.prisma.user.findMany({
          where: {
            userSubscribedTo: {
              some: {
                authorId: parent.id,
              },
            },
          },
          include: {
            userSubscribedTo: true,
          },
        });
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    memberTypes: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MemberType))),
      resolve(_, __, context: { prisma: PrismaClient }) {
        return context.prisma.memberType.findMany();
      },
    },
    memberType: {
      type: MemberType,
      args: {
        id: { type: new GraphQLNonNull(MemberTypeIdEnum) },
      },
      async resolve(_, args: { id: MemberTypeId }, context: { prisma: PrismaClient }) {
        const memberType = await context.prisma.memberType.findUnique({
          where: { id: args.id },
        });

        if (!memberType) {
          return null;
        }

        return memberType;
      },
    },
    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(UserType))),
      resolve(_, __, context: { prisma: PrismaClient }) {
        return context.prisma.user.findMany();
      },
    },
    user: {
      type: UserType as GraphQLOutputType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      async resolve(_, args: { id: string }, context: { prisma: PrismaClient }) {
        const user = await context.prisma.user.findUnique({
          where: { id: args.id },
          include: {
            profile: {
              include: {
                memberType: true,
              },
            },
            posts: true,
          },
        });

        if (!user) {
          return null;
        }

        return user;
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(PostType))),
      resolve(_, __, context: { prisma: PrismaClient }) {
        return context.prisma.post.findMany();
      },
    },
    post: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      async resolve(_, args: { id: string }, context: { prisma: PrismaClient }) {
        const post = await context.prisma.post.findUnique({
          where: { id: args.id },
        });

        if (!post) {
          return null;
        }

        return post;
      },
    },
    profiles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ProfileType))),
      resolve(_, __, context: { prisma: PrismaClient }) {
        return context.prisma.profile.findMany();
      },
    },
    profile: {
      type: ProfileType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      async resolve(_, args: { id: string }, context: { prisma: PrismaClient }) {
        const profile = await context.prisma.profile.findUnique({
          where: { id: args.id },
        });

        if (!profile) {
          return null;
        }

        return profile;
      },
    },
  },
});

const schema = new GraphQLSchema({
  query: RootQuery,
});

export { schema };
