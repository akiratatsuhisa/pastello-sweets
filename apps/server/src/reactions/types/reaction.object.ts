import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Comment } from 'src/comments/types';
import { BaseNode, EntityName } from 'src/graphql/models';
import { Entity, EntityUnion } from 'src/graphql/models/entity.interface';
import { Post } from 'src/posts/types';
import { User } from 'src/users/types';

import { Type } from './type.enum';

@ObjectType({
  implements: () => [BaseNode, Entity],
})
export class Reaction implements BaseNode, Entity {
  id: bigint;

  entityName: EntityName;

  entityId: bigint;

  @Field(() => EntityUnion, { nullable: true })
  entity?: Post | Comment;

  @Field(() => Int, { nullable: true })
  rating?: number;

  @Field(() => Type, { nullable: true })
  type?: Type;

  createdBy: string;

  createdUser: User;

  createdAt: Date;

  updatedBy: string;

  updatedUser: User;

  updatedAt: Date;
}
