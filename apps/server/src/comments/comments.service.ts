import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { IdentityUser } from 'src/auth/identity.class';
import { DataLoaderService } from 'src/data-loader/data-loader.service';
import { FilterProps } from 'src/data-loader/data-loader.types';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { EntityName } from 'src/graphql/models';
import { comments, tagRelationships } from 'src/schema';

import { Comment, CreateComment, UpdateComment } from './types';

@Injectable()
export class CommentsService {
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly dataLoaderService: DataLoaderService,
  ) {}

  async loadCommentById(id: bigint) {
    const dataLoader = this.dataLoaderService.getDataLoader<
      FilterProps,
      bigint,
      Comment
    >({ __key: 'loadCommentById' }, async (keys) => {
      const result = await this.drizzleService.db
        .select()
        .from(comments)
        .where(inArray(comments.id, [...keys]))
        .execute();

      const mapResult = result.reduce((map, result) => {
        map.set(result.id, result as Comment);
        return map;
      }, new Map<bigint, Comment>());

      return keys.map((key) => mapResult.get(key));
    });

    return dataLoader.load(id);
  }

  async loadCommentsByTagId(tagId: bigint) {
    const dataLoader = this.dataLoaderService.getDataLoader<
      FilterProps,
      bigint,
      Array<Comment>
    >({ __key: 'loadCommentsByTagId' }, async (keys) => {
      const result = await this.drizzleService.db
        .select({
          id: comments.id,
          postId: comments.postId,
          parentId: comments.parentId,
          content: comments.content,
          createdBy: comments.createdBy,
          createdAt: comments.createdAt,
          updatedBy: comments.updatedBy,
          updatedAt: comments.updatedAt,
          tagId: tagRelationships.tagId,
        })
        .from(comments)
        .leftJoin(
          tagRelationships,
          and(
            eq(tagRelationships.entityName, EntityName.COMMENT),
            eq(tagRelationships.entityId, comments.id),
          ),
        )
        .where(inArray(tagRelationships.tagId, [...keys]))
        .execute();

      const mapResult = result.reduce((map, result) => {
        if (map.has(result.tagId)) {
          map.get(result.tagId).push(result as unknown as Comment);
        } else {
          map.set(result.tagId, [result as unknown as Comment]);
        }
        return map;
      }, new Map<bigint, Array<Comment>>());

      return keys.map((key) => mapResult.get(key) ?? []);
    });

    return dataLoader.load(tagId);
  }

  async loadCommentsByPostId(postId: bigint) {
    const dataLoader = this.dataLoaderService.getDataLoader<
      FilterProps,
      bigint,
      Array<Comment>
    >({ __key: 'loadCommentsByPostId' }, async (keys) => {
      const result = await this.drizzleService.db
        .select()
        .from(comments)
        .where(
          and(isNull(comments.parentId), inArray(comments.postId, [...keys])),
        )
        .execute();

      const mapResult = result.reduce((map, result) => {
        if (map.has(result.postId)) {
          map.get(result.postId).push(result as Comment);
        } else {
          map.set(result.postId, [result as Comment]);
        }
        return map;
      }, new Map<bigint, Array<Comment>>());

      return keys.map((key) => mapResult.get(key) ?? []);
    });

    return dataLoader.load(postId);
  }

  async loadParent(id: bigint) {
    const dataLoader = this.dataLoaderService.getDataLoader<
      FilterProps,
      bigint,
      Comment
    >({ __key: 'loadParent' }, async (keys) => {
      const result = await this.drizzleService.db
        .select()
        .from(comments)
        .where(inArray(comments.id, [...keys]))
        .execute();

      const mapResult = result.reduce((map, result) => {
        map.set(result.id, result as Comment);
        return map;
      }, new Map<bigint, Comment>());

      return keys.map((key) => mapResult.get(key) ?? null);
    });

    return dataLoader.load(id);
  }

  async loadChildren(id: bigint) {
    const dataLoader = this.dataLoaderService.getDataLoader<
      FilterProps,
      bigint,
      Array<Comment>
    >({ __key: 'loadChildren' }, async (keys) => {
      const result = await this.drizzleService.db
        .select()
        .from(comments)
        .where(inArray(comments.parentId, [...keys]))
        .execute();

      const mapResult = result.reduce((map, result) => {
        if (map.has(result.parentId)) {
          map.get(result.parentId).push(result as Comment);
        } else {
          map.set(result.parentId, [result as Comment]);
        }
        return map;
      }, new Map<bigint, Array<Comment>>());

      return keys.map((key) => mapResult.get(key) ?? []);
    });

    return dataLoader.load(id);
  }

  async findAll() {
    const result = await this.drizzleService.db
      .select()
      .from(comments)
      .orderBy(comments.id)
      .execute();

    return result;
  }

  async findById(id: bigint) {
    const [result] = await this.drizzleService.db
      .select()
      .from(comments)
      .where(eq(comments.id, id))
      .execute();

    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }

  async create(data: CreateComment, user: IdentityUser) {
    const [result] = await this.drizzleService.db
      .insert(comments)
      .values({
        ...data,
        ...this.drizzleService.createFields(user),
      })
      .returning()
      .execute();

    return result;
  }

  async update(id: bigint, data: UpdateComment, user: IdentityUser) {
    const [result] = await this.drizzleService.db
      .update(comments)
      .set({
        ...data,
        ...this.drizzleService.updatedFields(user),
      })
      .where(eq(comments.id, id))
      .returning()
      .execute();

    return result;
  }

  async delete(id: bigint) {
    const [result] = await this.drizzleService.db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning()
      .execute();

    return result;
  }
}
