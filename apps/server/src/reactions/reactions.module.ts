import { forwardRef, Module } from '@nestjs/common';
import { CommentsModule } from 'src/comments/comments.module';
import { PostsModule } from 'src/posts/posts.module';

import { ReactionsResolver } from './reactions.resolver';
import { ReactionsService } from './reactions.service';

@Module({
  imports: [forwardRef(() => PostsModule), forwardRef(() => CommentsModule)],
  providers: [ReactionsResolver, ReactionsService],
  exports: [ReactionsService],
})
export class ReactionsModule {}
