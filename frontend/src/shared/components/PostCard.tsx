import { useMemo, useState } from 'react';
import type { FeedComment, FeedPost } from '../../api/client';

interface PostCardProps {
  post: FeedPost;
  comments: FeedComment[];
  canComment: boolean;
  onToggleLike: (post: FeedPost) => Promise<void>;
  onOpenComments: (postId: number) => Promise<void>;
  onSendComment: (postId: number, text: string) => Promise<void>;
}

function formatRelative(dateValue: string) {
  const date = new Date(dateValue);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return 'Baru saja';
  if (diffHours < 24) return `${diffHours} jam lalu`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} hari lalu`;

  return date.toLocaleDateString('id-ID');
}

export default function PostCard({ post, comments, canComment, onToggleLike, onOpenComments, onSendComment }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const roleLabel = useMemo(() => post.role_creator.toUpperCase(), [post.role_creator]);

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await onSendComment(post.id, commentText.trim());
      setCommentText('');
      setShowComments(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <article className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-100">{post.author_name}</p>
          <p className="text-xs uppercase tracking-wide text-cyan-300">{roleLabel}</p>
        </div>
        <span className="text-xs text-slate-400">{formatRelative(post.created_at)}</span>
      </div>

      {post.image_url ? (
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-700">
          <img src={post.image_url} alt={post.title || 'Post image'} className="h-64 w-full object-cover" loading="lazy" />
        </div>
      ) : null}

      {post.title ? <h3 className="mt-3 text-sm font-semibold text-slate-100">{post.title}</h3> : null}
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{post.caption}</p>

      <div className="mt-4 flex items-center gap-3 text-sm">
        <button
          onClick={() => void onToggleLike(post)}
          className={`rounded-lg border px-3 py-1.5 transition ${
            post.liked_by_me
              ? 'border-rose-400/40 bg-rose-500/10 text-rose-200'
              : 'border-slate-700 text-slate-300 hover:border-slate-500'
          }`}
        >
          ❤️ {post.likes_count}
        </button>
        <button
          onClick={() => {
            void onOpenComments(post.id);
            setShowComments((prev) => !prev);
          }}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300 transition hover:border-slate-500"
        >
          💬 {post.comments_count}
        </button>
      </div>

      {showComments ? (
        <div className="mt-3 space-y-2 rounded-xl border border-slate-700 bg-slate-950/70 p-3">
          {comments.length === 0 ? <p className="text-xs text-slate-400">Belum ada komentar.</p> : null}
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-lg border border-slate-700/70 bg-slate-900/60 px-2.5 py-2">
              <p className="text-xs font-semibold text-cyan-200">{comment.user_name}</p>
              <p className="mt-1 text-sm text-slate-200">{comment.comment}</p>
            </div>
          ))}

          {canComment ? (
            <div className="flex items-center gap-2 pt-1">
              <input
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Tulis komentar..."
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
              <button
                onClick={() => void handleSubmitComment()}
                disabled={submitting}
                className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-200 disabled:opacity-60"
              >
                Kirim
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
