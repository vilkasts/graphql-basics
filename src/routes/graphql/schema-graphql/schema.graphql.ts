import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
  GraphQLSchema,
  GraphQLOutputType,
} from 'graphql';
import { UUIDType } from '../types/uuid.js';
import { MemberTypeId } from '../../member-types/schemas.js';
import {
  PrismaClient,
  User as PrismaUser,
  Post as PrismaPost,
  Profile as PrismaProfile,
} from '@prisma/client';
import {
  MemberTypeIdEnum,
  PostType,
  UserType,
  ProfileType,
  MemberType,
} from './query.graphql.js';
import {
  ChangePostInputType,
  ChangeProfileInputType,
  ChangeUserInputType,
  CreatePostInputType,
  CreateProfileInputType,
  CreateUserInputType,
} from './mutation.graphql.js';

const RootQueryType = new GraphQLObjectType({
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

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createUser: {
      type: new GraphQLNonNull(UserType),
      args: {
        dto: { type: new GraphQLNonNull(CreateUserInputType) },
      },
      async resolve(_, args: { dto: PrismaUser }, context: { prisma: PrismaClient }) {
        return context.prisma.user.create({
          data: args.dto,
        });
      },
    },

    createProfile: {
      type: new GraphQLNonNull(ProfileType),
      args: {
        dto: { type: new GraphQLNonNull(CreateProfileInputType) },
      },
      async resolve(_, args: { dto: PrismaProfile }, context: { prisma: PrismaClient }) {
        return context.prisma.profile.create({
          data: args.dto,
        });
      },
    },

    createPost: {
      type: new GraphQLNonNull(PostType),
      args: {
        dto: { type: new GraphQLNonNull(CreatePostInputType) },
      },
      async resolve(_, args: { dto: PrismaPost }, context: { prisma: PrismaClient }) {
        return context.prisma.post.create({
          data: args.dto,
        });
      },
    },

    changePost: {
      type: new GraphQLNonNull(PostType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangePostInputType) },
      },
      async resolve(
        _,
        args: { id: string; dto: PrismaPost },
        context: { prisma: PrismaClient },
      ) {
        return context.prisma.post.update({
          where: { id: args.id },
          data: args.dto,
        });
      },
    },

    changeProfile: {
      type: new GraphQLNonNull(ProfileType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeProfileInputType) },
      },
      async resolve(
        _,
        args: { id: string; dto: PrismaProfile },
        context: { prisma: PrismaClient },
      ) {
        return context.prisma.profile.update({
          where: { id: args.id },
          data: args.dto,
        });
      },
    },

    changeUser: {
      type: new GraphQLNonNull(UserType),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeUserInputType) },
      },
      async resolve(
        _,
        args: { id: string; dto: PrismaUser },
        context: { prisma: PrismaClient },
      ) {
        return context.prisma.user.update({
          where: { id: args.id },
          data: args.dto,
        });
      },
    },

    deleteUser: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      async resolve(_, args: { id: string }, context: { prisma: PrismaClient }) {
        await context.prisma.user.delete({
          where: { id: args.id },
        });

        return 'Deleted';
      },
    },

    deletePost: {
      type: GraphQLString,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      async resolve(_, args: { id: string }, context: { prisma: PrismaClient }) {
        await context.prisma.post.delete({
          where: { id: args.id },
        });

        return 'Deleted';
      },
    },

    deleteProfile: {
      type: GraphQLString,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      async resolve(_, args: { id: string }, context: { prisma: PrismaClient }) {
        await context.prisma.profile.delete({
          where: { id: args.id },
        });

        return 'Deleted';
      },
    },

    subscribeTo: {
      type: GraphQLString,
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      async resolve(
        _,
        args: { userId: string; authorId: string },
        context: { prisma: PrismaClient },
      ) {
        await context.prisma.subscribersOnAuthors.create({
          data: {
            subscriberId: args.userId,
            authorId: args.authorId,
          },
        });

        return 'Subscribed';
      },
    },

    unsubscribeFrom: {
      type: GraphQLString,
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      async resolve(
        _,
        args: { userId: string; authorId: string },
        context: { prisma: PrismaClient },
      ) {
        await context.prisma.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: {
              subscriberId: args.userId,
              authorId: args.authorId,
            },
          },
        });

        return 'Unsubscribed';
      },
    },
  },
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: Mutation,
});

export { schema };
